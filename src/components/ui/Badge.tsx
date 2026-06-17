import { cn } from "@/lib/utils";
import { Direction, AssetType } from "@prisma/client";
import { TrendingUp, TrendingDown } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "buy" | "sell" | "asset" | "tag" | "timeframe";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
    buy: "bg-buy-dim text-buy border border-buy-border",
    sell: "bg-sell-dim text-sell border border-sell-border",
    asset: "bg-surface-500 text-zinc-400 border border-[#2d3148]",
    tag: "bg-transparent text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer",
    timeframe: "bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md leading-none",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface DirectionBadgeProps {
  direction: Direction;
  size?: "sm" | "md";
}

export function DirectionBadge({ direction, size = "md" }: DirectionBadgeProps) {
  const isBuy = direction === "BUY";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold rounded-lg",
        isBuy
          ? "bg-buy-dim text-buy border border-buy-border"
          : "bg-sell-dim text-sell border border-sell-border",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      )}
    >
      {isBuy ? (
        <TrendingUp className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      ) : (
        <TrendingDown className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
      {direction}
    </span>
  );
}

interface AssetBadgeProps {
  assetType: AssetType;
}

const assetColors: Record<AssetType, string> = {
  FOREX: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CRYPTO: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  INDICES: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const assetLabels: Record<AssetType, string> = {
  FOREX: "FX",
  CRYPTO: "CRYPTO",
  INDICES: "INDEX",
};

export function AssetBadge({ assetType }: AssetBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border tracking-wide",
        assetColors[assetType]
      )}
    >
      {assetLabels[assetType]}
    </span>
  );
}
