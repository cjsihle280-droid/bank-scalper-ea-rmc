#Requires -Version 5.1
# MT5 Bridge Setup Script for Windows
# Run as Administrator

param(
    [switch]$SkipMT5Check,
    [switch]$StartBridge
)

Write-Host "🚀 Setting up MT5 Bridge for BANK SCALPER EA" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Please run this script as Administrator" -ForegroundColor Yellow
    Write-Host "Right-click the script and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Check Python installation
Write-Host "🐍 Checking Python installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Installing..." -ForegroundColor Red
    Write-Host "Downloading Python 3.11..." -ForegroundColor Yellow

    try {
        $pythonUrl = "https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe"
        $installerPath = "$env:TEMP\python-installer.exe"
        Invoke-WebRequest -Uri $pythonUrl -OutFile $installerPath

        Write-Host "Installing Python (this may take a few minutes)..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait

        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Write-Host "✅ Python installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Python automatically" -ForegroundColor Red
        Write-Host "Please download and install Python 3.11+ from: https://python.org" -ForegroundColor Yellow
        Start-Process "https://python.org/downloads/"
        Read-Host "Press Enter after installing Python"
        exit 1
    }
}

# Create virtual environment
Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
try {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create virtual environment: $_" -ForegroundColor Red
    exit 1
}

# Activate virtual environment and install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    & ".\venv\Scripts\Activate.ps1"
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

# Check MT5 installation
if (-not $SkipMT5Check) {
    Write-Host "🔍 Checking MetaTrader 5 installation..." -ForegroundColor Cyan

    $mt5Paths = @(
        "C:\Program Files\MetaTrader 5\terminal64.exe",
        "C:\Program Files (x86)\MetaTrader 5\terminal64.exe",
        "${env:ProgramFiles}\MetaTrader 5\terminal64.exe",
        "${env:ProgramFiles(x86)}\MetaTrader 5\terminal64.exe"
    )

    $mt5Found = $false
    foreach ($path in $mt5Paths) {
        if (Test-Path $path) {
            Write-Host "✅ MT5 found at: $path" -ForegroundColor Green
            $mt5Found = $true
            break
        }
    }

    if (-not $mt5Found) {
        Write-Host "⚠️  MetaTrader 5 not found!" -ForegroundColor Yellow
        Write-Host "Please download and install MT5 from:" -ForegroundColor White
        Write-Host "https://www.metatrader5.com/en/download" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After installation:" -ForegroundColor White
        Write-Host "1. Open MT5 and log in to your broker account" -ForegroundColor White
        Write-Host "2. Run this setup script again" -ForegroundColor White
        Write-Host ""
        Start-Process "https://www.metatrader5.com/en/download"
        Read-Host "Press Enter to continue after installing MT5"
        exit 1
    }
}

# Create logs directory
Write-Host "📁 Creating logs directory..." -ForegroundColor Cyan
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}
Write-Host "✅ Logs directory created" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host "📝 Setting up configuration..." -ForegroundColor Cyan
if (!(Test-Path ".env")) {
    @"
# MT5 Bridge Configuration
# Edit these values with your MT5 account details

# MT5 Account Credentials
MT5_ACCOUNT=your_account_number
MT5_PASSWORD=your_password
MT5_SERVER=your_broker_server

# Security (optional)
API_KEY=your_secure_api_key

# Bridge Configuration
BRIDGE_HOST=0.0.0.0
BRIDGE_PORT=8000

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/mt5_bridge.log

# MT5 Configuration
MT5_TIMEOUT=5000
MT5_MAX_RETRIES=3
"@ | Out-File -FilePath ".env" -Encoding UTF8

    Write-Host "✅ Created .env configuration file" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit the .env file with your MT5 credentials!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""

if (-not $StartBridge) {
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. ✏️  Edit the .env file with your MT5 account details" -ForegroundColor White
    Write-Host "2. 🚀 Run: .\venv\Scripts\activate.ps1; python main.py" -ForegroundColor White
    Write-Host "3. 🧪 Test: Open http://localhost:8000/health in your browser" -ForegroundColor White
    Write-Host "4. 🔗 Update your React app bridge URL to: http://localhost:8000" -ForegroundColor White
    Write-Host ""

    $startNow = Read-Host "Would you like to start the bridge now? (y/n)"
    if ($startNow -eq 'y' -or $startNow -eq 'Y') {
        $StartBridge = $true
    }
}

if ($StartBridge) {
    Write-Host ""
    Write-Host "🚀 Starting MT5 Bridge..." -ForegroundColor Green
    Write-Host "🌐 Bridge will be available at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "🛑 Press Ctrl+C to stop the bridge" -ForegroundColor Yellow
    Write-Host ""

    try {
        & ".\venv\Scripts\Activate.ps1"
        python main.py
    } catch {
        Write-Host "❌ Failed to start bridge: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 Additional resources:" -ForegroundColor Cyan
Write-Host "• Cloud deployment guide: CLOUD_DEPLOYMENT.md" -ForegroundColor White
Write-Host "• Test the bridge: python test_bridge.py" -ForegroundColor White
Write-Host "• View logs: type logs\mt5_bridge.log" -ForegroundColor White