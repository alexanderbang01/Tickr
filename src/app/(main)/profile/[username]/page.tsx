import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TradeGrid } from "@/components/profile/TradeGrid";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: { username: string };
}

async function getUserWithPosts(username: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { posts: true, likes: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { id: true, username: true, name: true, avatarUrl: true } },
          marketPair: true,
          tags: true,
          _count: { select: { comments: true, likes: true } },
          likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
        },
      },
    },
  });
  if (!user) return null;
  const posts = user.posts.map((p) => ({
    ...p,
    isLiked: viewerId ? p.likes.length > 0 : false,
    likes: undefined,
  }));
  return { user: { ...user, posts: undefined }, posts };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true, bio: true },
  });
  if (!user) return { title: "User Not Found" };
  return {
    title: `${user.name || user.username} (@${user.username})`,
    description: user.bio || `Trade setups by @${user.username}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const result = await getUserWithPosts(params.username, session?.user?.id);
  if (!result) notFound();

  const { user, posts } = result;
  const isOwner = session?.user?.username === user.username;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader user={{ ...user, posts } as any} />
      <TradeGrid posts={posts as any} isOwner={isOwner} />
    </div>
  );
}
