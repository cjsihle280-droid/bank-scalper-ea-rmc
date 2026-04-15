import { useState } from "react";
import { Search } from "lucide-react";
import { TRADING_SYMBOLS, CATEGORIES, type TradingSymbol } from "@/lib/tradingSymbols";

interface SymbolSelectorProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const SymbolSelector = ({ selectedSymbol, onSelect }: SymbolSelectorProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Forex");

  const filtered = TRADING_SYMBOLS.filter(
    (s) =>
      s.category === activeCategory &&
      (s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/80 backdrop-blur-sm">
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbols..."
            className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded px-2 py-1 text-[10px] font-bold tracking-widest transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Symbol list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((s) => (
          <button
            key={s.symbol}
            onClick={() => onSelect(s.symbol)}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-muted/30 ${
              selectedSymbol === s.symbol ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            <span className="font-mono font-bold tracking-wider">{s.symbol}</span>
            <span className="text-[10px] text-muted-foreground">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymbolSelector;
