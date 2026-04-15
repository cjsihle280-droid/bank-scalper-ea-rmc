@echo off
REM MT5 Bridge Setup Script for Windows
REM Run this as Administrator

echo 🚀 Setting up MT5 Bridge for BANK SCALPER EA
echo ==============================================

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.11+ from https://python.org
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate and install dependencies
echo 📦 Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check MT5 installation
echo 🔍 Checking for MetaTrader 5...
if exist "C:\Program Files\MetaTrader 5\terminal64.exe" (
    echo ✅ MT5 found in Program Files
) else if exist "C:\Program Files (x86)\MetaTrader 5\terminal64.exe" (
    echo ✅ MT5 found in Program Files (x86)
) else (
    echo ⚠️  MT5 not found. Please install MT5 from:
    echo    https://www.metatrader5.com/en/download
    echo.
    echo After installation, run this script again.
    echo Press any key to open download page...
    pause >nul
    start https://www.metatrader5.com/en/download
    exit /b 1
)

REM Create logs directory
if not exist logs mkdir logs

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment configuration...
    echo # MT5 Bridge Configuration > .env
    echo # Edit these values with your MT5 account details >> .env
    echo MT5_ACCOUNT=your_account_number >> .env
    echo MT5_PASSWORD=your_password >> .env
    echo MT5_SERVER=your_broker_server >> .env
    echo API_KEY=your_secure_api_key >> .env
    echo BRIDGE_HOST=0.0.0.0 >> .env
    echo BRIDGE_PORT=8000 >> .env
    echo LOG_LEVEL=INFO >> .env
    echo LOG_FILE=logs/mt5_bridge.log >> .env
    echo.
    echo 📝 Created .env file. Please edit it with your MT5 credentials.
)

echo ✅ Setup completed successfully!
echo.
echo 🎯 Next steps:
echo 1. Edit the .env file with your MT5 account details
echo 2. Run: python main.py
echo 3. Test the bridge at: http://localhost:8000/health
echo 4. Update your React app bridge URL to: http://localhost:8000
echo.
echo 🌐 For cloud deployment, see CLOUD_DEPLOYMENT.md
echo.
echo Press any key to start the bridge...
pause >nul

REM Start the bridge
echo 🚀 Starting MT5 Bridge...
python main.py