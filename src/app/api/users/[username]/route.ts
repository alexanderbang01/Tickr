import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { posts: true, likes: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[user:GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
