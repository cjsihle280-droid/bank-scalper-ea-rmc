[Unit]
Description=MT5 Bridge Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=mt5user
Group=mt5user
WorkingDirectory=/opt/mt5-bridge
Environment=PATH=/opt/mt5-bridge/venv/bin
Environment=PYTHONPATH=/opt/mt5-bridge
Environment=MT5_ACCOUNT=${MT5_ACCOUNT}
Environment=MT5_PASSWORD=${MT5_PASSWORD}
Environment=MT5_SERVER=${MT5_SERVER}
Environment=API_KEY=${API_KEY}
Environment=LOG_LEVEL=INFO
Environment=LOG_FILE=/var/log/mt5-bridge/bridge.log
ExecStart=/opt/mt5-bridge/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mt5-bridge

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes
ReadWritePaths=/opt/mt5-bridge /var/log/mt5-bridge
ProtectSystem=strict
ProtectKernelTunables=yes
ProtectControlGroups=yes

# Resource limits
MemoryLimit=512M
CPUQuota=50%

[Install]
WantedBy=multi-user.target</content>
<parameter name="filePath">c:\Users\pc\Downloads\BANK SCALPER EA\mt5-bridge\systemd.service