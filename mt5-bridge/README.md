# MT5 Bridge

This FastAPI service provides a secure bridge for MetaTrader 5 account connection and trade execution. Supports both local and cloud deployments.

## Features

- 🔐 **Secure API**: Optional API key authentication
- 📊 **Health Monitoring**: Built-in health checks and logging
- ☁️ **Cloud Ready**: Docker, systemd, and cloud provider support
- 🪟 **Windows/Linux**: Cross-platform compatibility
- 📝 **Comprehensive Logging**: Detailed request/response logging

## Requirements

### Local Development
- Python 3.11+
- MetaTrader 5 installed locally

### Cloud Deployment
- Windows VPS (AWS EC2, Azure VM, etc.) OR
- Linux VPS with Wine (experimental)
- MT5 installed in the environment

## Quick Start (Local)

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the bridge
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Cloud Deployment

### Option 1: Windows VPS (Recommended)

1. **Launch Windows VPS** (AWS EC2 Windows, Azure VM, DigitalOcean)
2. **Connect via RDP** and install requirements:
   ```powershell
   # Run the startup script
   .\start-bridge.ps1
   ```
3. **Install MT5** from [official site](https://www.metatrader5.com/en/download)
4. **Configure your broker account** in MT5

### Option 2: Linux with Wine (Experimental)

```bash
# Run deployment script
sudo ./deploy.sh
```

### Option 3: Docker (Experimental)

```bash
# Build and run
docker-compose up -d
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```env
# MT5 Credentials
MT5_ACCOUNT=your_account_number
MT5_PASSWORD=your_password
MT5_SERVER=your_broker_server

# Security
API_KEY=your_secure_api_key

# Application
BRIDGE_HOST=0.0.0.0
BRIDGE_PORT=8000
LOG_LEVEL=INFO
LOG_FILE=logs/mt5_bridge.log
```

## API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "mt5_version": [5, 0, 0, 0],
  "timestamp": "2024-01-01T12:00:00"
}
```

### Connect Account
```http
POST /connect
Authorization: Bearer your_api_key
Content-Type: application/json

{
  "account": "1234567",
  "password": "your-password",
  "server": "YourBroker-Demo"
}
```

### Place Trade
```http
POST /trade
Authorization: Bearer your_api_key
Content-Type: application/json

{
  "account": "1234567",
  "password": "your-password",
  "server": "YourBroker-Demo",
  "symbol": "EURUSD",
  "direction": "BUY",
  "lot_size": 0.01,
  "sl_pips": 20,
  "tp_pips": 40,
  "comment": "BANK SCALPER EA"
}
```

## Security Best Practices

- **Always use HTTPS** in production
- **Enable API key authentication**
- **Use environment variables** for sensitive data
- **Restrict network access** to necessary IPs only
- **Regular credential rotation**
- **Monitor logs** for suspicious activity

## Troubleshooting

### Common Issues

1. **MT5 Connection Failed**
   - Ensure MT5 is running and logged in
   - Check account credentials
   - Verify broker server name

2. **Port Already in Use**
   - Change port in environment or command
   - Check for other services using port 8000

3. **Wine Compatibility Issues** (Linux)
   - MT5 in Wine may have stability issues
   - Consider Windows VPS for production

### Logs
- **Application logs**: Check `logs/mt5_bridge.log`
- **System logs**: `journalctl -u mt5-bridge` (Linux) or Event Viewer (Windows)

## Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black .
isort .
```

## License

Proprietary - BANK SCALPER EA
