import { useState, useEffect } from "react";
import { Settings, ChevronUp, Bell, Loader2 } from "lucide-react";

interface SignalConfig {
  riskRewardRatio: number;
  slPercentage: number;
  enableNotifications: boolean;
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

interface MT5PanelProps {
  symbol: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  signalData: SignalData | null;
}

const MT5Panel = ({ symbol, bias, signalData }: MT5PanelProps) => {
  const [config, setConfig] = useState<SignalConfig>(() => {
    const saved = localStorage.getItem("signal_config");
    return saved
      ? JSON.parse(saved)
      : {
          riskRewardRatio: 2.0,
          slPercentage: 1.0,
          enableNotifications: true,
        };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [signalCount, setSignalCount] = useState(0);
  const [lastSignalHash, setLastSignalHash] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("signal_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [config.enableNotifications]);

  useEffect(() => {
    if (!signalData) return;
    setIsAnalyzing(true);
    evaluateSignal(signalData);
  }, [signalData, symbol]);

  const evaluateSignal = async (data: SignalData) => {
    console.log('🔎 Evaluating signals for', symbol, 'bias', data.overall_bias);
    const direction = data.overall_bias === 'BULLISH' ? 'BUY' : data.overall_bias === 'BEARISH' ? 'SELL' : null;
    const strongStrategies = data.signals.filter((sig) => sig.strength === 'STRONG');
    const alignedStrong = direction ? strongStrategies.filter((sig) => sig.signal === direction) : [];
    const goodSniperSignal = !!direction && data.confidence >= 70 && alignedStrong.length >= 2;

    const newHash = `${direction}-${data.confidence}-${alignedStrong.map((sig) => sig.strategy_id).sort().join(',')}`;
    if (!goodSniperSignal) {
      console.log('⚠️ No sniper-grade signal found for', symbol);
      setIsAnalyzing(false);
      return;
    }

    if (newHash === lastSignalHash) {
      console.log('🔁 Duplicate sniper signal ignored');
      setIsAnalyzing(false);
      return;
    }

    setLastSignalHash(newHash);
    await sendAutoNotification(direction, data.confidence, data);
    setIsAnalyzing(false);
  };

  const sendAutoNotification = async (direction: 'BUY' | 'SELL', confidence: number, data: SignalData) => {
    try {
      const support = data.key_levels.support?.[0] ?? 0;
      const resistance = data.key_levels.resistance?.[0] ?? 0;
      const entryPrice = direction === 'BUY' ? support : resistance;
      const slPrice = direction === 'BUY' ? entryPrice - config.slPercentage * 0.0001 : entryPrice + config.slPercentage * 0.0001;
      const tpPrice = direction === 'BUY' ? entryPrice + config.riskRewardRatio * Math.abs(entryPrice - slPrice) : entryPrice - config.riskRewardRatio * Math.abs(entryPrice - slPrice);

      const notificationData: NotificationResult = {
        success: true,
        message: `SNIPER SIGNAL: ${symbol} ${direction} (${confidence.toFixed(1)}%)`,
        signal: {
          symbol,
          direction,
          entryPrice: entryPrice || undefined,
          slPrice: slPrice || undefined,
          tpPrice: tpPrice || undefined,
          riskRewardRatio: config.riskRewardRatio,
        }
      };

      setNotifications((prev) => [notificationData, ...prev.slice(0, 9)]);
      setSignalCount((prev) => prev + 1);

      if (config.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚀 BANK SCALPER EA - ${direction} SIGNAL`, {
          body: `${symbol}\nConfidence: ${confidence.toFixed(1)}%\n${data.recommendation}`,
          icon: '/favicon.ico',
          tag: 'auto-signal',
          requireInteraction: false,
        });
        playNotificationSound();
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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[8px] text-green-400 font-bold">SCANNER READY</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="space-y-2 rounded border border-border bg-background/50 p-2">
            <span className="text-[8px] sm:text-[9px] tracking-wider text-muted-foreground">SIGNAL SETTINGS</span>
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
