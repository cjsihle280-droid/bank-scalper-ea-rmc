version: '3.8'

services:
  mt5-bridge:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MT5_ACCOUNT=${MT5_ACCOUNT}
      - MT5_PASSWORD=${MT5_PASSWORD}
      - MT5_SERVER=${MT5_SERVER}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3</content>
<parameter name="filePath">c:\Users\pc\Downloads\BANK SCALPER EA\mt5-bridge\docker-compose.yml