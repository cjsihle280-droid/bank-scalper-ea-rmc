from typing import Optional
import os
import logging
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

import MetaTrader5 as mt5

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('LOG_FILE', 'logs/mt5_bridge.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()
API_KEY = os.getenv('API_KEY')

app = FastAPI(
    title="MT5 Bridge",
    description="Cloud MT5 Trading Bridge API",
    version="2.0.0"
)

# Security dependency
def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if API_KEY and credentials.credentials != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return credentials.credentials

class ConnectRequest(BaseModel):
    account: str = Field(..., description="MT5 account number")
    password: str = Field(..., description="MT5 account password")
    server: str = Field(..., description="MT5 broker server name")

class TradeRequest(BaseModel):
    account: str = Field(..., description="MT5 account number")
    password: str = Field(..., description="MT5 account password")
    server: str = Field(..., description="MT5 broker server name")
    symbol: str = Field(..., description="Trading symbol, e.g. EURUSD")
    direction: str = Field(..., pattern="^(BUY|SELL)$")
    lot_size: float = Field(..., gt=0)
    sl_pips: int = Field(..., ge=1)
    tp_pips: int = Field(..., ge=1)
    comment: Optional[str] = Field("BANK SCALPER EA", description="Order comment")

class TradeResponse(BaseModel):
    success: bool
    message: str
    order_id: Optional[int] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


def initialize_mt5():
    logger.info("Initializing MT5...")
    if not mt5.initialize():
        error = mt5.last_error()
        logger.error(f"MT5 initialize failed: {error.code} - {error.comment}")
        raise HTTPException(status_code=500, detail=f"MT5 initialize failed: {error.code} - {error.comment}")
    logger.info("MT5 initialized successfully")


def ensure_login(account: str, password: str, server: str) -> None:
    account_int = int(account)
    logger.info(f"Ensuring login for account {account_int} on server {server}")

    if mt5.account_info() is not None:
        info = mt5.account_info()
        if info and info.login == account_int and info.server == server:
            logger.info("Already logged in to correct account")
            return

    logger.info("Logging in to MT5...")
    mt5.shutdown()
    initialize_mt5()
    if not mt5.login(account_int, password, server=server):
        error = mt5.last_error()
        logger.error(f"MT5 login failed: {error.code} - {error.comment}")
        raise HTTPException(status_code=401, detail=f"MT5 login failed: {error.code} - {error.comment}")
    logger.info(f"Successfully logged in to account {account_int}")


def pips_to_price(symbol: str, pips: int) -> float:
    info = mt5.symbol_info(symbol)
    if info is None:
        raise HTTPException(status_code=400, detail=f"Symbol not found: {symbol}")

    if not info.visible and not mt5.symbol_select(symbol, True):
        raise HTTPException(status_code=400, detail=f"Unable to select symbol: {symbol}")

    pip_size = info.point * (10 if info.digits > 3 else 1)
    return pips * pip_size


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        mt5_version = mt5.version()
        return {
            "status": "ok",
            "mt5_version": mt5_version,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@app.post("/connect")
async def connect_account(payload: ConnectRequest, api_key: str = Depends(verify_api_key)):
    """Connect and login to MT5 account"""
    logger.info(f"Connect request for account {payload.account}")
    try:
        ensure_login(payload.account, payload.password, payload.server)
        account_info = mt5.account_info()
        if account_info is None:
            raise HTTPException(status_code=500, detail="Connected to MT5 but account info is unavailable")

        logger.info(f"Successfully connected to account {account_info.login}")
        return {
            "success": True,
            "message": f"Connected to account {account_info.login} on {account_info.server}",
            "account_info": {
                "login": account_info.login,
                "server": account_info.server,
                "balance": account_info.balance,
                "currency": account_info.currency
            }
        }
    except Exception as e:
        logger.error(f"Connect failed: {e}")
        raise


@app.post("/trade", response_model=TradeResponse)
async def place_trade(payload: TradeRequest, api_key: str = Depends(verify_api_key)):
    """Place a trade order"""
    logger.info(f"Trade request: {payload.symbol} {payload.direction} {payload.lot_size} lots")

    try:
        ensure_login(payload.account, payload.password, payload.server)

        symbol = payload.symbol.upper()
        info = mt5.symbol_info(symbol)
        if info is None:
            raise HTTPException(status_code=400, detail=f"Symbol not found: {symbol}")
        if not info.visible and not mt5.symbol_select(symbol, True):
            raise HTTPException(status_code=400, detail=f"Unable to select symbol: {symbol}")

        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            raise HTTPException(status_code=500, detail=f"Unable to get market tick for {symbol}")

        price = tick.ask if payload.direction == "BUY" else tick.bid
        sl_price = price - pips_to_price(symbol, payload.sl_pips) if payload.direction == "BUY" else price + pips_to_price(symbol, payload.sl_pips)
        tp_price = price + pips_to_price(symbol, payload.tp_pips) if payload.direction == "BUY" else price - pips_to_price(symbol, payload.tp_pips)

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": payload.lot_size,
            "type": mt5.ORDER_TYPE_BUY if payload.direction == "BUY" else mt5.ORDER_TYPE_SELL,
            "price": price,
            "sl": round(sl_price, info.digits),
            "tp": round(tp_price, info.digits),
            "deviation": 20,
            "magic": 123456,
            "comment": payload.comment,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        logger.info(f"Sending order: {request}")
        result = mt5.order_send(request)
        if result is None:
            raise HTTPException(status_code=500, detail="MT5 order_send returned no response")
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Order failed: {result.retcode} - {result.comment}")
            raise HTTPException(status_code=500, detail=f"Order failed ({result.retcode}): {result.comment}")

        logger.info(f"Order placed successfully: {result.order}")
        return TradeResponse(
            success=True,
            message="Order placed successfully",
            order_id=result.order
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trade execution failed: {e}")
        raise HTTPException(status_code=500, detail=f"Trade execution failed: {str(e)}")


@app.get("/price/{symbol}")
async def get_price(symbol: str, api_key: str = Depends(verify_api_key)):
    """Get current market price for a symbol"""
    logger.info(f"Price request for symbol: {symbol}")
    try:
        # Initialize MT5 if not already done
        if not mt5.initialize():
            raise HTTPException(status_code=500, detail="MT5 not initialized")

        symbol = symbol.upper()
        if not mt5.symbol_select(symbol, True):
            raise HTTPException(status_code=400, detail=f"Symbol not available: {symbol}")

        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            raise HTTPException(status_code=500, detail=f"Unable to get price for {symbol}")

        return {
            "symbol": symbol,
            "bid": tick.bid,
            "ask": tick.ask,
            "spread": tick.ask - tick.bid,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Price request failed: {e}")
        raise HTTPException(status_code=500, detail=f"Price request failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    import os
    from dotenv import load_dotenv

    # Load environment variables
    load_dotenv()

    host = os.getenv('BRIDGE_HOST', '0.0.0.0')
    port = int(os.getenv('BRIDGE_PORT', 8000))

    logger.info(f"Starting MT5 Bridge on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )
