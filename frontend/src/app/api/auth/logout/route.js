import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, USER_ID_COOKIE } from "@/lib/authConstants";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(AUTH_TOKEN_COOKIE);
  res.cookies.delete(USER_ID_COOKIE);
  return res;
}