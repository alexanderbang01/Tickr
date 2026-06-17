"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { DirectionBadge, AssetBadge, Badge } from "@/components/ui/Badge";
import { cn, formatTimeAgo, formatPrice, calculateRR, getRRColor } from "@/lib/utils";
import type { PostWithDetails } from "@/types";

interface PostCardProps {
  post: PostWithDetails;
  onLikeChange?: (postId: string, liked: boolean, count: number) => void;
}

function PriceCell({
  label, value, symbol, color = "text-zinc-200",
}: { label: string; value: number; symbol: string; color?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("font-mono text-xs sm:text-sm font-semibold tabular-nums truncate", color)}>
        {formatPrice(value, symbol)}
      </p>
    </div>
  );
}

export function PostCard({ post, onLikeChange }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);

  const rr = calculateRR(post.direction, post.entryPrice, post.stopLoss, post.takeProfit);
  const symbol = post.marketPair.symbol;

  function openModal(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    router.push(`${pathname}?post=${post.id}`, { scroll: false });
  }

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    if (isLiking) return;
    setIsLiking(true);
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newCount);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
      onLikeChange?.(post.id, data.liked, data.count);
    } catch {
      setLiked(!newLiked);
      setLikeCount(likeCount);
      toast.error("Failed to like");
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <article
      onClick={openModal}
      className="card card-hover cursor-pointer group animate-slide-up select-none"
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href={`/profile/${post.user.username}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <Avatar user={post.user} size="sm" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${post.user.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors truncate"
                >
                  {post.user.name || post.user.username}
                </Link>
                <span className="text-xs text-zinc-700 hidden sm:inline">·</span>
                <span className="text-xs text-zinc-600 shrink-0 hidden sm:inline">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <p className="text-xs text-zinc-600">@{post.user.username} · <span className="sm:hidden">{formatTimeAgo(post.createdAt)}</span></p>
            </div>
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:inline"><AssetBadge assetType={post.marketPair.assetType} /></span>
            <span className="font-mono text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-md">
              {symbol}
            </span>
            <span className="font-mono text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 px-1.5 py-0.5 rounded">
              {post.timeframe}
            </span>
          </div>
        </div>

        {/* Direction + tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <DirectionBadge direction={post.direction} />
          <div className="flex items-center gap-1 flex-wrap">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="tag">#{tag.name}</Badge>
            ))}
          </div>
        </div>

        {/* Price grid — 2 cols on mobile, 4 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 px-3 sm:px-4 py-3 rounded-xl bg-black/30 border border-zinc-900/80">
          <PriceCell label="Entry" value={post.entryPrice} symbol={symbol} />
          <PriceCell label="Stop Loss" value={post.stopLoss} symbol={symbol} color="text-sell" />
          <PriceCell label="Take Profit" value={post.takeProfit} symbol={symbol} color="text-buy" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-1">R:R</p>
            <p className={cn("font-mono text-xs sm:text-sm font-bold", getRRColor(rr))}>
              {rr > 0 ? `1:${rr.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>

        {/* Chart image */}
        {post.chartUrl && (
          <div className="relative mb-4 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/50">
            <div className="aspect-video relative">
              <Image src={post.chartUrl} alt={`${symbol} chart`} fill className="object-cover" />
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 mb-4">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#1e2130]">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-all hover:scale-105 active:scale-95",
              liked ? "text-red-400" : "text-zinc-600 hover:text-zinc-300"
            )}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-current")} />
            {likeCount}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-zinc-600">
            <MessageSquare className="w-4 h-4" />
            {post._count.comments}
          </span>
          <span className="ml-auto text-xs text-zinc-700 group-hover:text-zinc-500 transition-colors hidden sm:block">
            Tap to read more →
          </span>
        </div>
      </div>
    </article>
  );
}
