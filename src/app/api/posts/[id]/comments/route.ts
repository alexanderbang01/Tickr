import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("[comments:GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const schema = z.object({
  content: z.string().min(1).max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        postId: params.id,
        userId: session.user.id,
        content: parsed.data.content.trim(),
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("[comments:POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
