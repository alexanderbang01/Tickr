"use client";

import { useSearchParams } from "next/navigation";
import { PostModal } from "./PostModal";

export function PostModalHandler() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");
  if (!postId) return null;
  return <PostModal postId={postId} />;
}
