"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, Globe, Bitcoin, BarChart2 } from "lucide-react";
import { useLivePrices, formatLivePrice } from "@/hooks/useLivePrices";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const SECTIONS = [
  {
    id: "FOREX",
    label: "Forex",
    icon: Globe,
    color: "text-blue-400",
    pairs: ["EUR/USD","GBP/USD","USD/JPY","XAU/USD","USD/CHF","AUD/USD","GBP/JPY","EUR/JPY","USD/CAD","XAG/USD"],
  },
  {
    id: "CRYPTO",
    label: "Crypto",
    icon: Bitcoin,
    color: "text-orange-400",
    pairs: ["BTC/USD","ETH/USD","SOL/USD","BNB/USD","XRP/USD","ADA/USD","DOGE/USD","AVAX/USD"],
  },
  {
    id: "INDICES",
    label: "Indices",
    icon: BarChart2,
    color: "text-purple-400",
    pairs: ["NAS100","US500","US30","GER40","UK100","JPN225","AUS200"],
  },
];

function MarketRow({ symbol, prices }: { symbol: string; prices: ReturnType<typeof useLivePrices> }) {
  const data = prices[symbol];
  if (!data) return null;

  const isUp = data.direction === "up";
  const changeAbs = Math.abs(data.change);

  return (
    <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-white/[0.02] rounded-xl transition-all cursor-default group border border-transparent hover:border-[#1e2130]">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0",
          isUp ? "bg-buy-dim text-buy" : "bg-sell-dim text-sell"
        )}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white font-mono">{symbol}</p>
          <p className="text-xs text-zinc-600 truncate hidden sm:block">{data.label}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <p className={cn(
          "font-mono text-sm font-semibold tabular-nums transition-colors",
          isUp ? "text-buy" : "text-sell"
        )}>
          {formatLivePrice(data.price, symbol)}
        </p>
        <div className={cn("text-right w-16 sm:w-20", isUp ? "text-buy" : "text-sell")}>
          <p className="text-xs font-medium font-mono tabular-nums">
            {isUp ? "+" : "-"}{changeAbs.toFixed(2)}%
          </p>
          <div className="mt-0.5 h-1 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", isUp ? "bg-buy" : "bg-sell")}
              style={{ width: `${Math.min(changeAbs * 40, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ isUp }: { isUp: boolean }) {
  const points = Array.from({ length: 20 }, (_, i) => ({
    x: i * 5,
    y: 30 + Math.random() * 20 * (isUp ? -0.6 : 0.6) + (isUp ? -i * 0.5 : i * 0.5),
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 100 60" className="w-16 h-8 opacity-60">
      <path d={path} fill="none" stroke={isUp ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketsPage() {
  const prices = useLivePrices();
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const visibleSections = activeTab === "ALL" ? SECTIONS : SECTIONS.filter((s) => s.id === activeTab);

  const totalUp = Object.values(prices).filter((p) => p.direction === "up").length;
  const totalDown = Object.values(prices).filter((p) => p.direction === "down").length;
  const total = totalUp + totalDown;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse-slow" />
            <h1 className="text-xl font-bold text-white">Markets</h1>
            <span className="text-xs px-2 py-0.5 bg-buy-dim text-buy border border-buy-border rounded-full font-medium">
              LIVE
            </span>
          </div>
          <p className="text-sm text-zinc-600">Real-time prices across Forex, Crypto &amp; Indices</p>
        </div>

        {/* Breadth indicator */}
        <div className="sm:text-right">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-zinc-600">Market breadth</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-buy">{totalUp} ↑</span>
              <span className="text-xs text-zinc-700">·</span>
              <span className="text-xs font-medium text-sell">{totalDown} ↓</span>
            </div>
          </div>
          {total > 0 && (
            <div className="h-1.5 w-32 rounded-full bg-sell overflow-hidden">
              <div
                className="h-full rounded-full bg-buy transition-all duration-1000"
                style={{ width: `${(totalUp / total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex gap-1.5 mb-6">
        {[{ id: "ALL", label: "All Markets" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label }))].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg font-medium transition-all",
              activeTab === id
                ? "bg-white/10 text-white border border-white/10"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {visibleSections.map(({ id, label, icon: Icon, color, pairs }) => (
          <div key={id} className="bg-[#0f1117] border border-[#1e2130] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2130]">
              <Icon className={cn("w-4 h-4", color)} />
              <h2 className="text-sm font-semibold text-zinc-200">{label}</h2>
              <span className="ml-auto text-xs text-zinc-700">{pairs.length} pairs</span>
            </div>
            <div className="py-1">
              {pairs.map((symbol) => (
                <MarketRow key={symbol} symbol={symbol} prices={prices} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-zinc-800 mt-8">
        Prices are simulated for demonstration purposes · Updates every 2s
      </p>
    </div>
  );
}
