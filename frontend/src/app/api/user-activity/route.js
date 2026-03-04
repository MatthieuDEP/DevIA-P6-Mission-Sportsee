import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/authConstants";
import { isMock } from "@/lib/dataSource";

import { apiGetUserActivity } from "@/mocks/mockData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startWeek = searchParams.get("startWeek");
  const endWeek = searchParams.get("endWeek");

  if (!startWeek || !endWeek) {
    return NextResponse.json({ error: "Missing startWeek/endWeek" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (isMock()) {
    if (!token) return NextResponse.json({ activity: [] }, { status: 401 });

    try {
      const activity = apiGetUserActivity(token, { startWeek, endWeek });
      return NextResponse.json({ activity: Array.isArray(activity) ? activity : [] });
    } catch {
      return NextResponse.json({ activity: [] }, { status: 401 });
    }
  }

  if (!token) {
    return NextResponse.json({ activity: [] }, { status: 401 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const res = await fetch(
    `${apiBase}/api/user-activity?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ activity: [] }, { status: res.status });
  }

  const activity = await res.json();
  return NextResponse.json({ activity: Array.isArray(activity) ? activity : [] });
}