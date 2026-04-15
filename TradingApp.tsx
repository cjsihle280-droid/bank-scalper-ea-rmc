import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Activity, Zap, ChevronDown, Search, Bell, TimerReset } from "lucide-react";
import { Button } from "./button";
import { Slider } from "./slider";
import { Input } from "./input";
import { Switch } from "./switch";
import { Label } from "./label";
import TradingViewChart from "./TradingViewChart";
import SignalPanel from "./SignalPanel";

interface TradingAppProps {
  onExit: () => void;
}

const symbolCategories: Record<string, string[]> = {
  "Forex Majors": [
    "FX:EURUSD", "FX:GBPUSD", "FX:USDJPY", "FX:USDCHF", "FX:AUDUSD", "FX:NZDUSD", "FX:USDCAD",
  ],
  "Forex Crosses": [
    "FX:EURGBP", "FX:EURJPY", "FX:EURCHF", "FX:EURAUD", "FX:EURNZD", "FX:EURCAD",
    "FX:GBPJPY", "FX:GBPCHF", "FX:GBPAUD", "FX:GBPNZD", "FX:GBPCAD",
    "FX:AUDJPY", "FX:AUDNZD", "FX:AUDCAD", "FX:AUDCHF",
    "FX:NZDJPY", "FX:NZDCAD", "FX:NZDCHF",
    "FX:CADJPY", "FX:CADCHF", "FX:CHFJPY",
  ],
  "Forex Exotics": [
    "FX:USDZAR", "FX:USDMXN", "FX:USDTRY", "FX:USDSEK", "FX:USDNOK",
    "FX:USDDKK", "FX:USDSGD", "FX:USDHKD", "FX:USDPLN", "FX:USDHUF",
  ],
  Crypto: [
    "BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:BNBUSDT", "BINANCE:XRPUSDT",
    "BINANCE:SOLUSDT", "BINANCE:ADAUSDT", "BINANCE:DOGEUSDT", "BINANCE:DOTUSDT",
    "BINANCE:MATICUSDT", "BINANCE:LINKUSDT", "BINANCE:AVAXUSDT", "BINANCE:LTCUSDT",
    "BINANCE:UNIUSDT", "BINANCE:ATOMUSDT", "BINANCE:NEARUSDT", "BINANCE:AAVEUSDT",
  ],
  Indices: [
    "FOREXCOM:SPXUSD", "FOREXCOM:NSXUSD", "FOREXCOM:DJI", "TVC:DEU40",
    "TVC:UKX", "TVC:NI225", "TVC:HSI", "FOREXCOM:AUS200",
  ],
  Commodities: [
    "TVC:GOLD", "TVC:SILVER", "TVC:USOIL", "TVC:UKOIL",
    "TVC:PLATINUM", "TVC:COPPER", "TVC:NATGAS",
  ],
  Stocks: [
    "NASDAQ:AAPL", "NASDAQ:MSFT", "NASDAQ:GOOGL", "NASDAQ:AMZN", "NASDAQ:TSLA",
    "NASDAQ:META", "NASDAQ:NVDA", "NYSE:JPM", "NYSE:V", "NYSE:WMT",
  ],
};

const timeframes = ["1", "5", "15", "30", "60", "240", "D", "W"];
const tfLabels: Record<string, string> = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1H",
  "240": "4H",
  D: "1D",
  W: "1W",
};

