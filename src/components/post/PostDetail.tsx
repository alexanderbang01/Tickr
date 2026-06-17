"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  ArrowLeft, Heart, MessageSquare, Trash2, Share2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { DirectionBadge, AssetBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CommentSection } from "@/components/post/CommentSection";
import {
  cn, formatTimeAgo, formatPrice, calculateRR, getRRColor,
} from "@/lib/utils";
import type { PostWithDetails } from "@/types";

interface PostDetailProps {
  post: PostWithDetails;
}

interface MetricRowProps {
  label: string;
  value: string;
  color?: string;
}

function MetricRow({ label, value, color = "text-zinc-200" }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1e2130] last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={cn("font-mono text-sm font-semibold tabular-nums", color)}>
        {value}
      </span>
    </div>
  );
}

export function PostDetail({ post }: PostDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const symbol = post.marketPair.symbol;
  const rr = calculateRR(post.direction, post.entryPrice, post.stopLoss, post.takeProfit);
  const isOwner = session?.user?.id === post.userId;

  async function handleLike() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(!newLiked);
      setLikeCount(likeCount);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trade setup? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Trade deleted");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete trade");
      setDeleting(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to feed
      </button>

      <article className="card p-6 mb-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.user.username}`}>
              <Avatar user={post.user} size="md" />
            </Link>
            <div>
              <Link
                href={`/profile/${post.user.username}`}
                className="font-semibold text-white hover:text-indigo-400 transition-colors"
              >
                {post.user.name || post.user.username}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-zinc-600">@{post.user.username}</span>
                <span className="text-xs text-zinc-700">·</span>
                <span className="text-sm text-zinc-600">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AssetBadge assetType={post.marketPair.assetType} />
            <span className="font-mono text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">
              {symbol}
            </span>
            <span className="font-mono text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 px-1.5 py-1 rounded">
              {post.timeframe}
            </span>
          </div>
        </div>

        {/* Direction */}
        <div className="flex items-center gap-3 mb-5">
          <DirectionBadge direction={post.direction} size="md" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="tag">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Metrics */}
        <div className="rounded-xl bg-black/30 border border-zinc-900 p-4 mb-5">
          <MetricRow label="Entry Price" value={formatPrice(post.entryPrice, symbol)} />
          <MetricRow
            label="Stop Loss"
            value={formatPrice(post.stopLoss, symbol)}
            color="text-sell"
          />
          <MetricRow
            label="Take Profit"
            value={formatPrice(post.takeProfit, symbol)}
            color="text-buy"
          />
          <MetricRow
            label="Risk : Reward"
            value={rr > 0 ? `1 : ${rr.toFixed(2)}` : "—"}
            color={getRRColor(rr)}
          />
          <MetricRow
            label="Risk (pips)"
            value={Math.abs(post.entryPrice - post.stopLoss).toFixed(
              symbol.includes("JPY") ? 3 : 5
            )}
          />
        </div>

        {/* Chart Image */}
        {post.chartUrl && (
          <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/50 mb-5">
            <div className="aspect-video relative">
              <Image
                src={post.chartUrl}
                alt={`${symbol} chart`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
            Analysis
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1e2130]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 active:scale-95",
                liked ? "text-red-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <MessageSquare className="w-4 h-4" />
              {post._count.comments}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            {isOwner && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="card p-6 animate-fade-in">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
