# 🚀 MT5 Bridge Quick Setup Guide

## Prerequisites
- Windows 10/11
- MetaTrader 5 installed (download from: https://www.metatrader5.com/en/download)
- MT5 account with a broker

## Step 1: Install MT5 (if not already installed)
1. Download MT5 from the official website
2. Install it on your computer
3. Open MT5 and log in to your broker account
4. Make sure you have a demo account for testing

## Step 2: Setup the Bridge
1. Open PowerShell as Administrator
2. Navigate to the mt5-bridge folder:
   ```powershell
   cd "C:\Users\pc\Downloads\BANK SCALPER EA\mt5-bridge"
   ```
3. Run the setup script:
   ```powershell
   .\setup.ps1
   ```

## Step 3: Configure Your Account
1. The setup script will create a `.env` file
2. Edit the `.env` file with your MT5 credentials:
   ```
   MT5_ACCOUNT=your_account_number
   MT5_PASSWORD=your_password
   MT5_SERVER=your_broker_server
   ```

## Step 4: Test the Bridge
1. Run the health check:
   ```powershell
   python test_health.py
   ```
2. You should see "MT5 Bridge is working correctly!"

## Step 5: Start Trading
1. Open your BANK SCALPER EA React app
2. Go to the MT5 Panel (bottom right section)
3. Click the settings icon (⚙️)
4. Enter your MT5 account details
5. Click "TEST CONNECTION"
6. Click "LINK MT5 ACCOUNT"
7. Generate a signal and place trades!

## Troubleshooting

### Bridge won't start
- Make sure MT5 is installed and running
- Check that the .env file has correct credentials
- Look at logs in `logs/mt5_bridge.log`

### Cannot connect to MT5
- Ensure MT5 is logged in to your account
- Check account credentials in .env file
- Verify your broker server name

### React app can't connect
- Make sure the bridge is running on localhost:8000
- Check firewall settings
- Try restarting the bridge

## Cloud Deployment (Optional)
For production use, deploy to a Windows VPS:
1. Follow the CLOUD_DEPLOYMENT.md guide
2. Update your React app bridge URL to your VPS IP
3. Use HTTPS for security

## Security Notes
- Never share your MT5 credentials
- Use demo accounts for testing
- Enable API key authentication for production
- Keep your bridge behind a firewall