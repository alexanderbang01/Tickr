"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Send, Smile, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CommentWithUser } from "@/types";

interface FacebookCommentsProps {
  postId: string;
  commentCount: number;
}

interface CommentBubbleProps {
  comment: CommentWithUser;
}

function CommentBubble({ comment }: CommentBubbleProps) {
  return (
    <div className="flex gap-2.5 group animate-fade-in">
      <Link href={`/profile/${comment.user.username}`} className="shrink-0 mt-0.5">
        <Avatar user={comment.user} size="xs" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="inline-block bg-[#13151f] border border-[#1e2130] rounded-2xl rounded-tl-sm px-3 py-2 max-w-full">
          <Link
            href={`/profile/${comment.user.username}`}
            className="block text-xs font-semibold text-zinc-300 hover:text-white transition-colors mb-0.5"
          >
            {comment.user.name || comment.user.username}
          </Link>
          <p className="text-sm text-zinc-300 leading-relaxed break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 pl-1">
          <span className="text-[10px] text-zinc-700">{formatTimeAgo(comment.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export function FacebookComments({ postId, commentCount }: FacebookCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments((data.comments ?? []).reverse()); // oldest first
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function submit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const optimistic: CommentWithUser = {
      id: `opt-${Date.now()}`,
      content: text.trim(),
      createdAt: new Date().toISOString(),
      user: {
        id: session!.user.id,
        username: session!.user.username,
        name: session!.user.name ?? null,
        avatarUrl: session!.user.image ?? null,
      },
    };
    setComments((prev) => [...prev, optimistic]);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimistic.content }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? data.comment : c))
      );
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(optimistic.content);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const totalCount = comments.length;

  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-4">
        {totalCount} Comment{totalCount !== 1 && "s"}
      </h3>

      {/* Comment list */}
      <div className="space-y-3 mb-5">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-700">
              No comments yet.{" "}
              {session ? "Be the first to comment." : "Sign in to comment."}
            </p>
          </div>
        ) : (
          comments.map((c) => <CommentBubble key={c.id} comment={c} />)
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      {session ? (
        <div className="flex gap-2.5 items-end sticky bottom-0 pb-2">
          <Avatar user={session.user} size="xs" className="shrink-0 mb-1" />
          <div className="flex-1 flex items-end gap-2 bg-[#13151f] border border-[#1e2130] focus-within:border-indigo-500/50 rounded-2xl px-3 py-2 transition-colors">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); autoResize(); }}
              onKeyDown={onKeyDown}
              placeholder="Write a comment…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-700 resize-none outline-none leading-relaxed"
              style={{ height: "24px", minHeight: "24px" }}
            />
            <button
              onClick={submit}
              disabled={!text.trim() || submitting}
              className={cn(
                "shrink-0 p-1 rounded-lg transition-all",
                text.trim()
                  ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  : "text-zinc-700 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3 px-4 bg-[#0f1117] border border-[#1e2130] rounded-2xl">
          <p className="text-sm text-zinc-600">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>{" "}
            to comment
          </p>
        </div>
      )}
    </div>
  );
}
