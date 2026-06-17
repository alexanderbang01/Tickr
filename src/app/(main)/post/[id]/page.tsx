import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostDetail } from "@/components/post/PostDetail";
import type { Metadata } from "next";

interface PostPageProps {
  params: { id: string };
}

async function getPost(id: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      marketPair: true,
      tags: true,
      _count: { select: { comments: true, likes: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
    },
  });
  if (!post) return null;
  return {
    ...post,
    isLiked: userId ? post.likes.length > 0 : false,
    likes: undefined,
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { marketPair: true, user: true },
  });
  if (!post) return { title: "Trade Not Found" };
  return {
    title: `${post.direction} ${post.marketPair.symbol} by @${post.user.username}`,
    description: post.description.slice(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);
  const post = await getPost(params.id, session?.user?.id);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PostDetail post={post as any} />
    </div>
  );
}
