"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetType } from "@prisma/client";

const ASSET_TABS: Array<{ value: AssetType | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "FOREX", label: "Forex" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "INDICES", label: "Indices" },
];

const PAIRS_BY_ASSET: Record<string, string[]> = {
  ALL: ["EUR/USD","GBP/USD","XAU/USD","BTC/USD","ETH/USD","NAS100","US500","SOL/USD","USD/JPY","GBP/JPY"],
  FOREX: ["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","XAU/USD","XAG/USD","EUR/GBP","EUR/JPY","GBP/JPY"],
  CRYPTO: ["BTC/USD","ETH/USD","SOL/USD","BNB/USD","XRP/USD","ADA/USD","DOGE/USD","AVAX/USD"],
  INDICES: ["US30","US500","NAS100","GER40","UK100","JPN225","AUS200"],
};

const TAGS = ["scalping","swing","breakout","reversal","trend","news","support","resistance","ict","smc"];

interface FilterBarProps {
  popout?: boolean;
}

export function FilterBar({ popout = false }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentAsset = (searchParams.get("assetType") ?? "ALL") as AssetType | "ALL";
  const currentDirection = searchParams.get("direction") ?? "ALL";
  const currentPair = searchParams.get("pair") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  const activeFilters = [currentDirection !== "ALL", currentPair, currentTag].filter(Boolean).length;

  const update = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (!value || value === "ALL") p.delete(key);
      else p.set(key, value);
      p.delete("cursor");
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function clearAll() {
    router.push(pathname, { scroll: false });
    setOpen(false);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (popout) {
    // Popout-only mode (Explore page)
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all",
            open || activeFilters > 0
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
              : "bg-[#0f1117] text-zinc-400 border-[#1e2130] hover:border-[#2d3148] hover:text-zinc-200"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 w-80 bg-[#0f1117] border border-[#1e2130] rounded-2xl shadow-2xl shadow-black/50 p-4 z-30 animate-fade-in">
            <FilterContent
              currentAsset={currentAsset}
              currentDirection={currentDirection}
              currentPair={currentPair}
              currentTag={currentTag}
              onUpdate={update}
              onClear={clearAll}
              activeFilters={activeFilters}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  // Inline mode (Home feed)
  return (
    <div className="flex items-center gap-2 pb-4 border-b border-[#1e2130] overflow-x-auto no-scrollbar">
      {ASSET_TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => update("assetType", value)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap",
            currentAsset === value
              ? "bg-white/10 text-white border border-white/10"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
          )}
        >
          {label}
        </button>
      ))}
      <div className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />
      {["ALL","BUY","SELL"].map((v) => (
        <button
          key={v}
          onClick={() => update("direction", v)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap",
            currentDirection === v
              ? v === "BUY"
                ? "bg-buy-dim text-buy border border-buy-border"
                : v === "SELL"
                ? "bg-sell-dim text-sell border border-sell-border"
                : "bg-white/10 text-white border border-white/10"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
          )}
        >
          {v === "ALL" ? "Any" : v === "BUY" ? "Long" : "Short"}
        </button>
      ))}
      <div className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />
      <select
        value={currentPair}
        onChange={(e) => update("pair", e.target.value)}
        className="appearance-none bg-transparent border border-zinc-800 hover:border-zinc-700 text-sm rounded-lg pl-3 pr-7 py-1.5 cursor-pointer text-zinc-400 focus:outline-none"
      >
        <option value="">All Pairs</option>
        {PAIRS_BY_ASSET[currentAsset]?.map((p) => (
          <option key={p} value={p} className="bg-[#0f1117]">{p}</option>
        ))}
      </select>
    </div>
  );
}

function FilterContent({
  currentAsset, currentDirection, currentPair, currentTag,
  onUpdate, onClear, activeFilters, onClose,
}: {
  currentAsset: AssetType | "ALL"; currentDirection: string; currentPair: string; currentTag: string;
  onUpdate: (k: string, v: string) => void; onClear: () => void;
  activeFilters: number; onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200">Filters</span>
        {activeFilters > 0 && (
          <button onClick={onClear} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <X className="w-3 h-3" />Clear all
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-2">Asset Class</p>
        <div className="flex gap-1.5 flex-wrap">
          {ASSET_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => onUpdate("assetType", value)}
              className={cn("px-3 py-1 text-xs rounded-lg font-medium border transition-all",
                currentAsset === value
                  ? "bg-white/10 text-white border-white/10"
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-2">Direction</p>
        <div className="flex gap-1.5">
          {[["ALL","Any"],["BUY","Long"],["SELL","Short"]].map(([v,l]) => (
            <button key={v} onClick={() => onUpdate("direction", v)}
              className={cn("flex-1 py-1.5 text-xs rounded-lg font-medium border transition-all",
                currentDirection === v
                  ? v === "BUY" ? "bg-buy-dim text-buy border-buy-border"
                    : v === "SELL" ? "bg-sell-dim text-sell border-sell-border"
                    : "bg-white/10 text-white border-white/10"
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700"
              )}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-2">Market Pair</p>
        <select value={currentPair} onChange={(e) => onUpdate("pair", e.target.value)}
          className="w-full appearance-none bg-[#0f1117] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer">
          <option value="">All Pairs</option>
          {PAIRS_BY_ASSET[currentAsset]?.map((p) => (
            <option key={p} value={p} className="bg-[#0f1117]">{p}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-2">Strategy Tag</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => onUpdate("tag", currentTag === tag ? "" : tag)}
              className={cn("px-2.5 py-1 text-xs rounded-lg border font-medium transition-all",
                currentTag === tag
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  : "text-zinc-600 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400"
              )}>
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onClose} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
        Apply Filters
      </button>
    </div>
  );
}
