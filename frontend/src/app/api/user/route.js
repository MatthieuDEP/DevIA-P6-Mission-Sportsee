import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/authConstants";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const res = await fetch(`${apiBase}/api/user-info`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await res.json();

  const profile = payload?.profile || {};
  const statistics = payload?.statistics || {};

  return NextResponse.json({
    user: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      age: profile.age ?? null,
      weight: profile.weight ?? null,
      height: profile.height ?? null,
      profilePicture: profile.profilePicture || "",
      createdAt: profile.createdAt || "",
      statistics,
    },
  });
}