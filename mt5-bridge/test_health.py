#!/usr/bin/env python3
"""
Simple MT5 Bridge Health Check
"""

import requests
import json
import sys
import time

def test_bridge(base_url="http://localhost:8000"):
    """Test the MT5 bridge health endpoint"""

    print("🧪 Testing MT5 Bridge Connection")
    print("=" * 40)

    try:
        print(f"🌐 Testing connection to: {base_url}")
        response = requests.get(f"{base_url}/health", timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("✅ Bridge is responding!"            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   MT5 Version: {data.get('mt5_version', 'Not connected')}")
            print(f"   Timestamp: {data.get('timestamp', 'N/A')}")

            if data.get('status') == 'ok':
                print("🎉 MT5 Bridge is working correctly!")
                return True
            else:
                print("⚠️  Bridge responded but MT5 may not be connected")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to bridge"        print(f"   Is the bridge running on {base_url}?")
        print("   Run: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    base_url = "http://localhost:8000"

    if len(sys.argv) > 1:
        base_url = sys.argv[1]

    success = test_bridge(base_url)

    if success:
        print("\n📋 Next steps:")
        print("1. Open your BANK SCALPER EA React app")
        print("2. Go to MT5 Panel settings")
        print("3. Set Bridge URL to:", base_url)
        print("4. Enter your MT5 account credentials")
        print("5. Test connection and start trading!")
        sys.exit(0)
    else:
        print("\n🔧 Troubleshooting:")
        print("1. Make sure the bridge is running: python main.py")
        print("2. Check the .env file has correct settings")
        print("3. Ensure MT5 is installed and running")
        print("4. Check logs in logs/mt5_bridge.log")
        sys.exit(1)

if __name__ == "__main__":
    main()