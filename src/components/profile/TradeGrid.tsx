"use client";

import { useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/feed/EmptyState";
import { cn } from "@/lib/utils";
import type { PostWithDetails } from "@/types";

const TABS = [
  { value: "ALL", label: "All" },
  { value: "BUY", label: "Long" },
  { value: "SELL", label: "Short" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
] as const;

type Tab = (typeof TABS)[number]["value"];

interface TradeGridProps {
  posts: PostWithDetails[];
  isOwner?: boolean;
}

export function TradeGrid({ posts, isOwner }: TradeGridProps) {
  const [tab, setTab] = useState<Tab>("ALL");

  const filtered = posts.filter((p) => {
    if (tab === "ALL") return true;
    if (tab === "BUY" || tab === "SELL") return p.direction === tab;
    if (tab === "ACTIVE") return p.status === "ACTIVE";
    if (tab === "CLOSED") return p.status === "CLOSED";
    return true;
  });

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#1e2130] pb-0">
        {TABS.map(({ value, label }) => {
          const count = posts.filter((p) => {
            if (value === "ALL") return true;
            if (value === "BUY" || value === "SELL") return p.direction === value;
            if (value === "ACTIVE") return p.status === "ACTIVE";
            if (value === "CLOSED") return p.status === "CLOSED";
            return true;
          }).length;

          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                "relative px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                tab === value
                  ? "text-white"
                  : "text-zinc-600 hover:text-zinc-300"
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  "ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  tab === value
                    ? "bg-white/10 text-white"
                    : "bg-zinc-900 text-zinc-600"
                )}>
                  {count}
                </span>
              )}
              {tab === value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No trades here"
          description={
            tab === "ALL"
              ? isOwner
                ? "Post your first trade setup to get started."
                : "This user hasn't shared any trade setups yet."
              : `No ${tab.toLowerCase()} setups found.`
          }
          showCreate={isOwner && tab === "ALL"}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
