import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Direction, AssetType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export function calculateRR(
  direction: Direction,
  entry: number,
  sl: number,
  tp: number
): number {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return 0;
  return reward / risk;
}

export function formatPrice(price: number, symbol: string): string {
  const jpyPairs = ["JPY"];
  const indexSymbols = ["US30", "US500", "NAS100", "GER40", "UK100", "JPN225", "AUS200"];

  if (indexSymbols.some((s) => symbol.includes(s))) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  if (jpyPairs.some((s) => symbol.includes(s))) {
    return price.toFixed(3);
  }

  if (symbol.includes("XAU") || symbol.includes("XAG")) {
    return price.toFixed(2);
  }

  const cryptoBase = ["BTC", "ETH", "SOL", "BNB"];
  if (cryptoBase.some((s) => symbol.startsWith(s))) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const smallCrypto = ["XRP", "ADA", "DOGE", "AVAX"];
  if (smallCrypto.some((s) => symbol.startsWith(s))) {
    return price.toFixed(4);
  }

  return price.toFixed(5);
}

export function getAssetTypeLabel(type: AssetType): string {
  const map: Record<AssetType, string> = {
    FOREX: "Forex",
    CRYPTO: "Crypto",
    INDICES: "Indices",
  };
  return map[type];
}

export function getAssetTypeColor(type: AssetType): string {
  const map: Record<AssetType, string> = {
    FOREX: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    CRYPTO: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    INDICES: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return map[type];
}

export function getRRColor(rr: number): string {
  if (rr >= 2) return "text-buy";
  if (rr >= 1) return "text-zinc-300";
  return "text-sell";
}