const TradingApp = ({ onExit }: TradingAppProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState("FX:EURUSD");
  const [selectedTf, setSelectedTf] = useState("15");
  const [showSymbols, setShowSymbols] = useState(false);
  const [showSignals, setShowSignals] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(2);
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(true);
  const [autoAnalyzeInterval, setAutoAnalyzeInterval] = useState<number>(60);
  const [phoneNotificationsEnabled, setPhoneNotificationsEnabled] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const handleRiskRewardChange = (value: number[]) => {
    setRiskRewardRatio(value[0] ?? 2);
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleIntervalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAutoAnalyzeInterval(Math.max(15, parseInt(e.target.value, 10) || 60));
  };

  const handleExit = useCallback(() => {
    localStorage.removeItem("bse_license");
    onExit();
  }, [onExit]);

  useEffect(() => {
    const saved = localStorage.getItem("bank_scalper_signal_settings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setRiskRewardRatio(typeof parsed.riskRewardRatio === "number" ? parsed.riskRewardRatio : 2);
      setAutoAnalyze(typeof parsed.autoAnalyze === "boolean" ? parsed.autoAnalyze : true);
      setAutoAnalyzeInterval(typeof parsed.autoAnalyzeInterval === "number" ? parsed.autoAnalyzeInterval : 60);
      setPhoneNotificationsEnabled(typeof parsed.phoneNotificationsEnabled === "boolean" ? parsed.phoneNotificationsEnabled : false);
      setPhoneNumber(typeof parsed.phoneNumber === "string" ? parsed.phoneNumber : "");
    } catch {
      // ignore invalid persisted settings
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "bank_scalper_signal_settings",
      JSON.stringify({
        riskRewardRatio,
        autoAnalyze,
        autoAnalyzeInterval,
        phoneNotificationsEnabled,
        phoneNumber,
      }),
    );
  }, [riskRewardRatio, autoAnalyze, autoAnalyzeInterval, phoneNotificationsEnabled, phoneNumber]);

  const displaySymbol = selectedSymbol.split(":").pop() || selectedSymbol;

  const filteredCategories = Object.entries(symbolCategories).reduce((acc, [cat, syms]) => {
    const filtered = syms.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-background text-foreground flex flex-col overflow-hidden"
    >
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        className="border-b border-border px-4 py-2 flex items-center justify-between bg-card/50 backdrop-blur-sm shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Zap className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="font-bold tracking-wider text-sm font-mono">
              BANK <span className="text-primary text-glow">SCALPER</span> EA
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSymbols(!showSymbols)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded text-xs font-mono hover:border-primary/50 transition-colors"
            >
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-foreground font-medium">{displaySymbol}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showSymbols ? "rotate-180" : ""}`} />
            </button>

            {showSymbols && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 w-72 max-h-96 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search symbols..."
                      className="w-full bg-background border border-border rounded px-8 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-auto max-h-80">
                  {Object.entries(filteredCategories).map(([cat, syms]) => (
                    <div key={cat}>
                      <div className="px-3 py-1.5 text-[9px] text-muted-foreground tracking-widest bg-secondary/50 uppercase">
                        {cat}
                      </div>
                      {syms.map((sym) => (
                        <button
                          key={sym}
                          onClick={() => {
                            setSelectedSymbol(sym);
                            setShowSymbols(false);
                            setSearchQuery("");
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-primary/10 ${
                            selectedSymbol === sym ? "text-primary bg-primary/5" : "text-foreground"
                          }`}
                        >
                          {sym.split(":").pop()}
                          <span className="text-muted-foreground/40 ml-2 text-[9px]">{sym.split(":")[0]}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex gap-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTf(tf)}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                  selectedTf === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tfLabels[tf]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {showSignals && (
            <div className="hidden xl:flex items-center gap-3 rounded-md border border-border bg-secondary/20 px-3 py-1.5">
              <div className="flex items-center gap-2 min-w-[120px]">
                <TimerReset className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground">AUTO</span>
                <Switch checked={autoAnalyze} onCheckedChange={setAutoAnalyze} />
              </div>

              <div className="flex items-center gap-2 min-w-[150px]">
                <span className="text-[10px] font-mono text-muted-foreground">RR 1:{riskRewardRatio.toFixed(1)}</span>
                <Slider
                  value={[riskRewardRatio]}
                  onValueChange={handleRiskRewardChange}
                  min={1}
                  max={5}
                  step={0.5}
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-2 min-w-[160px]">
                <Bell className="w-3 h-3 text-primary" />
                <Input
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="Phone"
                  className="h-7 w-24 border-border bg-background/50 px-2 text-[10px] font-mono"
                />
                <Switch checked={phoneNotificationsEnabled} onCheckedChange={setPhoneNotificationsEnabled} />
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSignals(!showSignals)}
            className="text-xs font-mono gap-1 text-muted-foreground hover:text-primary h-7"
          >
            <Zap className="w-3 h-3" />
            {showSignals ? "Hide Signals" : "Show Signals"}
          </Button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleExit}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Logout & clear license"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <TradingViewChart symbol={selectedSymbol} />
        </div>

        {showSignals && (
          <div className="w-80 shrink-0 flex flex-col overflow-hidden border-l border-border bg-card/20">
            <div className="p-3 border-b border-border space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] tracking-widest text-muted-foreground">RISK / REWARD</Label>
                  <span className="text-xs font-mono text-primary">1:{riskRewardRatio.toFixed(1)}</span>
                </div>
                <Slider
                  value={[riskRewardRatio]}
                  onValueChange={handleRiskRewardChange}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div>
                  <Label className="text-[10px] tracking-widest text-muted-foreground">AUTO ANALYZE</Label>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Keep scanning while the app stays open.
                  </p>
                </div>
                <Switch checked={autoAnalyze} onCheckedChange={setAutoAnalyze} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="auto-interval" className="text-[10px] tracking-widest text-muted-foreground">
                  AUTO INTERVAL (SECONDS)
                </Label>
                <Input
                  id="auto-interval"
                  type="number"
                  min="15"
                  step="15"
                  value={autoAnalyzeInterval}
                  onChange={handleIntervalChange}
                  className="h-8 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div>
                  <Label className="text-[10px] tracking-widest text-muted-foreground">PHONE NOTIFICATIONS</Label>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sends signal alerts with SL and TP.
                  </p>
                </div>
                <Switch checked={phoneNotificationsEnabled} onCheckedChange={setPhoneNotificationsEnabled} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone-number" className="text-[10px] tracking-widest text-muted-foreground">
                  PHONE NUMBER
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="+15551234567"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <SignalPanel
                symbol={displaySymbol}
                timeframe={tfLabels[selectedTf]}
                riskRewardRatio={riskRewardRatio}
                autoAnalyze={autoAnalyze}
                phoneNotificationsEnabled={phoneNotificationsEnabled}
                phoneNumber={phoneNumber}
                autoAnalyzeInterval={autoAnalyzeInterval}
              />
            </div>
          </div>
        )}
      </div>

      {showSymbols && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSymbols(false);
            setSearchQuery("");
          }}
        />
      )}
    </motion.div>
  );
};

export default TradingApp;
