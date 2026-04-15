import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { STRATEGIES, type Strategy } from "@/lib/strategies";

const StrategyPanel = () => {
  const [expandedId, setExpandedId] = useState<string | null>("smc");

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card/80 backdrop-blur-sm">
      <div className="border-b border-border p-3">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          STRATEGY_ANALYSIS
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {STRATEGIES.map((s) => (
          <div key={s.id} className="border-b border-border/30">
            <button
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/20"
            >
              {expandedId === s.id ? (
                <ChevronDown className="h-3 w-3 text-primary" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              <span
                className="mr-2 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
                style={{ backgroundColor: s.color + "22", color: s.color }}
              >
                {s.shortName}
              </span>
              <span className="text-xs text-foreground">{s.name}</span>
            </button>

            {expandedId === s.id && (
              <div className="px-3 pb-3">
                <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <div className="space-y-1">
                  {s.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px]">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                        style={{ backgroundColor: s.color + "22", color: s.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-foreground/80">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyPanel;
