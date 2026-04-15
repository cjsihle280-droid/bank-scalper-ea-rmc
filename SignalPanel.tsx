import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./client";
import {
  Zap, TrendingUp, TrendingDown, AlertTriangle, Shield,
  Target, Crosshair, BarChart3, Loader2, Bell, BellOff, RefreshCw
} from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface Signal {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  entry: string;
  stopLoss: string;
  takeProfit: string[];
  strategies: { name: string; finding: string; bias: string }[];
  summary: string;
  risk: string;
}

interface SignalPanelProps {
  symbol: string;
  timeframe: string;
  riskRewardRatio: number;
  autoAnalyze: boolean;
  phoneNotificationsEnabled: boolean;
  phoneNumber: string;
  autoAnalyzeInterval: number;
  onSignalGenerated?: (signal: Signal | null) => void;
}

const formatSignalMessage = (signal: Signal, symbol: string, timeframe: string, riskRewardRatio: number) => {
  const tpText = signal.takeProfit.length > 0 ? signal.takeProfit.join(", ") : "N/A";
  return [
    `BANK SCALPER EA ${signal.signal} ${symbol} ${timeframe}`,
    `Entry: ${signal.entry}`,
    `SL: ${signal.stopLoss}`,
    `TP: ${tpText}`,
    `RR: 1:${riskRewardRatio}`,
    `Confidence: ${signal.confidence}%`,
  ].join(" | ");
};

