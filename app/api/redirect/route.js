import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json(
      { error: "Paramètre url manquant" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    return NextResponse.json({
      originalUrl: target,
      finalUrl: response.url,
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Impossible de récupérer l'URL finale",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
