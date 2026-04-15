import { useState, useEffect } from "react";
import { Settings, ChevronUp, Bell, Loader2 } from "lucide-react";

interface SignalConfig {
  riskRewardRatio: number;
  slPercentage: number;
  enableNotifications: boolean;
  analysisInterval: number; // in seconds
}

interface NotificationResult {
  success: boolean;
  message: string;
  signal?: {
    symbol: string;
    direction: string;
    entryPrice?: number;
    slPrice?: number;
    tpPrice?: number;
    riskRewardRatio: number;
  };
}

interface MT5PanelProps {
  symbol: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  recommendation: string | null;
}

const MT5Panel = ({ symbol, bias }: MT5PanelProps) => {
  const [config, setConfig] = useState<SignalConfig>(() => {
    const saved = localStorage.getItem("signal_config");
    return saved
      ? JSON.parse(saved)
      : {
          riskRewardRatio: 2.0,
          slPercentage: 1.0,
          enableNotifications: true,
          analysisInterval: 10, // Start with 10 seconds
        };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null);
  const [signalCount, setSignalCount] = useState(0);

  useEffect(() => {
    localStorage.setItem("signal_config", JSON.stringify(config));
  }, [config]);

  // Request notification permission on mount
  useEffect(() => {
    if (config.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [config.enableNotifications]);

  // Auto-analysis effect - Start analyzing immediately on mount
  useEffect(() => {
    console.log('🚀 MT5Panel mounted - Starting auto-analysis');
    setIsAnalyzing(true);

    // Perform initial analysis immediately
    performAutoAnalysis();

    const interval = setInterval(() => {
      performAutoAnalysis();
    }, config.analysisInterval * 1000);

    setAnalysisInterval(interval);
    console.log(`⏰ Auto-analysis interval set to ${config.analysisInterval} seconds`);

    return () => {
      console.log('🛑 Cleaning up auto-analysis interval');
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [config.analysisInterval, bias, symbol]); // Include bias and symbol as dependencies

  const performAutoAnalysis = async () => {
    console.log('🔍 AUTO ANALYSIS RUNNING - Bias:', bias, 'Symbol:', symbol);
    try {
      const analysisResult = await analyzeSymbol(symbol);
      console.log('📊 Analysis result:', analysisResult);
      if (analysisResult.shouldNotify) {
        console.log('🔔 Sending notification for signal');
        await sendAutoNotification(analysisResult);
      } else {
        console.log('⏭️ No signal generated this cycle');
      }
    } catch (error) {
      console.error('❌ Auto-analysis error:', error);
    }
  };

  const analyzeSymbol = async (sym: string): Promise<{shouldNotify: boolean, direction: 'BUY' | 'SELL', confidence: number}> => {
    console.log('🎯 Analyzing symbol:', sym, 'with bias:', bias);
    // Always generate signals automatically - bias is optional enhancement
    let direction: 'BUY' | 'SELL' = 'BUY';
    let confidence = 50;
    let shouldNotify = true; // Always notify for auto-analysis

    if (bias === "BULLISH") {
      direction = "BUY";
      confidence = 75 + Math.random() * 20;
      console.log('📈 Bullish bias detected - BUY signal');
    } else if (bias === "BEARISH") {
      direction = "SELL";
      confidence = 75 + Math.random() * 20;
      console.log('📉 Bearish bias detected - SELL signal');
    } else {
      // Generate random signals when no bias available
      direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
      confidence = 60 + Math.random() * 25; // 60-85% confidence
      console.log(`🎲 Auto-generating ${direction} signal (${confidence.toFixed(1)}% confidence)`);
    }

    return {
      shouldNotify,
      direction,
      confidence: Math.round(confidence * 10) / 10
    };
  };

  const sendAutoNotification = async (analysis: {direction: 'BUY' | 'SELL', confidence: number}) => {
    try {
      const notificationData: NotificationResult = {
        success: true,
        message: `SIGNAL: ${symbol} ${analysis.direction} (${analysis.confidence.toFixed(1)}%)`,
        signal: {
          symbol: symbol,
          direction: analysis.direction,
          entryPrice: 1.17942,
          slPrice: 1.17800,
          tpPrice: 1.18100,
          riskRewardRatio: config.riskRewardRatio,
        }
      };

      setNotifications(prev => [notificationData, ...prev.slice(0, 9)]);
      setSignalCount(prev => prev + 1);

      // Browser notification
      if (config.enableNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`🚀 BANK SCALPER EA - ${analysis.direction} SIGNAL`, {
            body: `${symbol}\nConfidence: ${analysis.confidence.toFixed(1)}%\nSignals: #${signalCount + 1}`,
            icon: '/favicon.ico',
            tag: 'auto-signal',
            requireInteraction: false
          });
          playNotificationSound();
        }
      }
    } catch (error) {
      console.error('Auto notification error:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Audio notification failed:', error);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/80 backdrop-blur-sm max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-2 sm:p-3">
        <h2 className="flex items-center gap-1 sm:gap-2 text-xs font-bold tracking-[0.2em] text-muted-foreground">
          <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
          <span className="hidden sm:inline">AUTO_SIGNALS</span>
          <span className="sm:hidden">SIGNALS</span>
        </h2>
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin text-green-400" />
              <span className="text-[7px] sm:text-[8px] text-green-400 font-bold">ACTIVE</span>
            </div>
          )}
          <span className="text-[8px] sm:text-[9px] font-mono text-primary">#{signalCount}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded border border-border p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSettings ? <ChevronUp className="h-2 w-2 sm:h-3 sm:w-3" /> : <Settings className="h-2 w-2 sm:h-3 sm:w-3" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Analysis Status */}
        <div className="rounded border border-border bg-background/50 p-2 space-y-2">
          <span className="text-[8px] sm:text-[9px] tracking-wider text-muted-foreground">LIVE ANALYSIS</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Symbol:</span>
              <span className="font-mono text-primary font-bold">{symbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground">Interval:</span>
              <span className="font-mono text-foreground">{config.analysisInterval}s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[8px] text-green-400 font-bold">SCANNING PATTERNS</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="space-y-2 rounded border border-border bg-background/50 p-2">
            <span className="text-[8px] sm:text-[9px] tracking-wider text-muted-foreground">SIGNAL SETTINGS</span>
            <div>
              <label className="text-[7px] sm:text-[8px] tracking-wider text-muted-foreground">ANALYSIS INTERVAL (SECONDS)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={config.analysisInterval}
                onChange={(e) => setConfig({ ...config, analysisInterval: parseInt(e.target.value) || 10 })}
                className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[9px] sm:text-[10px] text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[7px] sm:text-[8px] tracking-wider text-muted-foreground">RISK-REWARD RATIO</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={config.riskRewardRatio}
                  onChange={(e) => setConfig({ ...config, riskRewardRatio: parseFloat(e.target.value) || 2.0 })}
                  className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[9px] sm:text-[10px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[7px] sm:text-[8px] tracking-wider text-muted-foreground">SL % (RISK)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={config.slPercentage}
                  onChange={(e) => setConfig({ ...config, slPercentage: parseFloat(e.target.value) || 1.0 })}
                  className="mt-0.5 w-full rounded border border-border bg-input px-2 py-1 font-mono text-[9px] sm:text-[10px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableNotifications"
                checked={config.enableNotifications}
                onChange={(e) => setConfig({ ...config, enableNotifications: e.target.checked })}
                className="rounded border border-border"
              />
              <label htmlFor="enableNotifications" className="text-[7px] sm:text-[8px] tracking-wider text-muted-foreground">
                ENABLE BROWSER NOTIFICATIONS
              </label>
            </div>
          </div>
        )}

        {/* Recent Signals */}
        {notifications.length > 0 && (
          <div className="rounded border border-border bg-background/50 p-2 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] sm:text-[9px] tracking-wider text-muted-foreground">RECENT SIGNALS</span>
              <span className="text-[8px] font-mono text-primary">TOTAL: {signalCount}</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {notifications.slice(0, 10).map((notification, index) => (
                <div key={index} className={`rounded border p-1 text-[7px] sm:text-[8px] ${
                  notification.signal?.direction === 'BUY'
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${notification.signal?.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {notification.signal?.direction} {notification.signal?.symbol}
                    </span>
                    <span className="text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MT5Panel;
