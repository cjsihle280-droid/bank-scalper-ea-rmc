export interface TradingSymbol {
  symbol: string;
  name: string;
  category: string;
}

export const TRADING_SYMBOLS: TradingSymbol[] = [
  // Forex Majors
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "Forex" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "Forex" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "Forex" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", category: "Forex" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", category: "Forex" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", category: "Forex" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", category: "Forex" },
  // Forex Minors
  { symbol: "EURGBP", name: "Euro / British Pound", category: "Forex" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", category: "Forex" },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", category: "Forex" },
  { symbol: "EURAUD", name: "Euro / Australian Dollar", category: "Forex" },
  { symbol: "EURCHF", name: "Euro / Swiss Franc", category: "Forex" },
  { symbol: "GBPCHF", name: "British Pound / Swiss Franc", category: "Forex" },
  { symbol: "GBPAUD", name: "British Pound / Australian Dollar", category: "Forex" },
  { symbol: "AUDCAD", name: "Australian Dollar / Canadian Dollar", category: "Forex" },
  { symbol: "AUDJPY", name: "Australian Dollar / Japanese Yen", category: "Forex" },
  { symbol: "CADJPY", name: "Canadian Dollar / Japanese Yen", category: "Forex" },
  { symbol: "NZDJPY", name: "New Zealand Dollar / Japanese Yen", category: "Forex" },
  { symbol: "GBPCAD", name: "British Pound / Canadian Dollar", category: "Forex" },
  { symbol: "GBPNZD", name: "British Pound / New Zealand Dollar", category: "Forex" },
  { symbol: "EURNZD", name: "Euro / New Zealand Dollar", category: "Forex" },
  { symbol: "EURCAD", name: "Euro / Canadian Dollar", category: "Forex" },
  // Exotics
  { symbol: "USDZAR", name: "US Dollar / South African Rand", category: "Forex" },
  { symbol: "USDMXN", name: "US Dollar / Mexican Peso", category: "Forex" },
  { symbol: "USDTRY", name: "US Dollar / Turkish Lira", category: "Forex" },
  { symbol: "USDSEK", name: "US Dollar / Swedish Krona", category: "Forex" },
  { symbol: "USDNOK", name: "US Dollar / Norwegian Krone", category: "Forex" },
  { symbol: "USDSGD", name: "US Dollar / Singapore Dollar", category: "Forex" },
  { symbol: "USDHKD", name: "US Dollar / Hong Kong Dollar", category: "Forex" },
  // Indices
  { symbol: "US30", name: "Dow Jones Industrial Average", category: "Indices" },
  { symbol: "US500", name: "S&P 500", category: "Indices" },
  { symbol: "USTEC", name: "NASDAQ 100", category: "Indices" },
  { symbol: "UK100", name: "FTSE 100", category: "Indices" },
  { symbol: "DE40", name: "DAX 40", category: "Indices" },
  { symbol: "FR40", name: "CAC 40", category: "Indices" },
  { symbol: "JP225", name: "Nikkei 225", category: "Indices" },
  { symbol: "AU200", name: "ASX 200", category: "Indices" },
  { symbol: "HK50", name: "Hang Seng 50", category: "Indices" },
  { symbol: "ES35", name: "IBEX 35", category: "Indices" },
  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", category: "Crypto" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", category: "Crypto" },
  { symbol: "XRPUSD", name: "Ripple / US Dollar", category: "Crypto" },
  { symbol: "LTCUSD", name: "Litecoin / US Dollar", category: "Crypto" },
  { symbol: "ADAUSD", name: "Cardano / US Dollar", category: "Crypto" },
  { symbol: "SOLUSD", name: "Solana / US Dollar", category: "Crypto" },
  { symbol: "DOTUSD", name: "Polkadot / US Dollar", category: "Crypto" },
  { symbol: "DOGEUSD", name: "Dogecoin / US Dollar", category: "Crypto" },
  { symbol: "AVAXUSD", name: "Avalanche / US Dollar", category: "Crypto" },
  { symbol: "MATICUSD", name: "Polygon / US Dollar", category: "Crypto" },
  // Commodities
  { symbol: "XAUUSD", name: "Gold / US Dollar", category: "Commodities" },
  { symbol: "XAGUSD", name: "Silver / US Dollar", category: "Commodities" },
  { symbol: "USOIL", name: "US Crude Oil", category: "Commodities" },
  { symbol: "UKOIL", name: "UK Brent Oil", category: "Commodities" },
  { symbol: "NATGAS", name: "Natural Gas", category: "Commodities" },
  { symbol: "COPPER", name: "Copper", category: "Commodities" },
  { symbol: "PLATINUM", name: "Platinum", category: "Commodities" },
  { symbol: "PALLADIUM", name: "Palladium", category: "Commodities" },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", category: "Stocks" },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "Stocks" },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "Stocks" },
  { symbol: "AMZN", name: "Amazon.com Inc.", category: "Stocks" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "Stocks" },
  { symbol: "META", name: "Meta Platforms Inc.", category: "Stocks" },
  { symbol: "NVDA", name: "NVIDIA Corporation", category: "Stocks" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", category: "Stocks" },
  { symbol: "V", name: "Visa Inc.", category: "Stocks" },
  { symbol: "DIS", name: "Walt Disney Company", category: "Stocks" },
];

export const CATEGORIES = [...new Set(TRADING_SYMBOLS.map(s => s.category))];
