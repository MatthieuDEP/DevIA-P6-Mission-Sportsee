import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/authConstants";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiBase}/api/training-plan/download-ics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      return NextResponse.json(
        {
          message:
            typeof data === "string"
              ? data
              : data?.message || "Impossible de générer le fichier ICS.",
        },
        { status: response.status }
      );
    }

    const content = await response.text();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] || "sportsee-training-plan.ics";

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Le service de téléchargement ICS est indisponible." },
      { status: 500 }
    );
  }
}