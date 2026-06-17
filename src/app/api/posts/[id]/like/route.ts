import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: params.id, userId: session.user.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { postId: params.id, userId: session.user.id },
      });
    }

    const count = await prisma.like.count({ where: { postId: params.id } });
    return NextResponse.json({ liked: !existing, count });
  } catch (err) {
    console.error("[like:POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
