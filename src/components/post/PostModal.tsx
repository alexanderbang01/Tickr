"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, Share2, Trash2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { AssetBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FacebookComments } from "@/components/post/FacebookComments";
import { cn, formatTimeAgo, formatPrice, calculateRR, getRRColor } from "@/lib/utils";
import type { PostWithDetails } from "@/types";

interface PostModalProps {
  postId: string;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-black/30 border border-zinc-900 rounded-xl p-3 text-center">
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className="font-mono text-sm font-bold text-zinc-100">{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function PostModal({ postId }: PostModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const close = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data.post);
        setLikeCount(data.post?._count?.likes ?? 0);
        setLiked(data.post?.isLiked ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  async function handleLike() {
    if (!session) { router.push("/login"); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(!newLiked);
      setLikeCount(likeCount);
      toast.error("Failed to like");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trade setup?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      toast.success("Trade deleted");
      close();
      router.refresh();
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={close}
      />

      {/* Panel — full screen on mobile, side panel on sm+ */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-[#0a0c13] border-l border-[#1e2130] z-50 overflow-y-auto shadow-2xl"
        style={{ animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-[#0a0c13]/95 backdrop-blur border-b border-[#1e2130]">
          <span className="text-sm font-semibold text-zinc-400">Trade Setup</span>
          <button
            onClick={close}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
          </div>
        ) : !post ? (
          <div className="flex items-center justify-center py-20 text-zinc-600 text-sm">
            Trade not found
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            {/* User + meta */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${post.user.username}`} onClick={close}>
                  <Avatar user={post.user} size="md" />
                </Link>
                <div>
                  <Link href={`/profile/${post.user.username}`} onClick={close} className="font-semibold text-white hover:text-indigo-400 transition-colors">
                    {post.user.name || post.user.username}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 mt-0.5">
                    <span>@{post.user.username}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                <span className="hidden sm:inline"><AssetBadge assetType={post.marketPair.assetType} /></span>
                <span className="font-mono text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                  {post.marketPair.symbol}
                </span>
                <span className="font-mono text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 px-1.5 py-0.5 sm:py-1 rounded">
                  {post.timeframe}
                </span>
              </div>
            </div>

            {/* Direction pill */}
            <div className="flex items-center gap-3 mb-5">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border",
                post.direction === "BUY"
                  ? "bg-buy-dim text-buy border-buy-border"
                  : "bg-sell-dim text-sell border-sell-border"
              )}>
                {post.direction === "BUY"
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />}
                {post.direction === "BUY" ? "LONG" : "SHORT"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Badge key={t.id} variant="tag">#{t.name}</Badge>
                ))}
              </div>
            </div>

            {/* Price metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <MetricCard label="Entry" value={formatPrice(post.entryPrice, post.marketPair.symbol)} />
              <MetricCard label="Stop Loss" value={formatPrice(post.stopLoss, post.marketPair.symbol)} />
              <MetricCard label="Take Profit" value={formatPrice(post.takeProfit, post.marketPair.symbol)} />
              <MetricCard
                label="R:R"
                value={`1:${calculateRR(post.direction, post.entryPrice, post.stopLoss, post.takeProfit).toFixed(2)}`}
              />
            </div>

            {/* Chart */}
            {post.chartUrl && (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800/50 mb-5 bg-zinc-950">
                <div className="aspect-video relative">
                  <Image
                    src={post.chartUrl}
                    alt={`${post.marketPair.symbol} chart`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Analysis */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">
                Analysis
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between py-4 border-t border-[#1e2130] mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 active:scale-95",
                    liked ? "text-red-400" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                  {likeCount}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
                {session?.user?.id === post.userId && (
                  <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Comments */}
            <FacebookComments postId={post.id} commentCount={post._count.comments} />
          </div>
        )}
      </div>
    </>
  );
}
