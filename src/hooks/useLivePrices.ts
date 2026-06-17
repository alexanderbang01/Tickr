"use client";

import { useState, useEffect, useRef } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  direction: "up" | "down";
  label: string;
}

const BASE: Record<string, { price: number; label: string }> = {
  "EUR/USD": { price: 1.08420, label: "EUR/USD" },
  "GBP/USD": { price: 1.27350, label: "GBP/USD" },
  "USD/JPY": { price: 149.850, label: "USD/JPY" },
  "XAU/USD": { price: 2024.50, label: "XAU/USD" },
  "XAG/USD": { price: 23.840, label: "XAG/USD" },
  "BTC/USD": { price: 43250.0, label: "BTC/USD" },
  "ETH/USD": { price: 2318.40, label: "ETH/USD" },
  "SOL/USD": { price: 98.45, label: "SOL/USD" },
  "NAS100":  { price: 17340.0, label: "NAS100" },
  "US500":   { price: 4890.0, label: "US500" },
  "US30":    { price: 38420.0, label: "US30" },
  "GBP/JPY": { price: 190.65, label: "GBP/JPY" },
};

function initialState(): Record<string, LivePrice> {
  return Object.fromEntries(
    Object.entries(BASE).map(([sym, { price, label }]) => [
      sym,
      { symbol: sym, price, change: 0, direction: "up" as const, label },
    ])
  );
}

export function useLivePrices(): Record<string, LivePrice> {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(initialState);
  const baseRef = useRef<Record<string, number>>(
    Object.fromEntries(Object.entries(BASE).map(([s, { price }]) => [s, price]))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sym) => {
          const cur = next[sym];
          // tiny random walk: ±0.008%
          const drift = (Math.random() - 0.495) * 0.00016;
          const newPrice = cur.price * (1 + drift);
          const change = ((newPrice - baseRef.current[sym]) / baseRef.current[sym]) * 100;
          next[sym] = {
            ...cur,
            price: newPrice,
            change,
            direction: newPrice >= cur.price ? "up" : "down",
          };
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return prices;
}

export function formatLivePrice(price: number, symbol: string): string {
  if (["BTC/USD", "US30", "NAS100", "US500"].some((s) => symbol.includes(s))) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  if (["XAU/USD", "XAG/USD", "ETH/USD", "SOL/USD"].some((s) => symbol.includes(s))) {
    return price.toFixed(2);
  }
  if (symbol.includes("JPY")) return price.toFixed(3);
  return price.toFixed(5);
}
