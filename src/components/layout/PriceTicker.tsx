"use client";

import { useLivePrices, formatLivePrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const TICKER_SYMBOLS = [
  "EUR/USD","GBP/USD","XAU/USD","BTC/USD","ETH/USD",
  "NAS100","US500","SOL/USD","USD/JPY","GBP/JPY","US30","XAG/USD",
];

export function PriceTicker() {
  const prices = useLivePrices();

  const items = TICKER_SYMBOLS.map((sym) => prices[sym]).filter(Boolean);

  return (
    <div className="flex-1 overflow-hidden relative mx-4">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080a10] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#080a10] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-0 animate-none" style={{ overflow: "hidden" }}>
        <div
          className="flex items-center gap-0 shrink-0"
          style={{
            animation: "tickerScroll 40s linear infinite",
            display: "flex",
            whiteSpace: "nowrap",
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...items, ...items].map((p, i) => (
            <div
              key={`${p.symbol}-${i}`}
              className="inline-flex items-center gap-2 px-4 border-r border-zinc-800/50"
            >
              <span className="text-xs font-mono font-medium text-zinc-400">
                {p.symbol}
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-semibold tabular-nums transition-colors duration-500",
                  p.direction === "up" ? "text-buy" : "text-sell"
                )}
              >
                {formatLivePrice(p.price, p.symbol)}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium flex items-center gap-0.5",
                  p.change >= 0 ? "text-buy" : "text-sell"
                )}
              >
                {p.change >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {Math.abs(p.change).toFixed(3)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
