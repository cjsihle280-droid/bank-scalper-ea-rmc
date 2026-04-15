import { useState, useEffect } from "react";
import { Settings, Send, Wifi, WifiOff, Loader2, ChevronUp } from "lucide-react";

interface MT5Config {
  bridgeUrl: string;
  account: string;
  password: string;
  server: string;
  lotSize: number;
  slPips: number;
  tpPips: number;
}

interface TradeResult {
  success: boolean;
  message: string;
  order_id?: number;
}

interface MT5PanelProps {
  symbol: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  recommendation: string | null;
}

const MT5Panel = ({ symbol, bias }: MT5PanelProps) => {
  const [config, setConfig] = useState<MT5Config>(() => {
    const saved = localStorage.getItem("mt5_config");
    return saved
      ? JSON.parse(saved)
      : {
          bridgeUrl: "http://localhost:8000",
          account: "",
          password: "",
          server: "",
          lotSize: 0.01,
          slPips: 20,
          tpPips: 40,
        };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedToAccount, setConnectedToAccount] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [tradeDirection, setTradeDirection] = useState<"BUY" | "SELL">(
    bias === "BEARISH" ? "SELL" : "BUY"
  );

  useEffect(() => {
    localStorage.setItem("mt5_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    setTradeDirection(bias === "BEARISH" ? "SELL" : "BUY");
  }, [bias]);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${config.bridgeUrl}/health`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setConnected(data.status === "ok");
    } catch {
      setConnected(false);
      setConnectedToAccount(false);
    } finally {
      setChecking(false);
    }
  };

  const connectAccount = async () => {
    setConnecting(true);
    setResult(null);
    try {
      const res = await fetch(`${config.bridgeUrl}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: config.account,
          password: config.password,
          server: config.server,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectedToAccount(true);
        setResult({ success: true, message: "MT5 account linked successfully" });
      } else {
        setConnectedToAccount(false);
        setResult({ success: false, message: data.message || "Failed to connect MT5 account" });
      }
    } catch (e: any) {
      setConnectedToAccount(false);
      setResult({ success: false, message: e.message || "Failed to connect to MT5 bridge" });
    } finally {
      setConnecting(false);
    }
  };

  const sendTrade = async () => {
    setSending(true);
    setResult(null);
    try {
      const mt5Symbol = symbol.includes("/") ? symbol.replace("/", "") : symbol;
      const res = await fetch(`${config.bridgeUrl}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: config.account,
          password: config.password,
          server: config.server,
          symbol: mt5Symbol,
          direction: tradeDirection,
          lot_size: config.lotSize,
          sl_pips: config.slPips,
          tp_pips: config.tpPips,
          comment: "BANK SCALPER EA",
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ success: false, message: e.message || "Failed to connect to MT5 bridge" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-muted-foreground">
          <Send className="h-3.5 w-3.5 text-primary" />
          MT5_TRADE
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={checkConnection}
            disabled={checking}
            className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[8px] tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            {checking ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : connected ? (
              <Wifi className="h-2.5 w-2.5 text-green-400" />
            ) : (
              <WifiOff className="h-2.5 w-2.5 text-red-400" />
            )}
            {connected ? "LINKED" : "OFFLINE"}
          </button>
          <span
            className={`rounded border px-1.5 py-0.5 text-[8px] tracking-wider transition-colors ${
              connectedToAccount ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-red-500/50 bg-red-500/10 text-red-400"
            }`}
          >
            {connectedToAccount ? "ACCOUNT LINKED" : "ACCOUNT NOT LINKED"}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded border border-border p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSettings ? <ChevronUp className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Settings */}
        {showSettings && (
          <div className="space-y-2 rounded border border-border bg-background/50 p-2">
            <span className="text-[9px] tracking-wider text-muted-foreground">BRIDGE SETTINGS</span>
            <div>
              <label className="text-[8px] tracking-wider text-muted-foreground">SERVER URL</label>
              <input
                type="text"
                value={config.bridgeUrl}
                onChange={(e) => setConfig({ ...config, bridgeUrl: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[8px] tracking-wider text-muted-foreground">MT5 ACCOUNT</label>
              <input
                type="text"
                value={config.account}
                onChange={(e) => setConfig({ ...config, account: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                placeholder="Account number"
              />
            </div>
            <div>
              <label className="text-[8px] tracking-wider text-muted-foreground">MT5 PASSWORD</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="text-[8px] tracking-wider text-muted-foreground">MT5 SERVER</label>
              <input
                type="text"
                value={config.server}
                onChange={(e) => setConfig({ ...config, server: e.target.value })}
                className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                placeholder="Broker server"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[8px] tracking-wider text-muted-foreground">LOT SIZE</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={config.lotSize}
                  onChange={(e) => setConfig({ ...config, lotSize: parseFloat(e.target.value) || 0.01 })}
                  className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[8px] tracking-wider text-muted-foreground">SL (PIPS)</label>
                <input
                  type="number"
                  min="1"
                  value={config.slPips}
                  onChange={(e) => setConfig({ ...config, slPips: parseInt(e.target.value) || 20 })}
                  className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[8px] tracking-wider text-muted-foreground">TP (PIPS)</label>
                <input
                  type="number"
                  min="1"
                  value={config.tpPips}
                  onChange={(e) => setConfig({ ...config, tpPips: parseInt(e.target.value) || 40 })}
                  className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={checkConnection}
              className="w-full rounded border border-primary/30 bg-primary/10 py-1 text-[9px] font-bold tracking-wider text-primary hover:bg-primary/20"
            >
              TEST CONNECTION
            </button>
            <button
              onClick={connectAccount}
              disabled={connecting || !connected}
              className="w-full rounded border border-secondary/30 bg-secondary/10 py-1 text-[9px] font-bold tracking-wider text-secondary hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connecting ? "LINKING..." : connectedToAccount ? "ACCOUNT LINKED" : "LINK MT5 ACCOUNT"}
            </button>
          </div>
        )}

        {/* Trade direction */}
        <div className="space-y-1.5">
          <span className="text-[9px] tracking-wider text-muted-foreground">DIRECTION</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTradeDirection("BUY")}
              className={`rounded border py-2 text-[10px] font-bold tracking-wider transition-colors ${
                tradeDirection === "BUY"
                  ? "border-green-500/50 bg-green-500/20 text-green-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              ▲ BUY
            </button>
            <button
              onClick={() => setTradeDirection("SELL")}
              className={`rounded border py-2 text-[10px] font-bold tracking-wider transition-colors ${
                tradeDirection === "SELL"
                  ? "border-red-500/50 bg-red-500/20 text-red-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              ▼ SELL
            </button>
          </div>
        </div>

        {/* Trade summary */}
        <div className="rounded border border-border bg-background/50 p-2 space-y-1">
          <span className="text-[9px] tracking-wider text-muted-foreground">TRADE SUMMARY</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            <span className="text-muted-foreground">Symbol:</span>
            <span className="font-mono text-foreground">{symbol}</span>
            <span className="text-muted-foreground">Direction:</span>
            <span className={tradeDirection === "BUY" ? "text-green-400" : "text-red-400"}>
              {tradeDirection}
            </span>
            <span className="text-muted-foreground">Lot Size:</span>
            <span className="font-mono text-foreground">{config.lotSize}</span>
            <span className="text-muted-foreground">Stop Loss:</span>
            <span className="font-mono text-foreground">{config.slPips} pips</span>
            <span className="text-muted-foreground">Take Profit:</span>
            <span className="font-mono text-foreground">{config.tpPips} pips</span>
            <span className="text-muted-foreground">Comment:</span>
            <span className="font-mono text-primary">BANK SCALPER EA</span>
          </div>
        </div>

        {/* Send Trade button */}
        <button
          onClick={sendTrade}
          disabled={sending || !connected || !connectedToAccount}
          className={`w-full rounded py-2.5 text-xs font-bold tracking-[0.2em] transition-all ${
            connected && connectedToAccount
              ? tradeDirection === "BUY"
                ? "bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                : "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
              : "border border-border bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> SENDING...
            </span>
          ) : !connected ? (
            "CONNECT MT5 FIRST"
          ) : (
            `SEND ${tradeDirection} TRADE`
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`rounded border p-2 text-[10px] ${
              result.success
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <p className="font-bold">{result.success ? "✓ TRADE EXECUTED" : "✗ TRADE FAILED"}</p>
            <p className="mt-0.5">{result.message}</p>
            {result.order_id && (
              <p className="mt-0.5 font-mono text-muted-foreground">Order #{result.order_id}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MT5Panel;
