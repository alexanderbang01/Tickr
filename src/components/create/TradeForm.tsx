"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ImageUpload } from "@/components/create/ImageUpload";
import { cn } from "@/lib/utils";
import {
  MARKET_PAIRS_BY_ASSET, TIMEFRAMES, STRATEGY_TAGS,
  type AssetType, type Direction, type Timeframe,
} from "@/types";

interface FormState {
  assetType: AssetType;
  marketPairId: string;
  direction: Direction;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  timeframe: Timeframe;
  description: string;
  chartUrl: string;
  tags: string[];
}

const DEFAULT: FormState = {
  assetType: "FOREX",
  marketPairId: "",
  direction: "BUY",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  timeframe: "H4",
  description: "",
  chartUrl: "",
  tags: [],
};

export function TradeForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleTag(tag: string) {
    set(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag]
    );
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.marketPairId) errs.marketPairId = "Select a market pair";
    if (!form.entryPrice || isNaN(Number(form.entryPrice)))
      errs.entryPrice = "Enter a valid entry price";
    if (!form.stopLoss || isNaN(Number(form.stopLoss)))
      errs.stopLoss = "Enter a valid stop loss";
    if (!form.takeProfit || isNaN(Number(form.takeProfit)))
      errs.takeProfit = "Enter a valid take profit";
    if (!form.description.trim())
      errs.description = "Add your analysis";
    if (form.description.length > 2000)
      errs.description = "Description must be under 2000 characters";

    const entry = Number(form.entryPrice);
    const sl = Number(form.stopLoss);
    const tp = Number(form.takeProfit);

    if (form.direction === "BUY") {
      if (!errs.stopLoss && sl >= entry) errs.stopLoss = "Stop loss must be below entry for BUY";
      if (!errs.takeProfit && tp <= entry) errs.takeProfit = "Take profit must be above entry for BUY";
    } else {
      if (!errs.stopLoss && sl <= entry) errs.stopLoss = "Stop loss must be above entry for SELL";
      if (!errs.takeProfit && tp >= entry) errs.takeProfit = "Take profit must be below entry for SELL";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketPairId: form.marketPairId,
          direction: form.direction,
          entryPrice: Number(form.entryPrice),
          stopLoss: Number(form.stopLoss),
          takeProfit: Number(form.takeProfit),
          timeframe: form.timeframe,
          description: form.description.trim(),
          chartUrl: form.chartUrl || undefined,
          tags: form.tags,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create trade");
      }
      const data = await res.json();
      toast.success("Trade posted!");
      router.push(`/post/${data.post.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create trade");
      setSubmitting(false);
    }
  }

  const availablePairs = MARKET_PAIRS_BY_ASSET[form.assetType];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Section: Market */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Market
        </h2>
        <div className="space-y-4">
          {/* Asset type toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Asset Class
            </label>
            <div className="flex gap-2">
              {(["FOREX", "CRYPTO", "INDICES"] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    set("assetType", type);
                    set("marketPairId", "");
                  }}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg font-medium border transition-all",
                    form.assetType === type
                      ? type === "FOREX"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : type === "CRYPTO"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {type === "INDICES" ? "Indices" : type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Market pair */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Market Pair
              </label>
              <div className="relative">
                <select
                  value={form.marketPairId}
                  onChange={(e) => set("marketPairId", e.target.value)}
                  className={cn(
                    "w-full appearance-none bg-[#0f1117] border rounded-lg px-3.5 pr-8 py-2.5 text-sm text-zinc-100 transition-colors outline-none cursor-pointer",
                    errors.marketPairId
                      ? "border-red-500/60"
                      : "border-[#1e2130] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                  )}
                >
                  <option value="">Select pair...</option>
                  {availablePairs.map((p) => (
                    <option key={p.symbol} value={p.symbol} className="bg-[#13151f]">
                      {p.symbol}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {errors.marketPairId && (
                <p className="mt-1 text-xs text-red-400">{errors.marketPairId}</p>
              )}
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Timeframe
              </label>
              <div className="relative">
                <select
                  value={form.timeframe}
                  onChange={(e) => set("timeframe", e.target.value as Timeframe)}
                  className="w-full appearance-none bg-[#0f1117] border border-[#1e2130] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-3.5 pr-8 py-2.5 text-sm text-zinc-100 outline-none cursor-pointer font-mono"
                >
                  {TIMEFRAMES.map(({ value, label }) => (
                    <option key={value} value={value} className="bg-[#13151f]">
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Direction + Prices */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Trade Setup
        </h2>
        {/* Direction */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Direction
          </label>
          <div className="flex gap-3">
            {(["BUY", "SELL"] as Direction[]).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => set("direction", dir)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-bold rounded-lg border transition-all",
                  form.direction === dir
                    ? dir === "BUY"
                      ? "bg-buy-dim text-buy border-buy-border"
                      : "bg-sell-dim text-sell border-sell-border"
                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {dir === "BUY" ? "▲ LONG" : "▼ SHORT"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Entry Price"
            type="number"
            step="any"
            placeholder="0.00000"
            value={form.entryPrice}
            onChange={(e) => set("entryPrice", e.target.value)}
            error={errors.entryPrice}
            className="font-mono"
          />
          <Input
            label="Stop Loss"
            type="number"
            step="any"
            placeholder="0.00000"
            value={form.stopLoss}
            onChange={(e) => set("stopLoss", e.target.value)}
            error={errors.stopLoss}
            className="font-mono text-sell placeholder:text-zinc-700"
          />
          <Input
            label="Take Profit"
            type="number"
            step="any"
            placeholder="0.00000"
            value={form.takeProfit}
            onChange={(e) => set("takeProfit", e.target.value)}
            error={errors.takeProfit}
            className="font-mono text-buy placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Section: Analysis */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Analysis
        </h2>
        <Textarea
          label="Trade rationale"
          placeholder="Describe your analysis, key levels, confluence factors, and trade plan..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          error={errors.description}
          rows={5}
          hint={`${form.description.length}/2000 characters`}
        />
      </div>

      {/* Section: Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Chart (optional)
        </h2>
        <ImageUpload
          value={form.chartUrl}
          onChange={(url) => set("chartUrl", url)}
        />
      </div>

      {/* Section: Tags */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Strategy Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {STRATEGY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1 text-sm rounded-lg border font-medium transition-all",
                form.tags.includes(tag)
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  : "bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" loading={submitting}>
          Publish Trade Setup
        </Button>
      </div>
    </form>
  );
}
