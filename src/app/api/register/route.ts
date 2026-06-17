import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(60),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0] as string;
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input", field },
        { status: 400 }
      );
    }

    const { name, username, email, password } = parsed.data;

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: email.toLowerCase() } }),
      prisma.user.findUnique({ where: { username: username.toLowerCase() } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already in use", field: "email" },
        { status: 409 }
      );
    }
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is taken", field: "username" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashed,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
