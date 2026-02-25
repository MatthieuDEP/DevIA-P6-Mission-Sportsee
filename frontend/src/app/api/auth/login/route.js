import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, USER_ID_COOKIE } from "@/lib/authConstants";

export async function POST(request) {
  const body = await request.json();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const response = await fetch(`${apiBase}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await response.json(); 

  const res = NextResponse.json({ success: true });

  res.cookies.set(AUTH_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false, 
  });

  res.cookies.set(USER_ID_COOKIE, String(data.userId), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
  });

  return res;
}