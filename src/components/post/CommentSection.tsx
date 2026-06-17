"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatTimeAgo } from "@/lib/utils";
import type { CommentWithUser } from "@/types";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post comment");
      }
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setContent("");
      toast.success("Comment posted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">
        {comments.length} Comment{comments.length !== 1 && "s"}
      </h3>

      {/* Comment Input */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Avatar user={session.user} size="sm" className="shrink-0 mt-0.5" />
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your analysis..."
              rows={2}
              className="w-full bg-[#0f1117] border border-[#1e2130] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none transition-colors outline-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={!content.trim()}
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-6">
          <p className="text-sm text-zinc-500">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-zinc-600">No comments yet. Start the discussion.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.user.username}`} className="shrink-0">
                <Avatar user={comment.user} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <Link
                    href={`/profile/${comment.user.username}`}
                    className="text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
                  >
                    {comment.user.name || comment.user.username}
                  </Link>
                  <span className="text-xs text-zinc-600">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
