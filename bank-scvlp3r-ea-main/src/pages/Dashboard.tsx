import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, LogOut } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";
import SymbolSelector from "@/components/SymbolSelector";
import StrategyPanel from "@/components/StrategyPanel";
import SignalsPanel from "@/components/SignalsPanel";
import MT5Panel from "@/components/MT5Panel";

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [showSymbols, setShowSymbols] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [showSignals, setShowSignals] = useState(true);
  const [showMT5, setShowMT5] = useState(true);
  const [currentBias, setCurrentBias] = useState<"BULLISH" | "BEARISH" | "NEUTRAL" | null>(null);
  const [latestSignals, setLatestSignals] = useState<null | {
    overall_bias: "BULLISH" | "BEARISH" | "NEUTRAL";
    confidence: number;
    signals: {
      strategy_id: string;
      signal: "BUY" | "SELL" | "NEUTRAL";
      strength: "STRONG" | "MODERATE" | "WEAK";
      reasoning: string;
    }[];
    key_levels: { support: number[]; resistance: number[] };
    recommendation: string;
  }>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("license_key");
    localStorage.removeItem("license_data");
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-bold tracking-widest text-foreground">
            BANK <span className="text-primary">SCALPER</span> EA
          </span>
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-primary">
            {selectedSymbol}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSymbols(!showSymbols)}
            className="rounded border border-border px-3 py-1 text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSymbols ? "HIDE" : "SHOW"} SYMBOLS
          </button>
          <button
            onClick={() => setShowSignals(!showSignals)}
            className="rounded border border-border px-3 py-1 text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSignals ? "HIDE" : "SHOW"} SIGNALS
          </button>
          <button
            onClick={() => setShowMT5(!showMT5)}
            className="rounded border border-border px-3 py-1 text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {showMT5 ? "HIDE" : "SHOW"} MT5
          </button>
          <button
            onClick={() => setShowStrategy(!showStrategy)}
            className="rounded border border-border px-3 py-1 text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {showStrategy ? "HIDE" : "SHOW"} STRATEGY
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded border border-border px-3 py-1 text-[10px] tracking-widest text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="h-3 w-3" />
            REMOVE KEY
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Symbol sidebar */}
        {showSymbols && (
          <div className="w-64 shrink-0 border-r border-border">
            <SymbolSelector
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
            />
          </div>
        )}

        {/* Chart */}
        <div className="flex-1">
          <TradingViewChart symbol={selectedSymbol} />
        </div>

        {/* Right panels */}
        {(showSignals || showStrategy || showMT5) && (
          <div className="flex w-80 shrink-0 flex-col border-l border-border">
            {showSignals && (
              <div className="border-b border-border" style={{ height: showMT5 || showStrategy ? "40%" : "100%" }}>
                <SignalsPanel
                  symbol={selectedSymbol}
                  onBiasChange={setCurrentBias}
                  onSignalsGenerated={setLatestSignals}
                />
              </div>
            )}
            {showMT5 && (
              <div className="border-b border-border" style={{ height: showSignals && showStrategy ? "30%" : showSignals || showStrategy ? "50%" : "100%" }}>
                <MT5Panel symbol={selectedSymbol} bias={currentBias} signalData={latestSignals} />
              </div>
            )}
            {showStrategy && (
              <div className="flex-1">
                <StrategyPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
