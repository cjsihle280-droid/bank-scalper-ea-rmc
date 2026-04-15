export interface Strategy {
  id: string;
  name: string;
  shortName: string;
  description: string;
  rules: string[];
  color: string;
}

export const STRATEGIES: Strategy[] = [
  {
    id: "smc",
    name: "Smart Money Concepts",
    shortName: "SMC",
    description: "Identify institutional order flow through order blocks, fair value gaps, and liquidity sweeps.",
    rules: [
      "Identify Break of Structure (BOS) or Change of Character (CHoCH)",
      "Look for order blocks at key structural levels",
      "Identify Fair Value Gaps (FVG) for entries",
      "Watch for liquidity grabs above/below swing highs/lows",
      "Confirm with displacement candles"
    ],
    color: "hsl(145, 80%, 42%)"
  },
  {
    id: "crt",
    name: "Candle Range Theory",
    shortName: "CRT",
    description: "Analyse candle ranges to predict price movement based on range expansion and contraction.",
    rules: [
      "Identify previous candle range (high to low)",
      "Look for range expansion beyond previous candle",
      "Entry on retracement into previous range",
      "Target next liquidity level",
      "Use higher timeframe candle range as context"
    ],
    color: "hsl(200, 80%, 50%)"
  },
  {
    id: "price_action",
    name: "Pure Price Action",
    shortName: "PA",
    description: "Trade based on raw price patterns, support/resistance, and candlestick formations.",
    rules: [
      "Identify key support and resistance levels",
      "Look for pin bars, engulfing candles at key levels",
      "Trade rejections from strong S/R zones",
      "Confirm with multiple timeframe analysis",
      "Use clean charts without indicators"
    ],
    color: "hsl(45, 90%, 55%)"
  },
  {
    id: "asian_range",
    name: "Asian Range Strategy",
    shortName: "AR",
    description: "Use the Asian session range as a reference for London/NY breakouts.",
    rules: [
      "Mark the Asian session high and low (00:00-08:00 GMT)",
      "Wait for London or NY session open",
      "Look for breakout above/below Asian range",
      "Entry on retest of broken range boundary",
      "Stop loss on opposite side of Asian range"
    ],
    color: "hsl(280, 70%, 55%)"
  },
  {
    id: "fib_50",
    name: "50% Fibonacci Entry",
    shortName: "FIB50",
    description: "Enter trades at the 50% Fibonacci retracement level of the impulse move.",
    rules: [
      "Identify a clear impulse move (swing high to swing low or vice versa)",
      "Draw Fibonacci retracement from swing to swing",
      "Wait for price to retrace to 50% level (0.5)",
      "Look for confirmation candle at the 50% level",
      "Target 1:2 or 1:3 risk-to-reward ratio"
    ],
    color: "hsl(15, 85%, 55%)"
  },
  {
    id: "quasimodo",
    name: "Quasimodo Pattern",
    shortName: "QM",
    description: "Advanced reversal pattern that identifies shift in market structure.",
    rules: [
      "Identify Higher High followed by Lower Low (bearish QM)",
      "Or Lower Low followed by Higher High (bullish QM)",
      "Entry at the left shoulder level",
      "Stop loss above/below the head",
      "Target previous swing structure"
    ],
    color: "hsl(330, 75%, 55%)"
  },
  {
    id: "breakout",
    name: "Breakout Strategy",
    shortName: "BO",
    description: "Trade breakouts from consolidation zones, ranges, and key levels.",
    rules: [
      "Identify consolidation or range-bound price action",
      "Wait for a strong candle close above/below the range",
      "Confirm with increased volume or momentum",
      "Entry on breakout candle close or retest",
      "Stop loss inside the broken range"
    ],
    color: "hsl(170, 70%, 45%)"
  },
  {
    id: "method_714",
    name: "714 Method",
    shortName: "714",
    description: "Use the 7 and 14 EMA crossover for trend entries on lower timeframes.",
    rules: [
      "Apply 7 EMA and 14 EMA to the chart",
      "Buy when 7 EMA crosses above 14 EMA",
      "Sell when 7 EMA crosses below 14 EMA",
      "Confirm with higher timeframe trend direction",
      "Use on 5M or 15M charts for scalping"
    ],
    color: "hsl(60, 80%, 50%)"
  },
  {
    id: "ny_scalp",
    name: "NY Session Scalping",
    shortName: "NYS",
    description: "Scalp impulse movements during the high-volatility New York session.",
    rules: [
      "Trade between 13:30-16:00 GMT (NY open hours)",
      "Look for impulse moves after news releases",
      "Enter on pullbacks within the impulse",
      "Use 1M or 5M timeframe",
      "Quick take-profits of 5-15 pips, tight stop losses"
    ],
    color: "hsl(100, 70%, 45%)"
  }
];
