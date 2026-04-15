import { useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STRATEGIES } from "@/lib/strategies";

interface Signal {
  strategy_id: string;
  signal: "BUY" | "SELL" | "NEUTRAL";
  strength: "STRONG" | "MODERATE" | "WEAK";
  reasoning: string;
}

interface SignalData {
  overall_bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  signals: Signal[];
  key_levels: { support: number[]; resistance: number[] };
  recommendation: string;
}

interface SignalsPanelProps {
  symbol: string;
  onBiasChange?: (bias: "BULLISH" | "BEARISH" | "NEUTRAL") => void;
  onSignalsGenerated?: (data: SignalData) => void;
}

const SignalsPanel = ({ symbol, onBiasChange, onSignalsGenerated }: SignalsPanelProps) => {
  const [data, setData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSignals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("generate-signals", {
        body: { symbol, timeframe: "15M" },
      });
      if (fnError) throw fnError;
      setData(result);
      if (result?.overall_bias && onBiasChange) {
        onBiasChange(result.overall_bias);
      }
      if (result && onSignalsGenerated) {
        onSignalsGenerated(result);
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate signals");
    } finally {
      setLoading(false);
    }
  };

  const biasColor = (bias: string) => {
    if (bias === "BULLISH") return "text-green-400";
    if (bias === "BEARISH") return "text-red-400";
    return "text-yellow-400";
  };

  const signalIcon = (signal: string) => {
    if (signal === "BUY") return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (signal === "SELL") return <TrendingDown className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-yellow-400" />;
  };

  const strengthBadge = (strength: string) => {
    const colors: Record<string, string> = {
      STRONG: "bg-green-500/20 text-green-400",
      MODERATE: "bg-yellow-500/20 text-yellow-400",
      WEAK: "bg-muted text-muted-foreground",
    };
    return (
      <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${colors[strength] || colors.WEAK}`}>
        {strength}
      </span>
    );
  };

  const getStrategy = (id: string) => STRATEGIES.find((s) => s.id === id);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          AI_SIGNALS
        </h2>
        <button
          onClick={generateSignals}
          disabled={loading}
          className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-bold tracking-wider text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {loading ? "ANALYSING..." : "GENERATE"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!data && !loading && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Activity className="h-8 w-8 opacity-30" />
            <p className="text-[10px] tracking-wider">Click GENERATE to analyse {symbol}</p>
          </div>
        )}

        {error && (
          <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-[10px] text-destructive">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {/* Overall bias */}
            <div className="rounded border border-border bg-background/50 p-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-wider text-muted-foreground">OVERALL BIAS</span>
                <span className={`text-sm font-bold ${biasColor(data.overall_bias)}`}>
                  {data.overall_bias}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-muted">
                  <div
                    className="h-1 rounded-full bg-primary transition-all"
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{data.confidence}%</span>
              </div>
            </div>

            {/* Signals */}
            <div className="space-y-1.5">
              {data.signals.map((sig) => {
                const strategy = getStrategy(sig.strategy_id);
                return (
                  <div key={sig.strategy_id} className="rounded border border-border/30 bg-background/30 p-2">
                    <div className="flex items-center gap-2">
                      {signalIcon(sig.signal)}
                      <span
                        className="rounded px-1 py-0.5 text-[8px] font-bold tracking-wider"
                        style={{
                          backgroundColor: (strategy?.color || "hsl(0,0%,50%)") + "22",
                          color: strategy?.color,
                        }}
                      >
                        {strategy?.shortName || sig.strategy_id}
                      </span>
                      <span className={`text-[10px] font-bold ${sig.signal === "BUY" ? "text-green-400" : sig.signal === "SELL" ? "text-red-400" : "text-yellow-400"}`}>
                        {sig.signal}
                      </span>
                      <div className="ml-auto">{strengthBadge(sig.strength)}</div>
                    </div>
                    <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{sig.reasoning}</p>
                  </div>
                );
              })}
            </div>

            {/* Key levels */}
            {data.key_levels && (
              <div className="rounded border border-border bg-background/50 p-2">
                <span className="text-[9px] tracking-wider text-muted-foreground">KEY LEVELS</span>
                <div className="mt-1 flex gap-4">
                  <div>
                    <span className="text-[8px] text-green-400">SUPPORT</span>
                    <div className="text-[10px] text-foreground">
                      {data.key_levels.support?.join(" / ") || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-red-400">RESISTANCE</span>
                    <div className="text-[10px] text-foreground">
                      {data.key_levels.resistance?.join(" / ") || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded border border-primary/20 bg-primary/5 p-2">
              <span className="text-[9px] tracking-wider text-primary">RECOMMENDATION</span>
              <p className="mt-1 text-[10px] leading-relaxed text-foreground">{data.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalsPanel;
