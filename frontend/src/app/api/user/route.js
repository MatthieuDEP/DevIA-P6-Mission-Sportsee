import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/authConstants";
import { isMock } from "@/lib/dataSource";
import { apiGetUserInfo } from "@/mocks/mockData";

function filenameFromUrl(v) {
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.pathname.split("/").pop() || "";
  } catch {
    return String(v).split("/").pop() || "";
  }
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function minutesToHHMM(totalMinutes) {
  const m = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${mm}min`;
  return `${h}h ${String(mm).padStart(2, "0")}min`;
}

function normalizeGenderFromProfile(profile) {
  const v = profile?.gender ?? profile?.sex ?? profile?.genre ?? profile?.sexe ?? null;
  if (!v) return null;
  const s = String(v).toLowerCase();
  if (s === "female" || s === "f") return "Femme";
  if (s === "male" || s === "m") return "Homme";
  return v;
}

function calcRestDaysFromAllSessions(sessions) {
  if (!sessions.length) return "—";

  const dates = sessions
    .map((s) => String(s.date || ""))
    .filter(Boolean)
    .map((d) => d.slice(0, 10));

  if (!dates.length) return "—";

  const uniqueDays = new Set(dates);

  let min = dates[0];
  let max = dates[0];
  for (const d of dates) {
    if (d < min) min = d;
    if (d > max) max = d;
  }

  const minD = new Date(min);
  const maxD = new Date(max);

  const daysSpan = Math.floor((maxD - minD) / (1000 * 60 * 60 * 24)) + 1;
  const rest = Math.max(0, daysSpan - uniqueDays.size);

  return rest;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (isMock()) {
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    try {
      const payload = apiGetUserInfo(token);
      const profile = payload?.profile || {};
      const statistics = payload?.statistics || {};

      return NextResponse.json({
        user: {
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          age: profile.age ?? null,
          weight: profile.weight ?? null,
          height: profile.height ?? null,
          gender: normalizeGenderFromProfile(profile),
          profilePicture: filenameFromUrl(profile.profilePicture) || "sophie.jpg",
          createdAt: profile.createdAt || "",
          statistics: {
            totalDistance: statistics.totalDistance ?? "—",
            sessions: statistics.totalSessions ?? statistics.sessions ?? "—",
            totalDuration: statistics.totalDuration ?? "—",
            totalTime: statistics.totalTime ?? "—",
            calories: statistics.calories ?? "—",
            restDays: statistics.restDays ?? "—",
          },
        },
      });
    } catch {
      return NextResponse.json({ user: null }, { status: 401 });
    }
  }

  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const infoRes = await fetch(`${apiBase}/api/user-info`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!infoRes.ok) return NextResponse.json({ user: null }, { status: 401 });

  const payload = await infoRes.json();
  const profile = payload?.profile || {};
  const backendStats = payload?.statistics || {};

  const startWeek = "1970-01-01";
  const endWeek = toISO(new Date());

  const actRes = await fetch(
    `${apiBase}/api/user-activity?startWeek=${encodeURIComponent(startWeek)}&endWeek=${encodeURIComponent(endWeek)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  const activityJson = actRes.ok ? await actRes.json() : [];
  const sessionsArr = Array.isArray(activityJson) ? activityJson : [];

  const totalCalories = sessionsArr.reduce(
    (sum, s) => sum + (Number(s.caloriesBurned ?? s.calories) || 0),
    0
  );

  const restDays = calcRestDaysFromAllSessions(sessionsArr);

  return NextResponse.json({
    user: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      age: profile.age ?? null,
      weight: profile.weight ?? null,
      height: profile.height ?? null,
      gender: normalizeGenderFromProfile(profile),
      profilePicture: filenameFromUrl(profile.profilePicture) || "sophie.jpg",
      createdAt: profile.createdAt || "",
      statistics: {
        totalDistance: backendStats.totalDistance ?? "—",
        sessions: backendStats.totalSessions ?? backendStats.sessions ?? "—",
        totalDuration: backendStats.totalDuration ?? "—",
        totalTime: minutesToHHMM(backendStats.totalDuration ?? 0),
        calories: totalCalories || "—",
        restDays,
      },
    },
  });
}