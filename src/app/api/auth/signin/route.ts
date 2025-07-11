import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { generateToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Your password is incorrect" },
        { status: 401 }
      );
    }

    // JWT üret
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Veritabanına kaydet
    await prisma.userToken.create({
      data: {
        token,
        tokenExpiry: addMinutes(new Date(), 30),
        userId: user.id,
      },
    });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error("Error logging in:", error.message, error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