const SignalPanel = ({
  symbol,
  timeframe,
  riskRewardRatio,
  autoAnalyze,
  phoneNotificationsEnabled,
  phoneNumber,
  autoAnalyzeInterval,
  onSignalGenerated,
}: SignalPanelProps) => {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const lastSignalFingerprint = useRef<string | null>(null);

  const deliverPhoneNotification = async (nextSignal: Signal) => {
    const trimmedPhone = phoneNumber.trim();
    if (!phoneNotificationsEnabled || !trimmedPhone) return;

    const message = formatSignalMessage(nextSignal, symbol, timeframe, riskRewardRatio);

    try {
      const { error } = await supabase.functions.invoke("send-signal-notification", {
        body: {
          phoneNumber: trimmedPhone,
          message,
          symbol,
          timeframe,
          riskRewardRatio,
          signal: nextSignal,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to send phone notification");
      }

      toast.success(`Signal notification sent to ${trimmedPhone}`);
    } catch (e) {
      console.error("Notification error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to send phone notification");
    }
  };

  const generateSignal = async (options?: { silent?: boolean; preserveCurrent?: boolean }) => {
    const silent = options?.silent ?? false;
    const preserveCurrent = options?.preserveCurrent ?? false;

    setLoading(true);
    if (!preserveCurrent) {
      setSignal(null);
      onSignalGenerated?.(null);
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-signal", {
        body: { symbol, timeframe, riskRewardRatio },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate signal");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSignal(data);
      onSignalGenerated?.(data);

      const fingerprint = JSON.stringify({
        symbol,
        timeframe,
        signal: data.signal,
        entry: data.entry,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
      });

      if (fingerprint !== lastSignalFingerprint.current) {
        lastSignalFingerprint.current = fingerprint;
        await deliverPhoneNotification(data);
      }

      if (!silent) {
        toast.success(`Signal updated for ${symbol} ${timeframe}`);
      }
    } catch (e) {
      console.error("Signal error:", e);
      if (!silent) {
        toast.error(e instanceof Error ? e.message : "Failed to generate signal");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lastSignalFingerprint.current = null;
    setSignal(null);
    onSignalGenerated?.(null);
  }, [symbol, timeframe, riskRewardRatio, onSignalGenerated]);

  useEffect(() => {
    if (!autoAnalyze) return;

    generateSignal({ silent: true, preserveCurrent: true });
    const intervalId = window.setInterval(() => {
      generateSignal({ silent: true, preserveCurrent: true });
    }, Math.max(autoAnalyzeInterval, 15) * 1000);

    return () => window.clearInterval(intervalId);
  }, [autoAnalyze, autoAnalyzeInterval, symbol, timeframe, riskRewardRatio]);

  const signalColor = signal?.signal === "BUY" ? "text-primary" : signal?.signal === "SELL" ? "text-destructive" : "text-yellow-500";
  const riskColor = signal?.risk === "LOW" ? "text-primary" : signal?.risk === "HIGH" ? "text-destructive" : "text-yellow-500";
  const biasIcon = (bias: string) => bias === "BULLISH" ? <TrendingUp className="w-3 h-3 text-primary" /> : bias === "BEARISH" ? <TrendingDown className="w-3 h-3 text-destructive" /> : <BarChart3 className="w-3 h-3 text-yellow-500" />;

  return (
    <div className="h-full flex flex-col bg-card/30 border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2 text-[10px] text-muted-foreground tracking-widest">
        <Zap className="w-3 h-3 text-primary" />
        AI SIGNAL ENGINE
      </div>

      {/* Generate button */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-border bg-secondary/20 px-2 py-1.5 text-[9px] text-muted-foreground tracking-wider">
            <div className="flex items-center gap-1 mb-1">
              {autoAnalyze ? <RefreshCw className="w-3 h-3 text-primary" /> : <BellOff className="w-3 h-3" />}
              AUTO ANALYZE
            </div>
            <div className="text-[11px] text-foreground font-mono">
              {autoAnalyze ? `ON • ${autoAnalyzeInterval}s` : "OFF"}
            </div>
          </div>
          <div className="rounded border border-border bg-secondary/20 px-2 py-1.5 text-[9px] text-muted-foreground tracking-wider">
            <div className="flex items-center gap-1 mb-1">
              {phoneNotificationsEnabled ? <Bell className="w-3 h-3 text-primary" /> : <BellOff className="w-3 h-3" />}
              PHONE ALERTS
            </div>
            <div className="text-[11px] text-foreground font-mono">
              {phoneNotificationsEnabled ? (phoneNumber.trim() || "READY") : "OFF"}
            </div>
          </div>
        </div>

        <div className="rounded border border-border bg-background/40 px-2 py-1.5 text-[10px] font-mono flex items-center justify-between">
          <span className="text-muted-foreground">Risk/Reward</span>
          <span className="text-primary">1:{riskRewardRatio.toFixed(1)}</span>
        </div>

        <Button
          onClick={() => generateSignal()}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs uppercase tracking-widest gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              ANALYZING...
            </>
          ) : (
            <>
              <Crosshair className="w-3 h-3" />
              GENERATE SIGNAL
            </>
          )}
        </Button>
        <div className="text-[9px] text-muted-foreground text-center mt-2 tracking-wider">
          SMC • PRICE ACTION • CRT • QM • ASIAN RANGE • IMPULSE
        </div>
      </div>

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-3"
          >
            {["Scanning order blocks...", "Checking fair value gaps...", "Analyzing market structure...", "Evaluating Asian range...", "Computing signal..."].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }}
                className="text-[10px] text-muted-foreground flex items-center gap-2"
              >
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 rounded-full bg-primary inline-block"
                />
                {text}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signal result */}
      <AnimatePresence>
        {signal && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-auto p-3 space-y-3"
          >
            {/* Main signal */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center p-4 border border-border rounded-lg glow-border"
            >
              <div className={`text-3xl font-bold ${signalColor} text-glow tracking-widest`}>
                {signal.signal}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${signal.confidence}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <span className="text-xs text-foreground">{signal.confidence}%</span>
              </div>
            </motion.div>

            {/* Entry / SL / TP */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Entry</span>
                <span className="text-foreground">{signal.entry}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-destructive/5 rounded border border-destructive/20">
                <span className="text-destructive flex items-center gap-1"><Shield className="w-3 h-3" /> Stop Loss</span>
                <span className="text-destructive">{signal.stopLoss}</span>
              </div>
              {signal.takeProfit.map((tp, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-primary/5 rounded border border-primary/20">
                  <span className="text-primary flex items-center gap-1"><Target className="w-3 h-3" /> TP{i + 1}</span>
                  <span className="text-primary">{tp}</span>
                </div>
              ))}
            </div>

            {/* Risk */}
            <div className="flex items-center justify-between text-xs p-2 bg-secondary/30 rounded">
              <span className="text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Risk</span>
              <span className={`font-bold ${riskColor}`}>{signal.risk}</span>
            </div>

            {/* Strategy breakdown */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground tracking-widest">STRATEGY ANALYSIS</div>
              {signal.strategies.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-2 bg-secondary/20 rounded border border-border/50 text-[11px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-medium">{s.name}</span>
                    <span className="flex items-center gap-1">{biasIcon(s.bias)} {s.bias}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{s.finding}</p>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-3 border border-border rounded-lg bg-card/50">
              <div className="text-[10px] text-muted-foreground tracking-widest mb-1">SUMMARY</div>
              <p className="text-xs text-foreground leading-relaxed">{signal.summary}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!signal && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground/50">
            <Crosshair className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Select a symbol and generate a signal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalPanel;
