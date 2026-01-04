import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId") || "401825004";
  const playerName = (searchParams.get("player") || "Louann Battiston").toLowerCase();

  const url = `https://site.web.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/summary?event=${gameId}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Erreur ESPN ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const plays =
      json?.plays ??
      json?.drives?.flatMap((d: any) => d.plays) ??
      [];

    if (!Array.isArray(plays) || !plays.length) {
      throw new Error("Aucune donnée 'plays' trouvée dans le flux ESPN");
    }

    // 🎯 Actions impliquant le joueur
    const filteredPlays = plays.filter((p: any) => {
      const text = (p?.text || "").toLowerCase();
      const playerNames = (p?.participants || [])
        .map((pa: any) => pa?.athlete?.displayName?.toLowerCase?.())
        .filter(Boolean);

      return (
        text.includes(playerName) ||
        playerNames.some((n: string) => n.includes(playerName))
      );
    });

    if (!filteredPlays.length) {
      return NextResponse.json([]);
    }

    // 🏀 Conversion : [period, chrono, action, réussite]
    const data: string[][] = filteredPlays.map((p: any) => {
      const period = p?.period?.number?.toString?.() || "1";
      const chrono = p?.clock?.displayValue || "0:00";
      const text = (p?.text || "").toLowerCase();

      let action = "other";
      let success = "0";

      const madeKeywords = ["made", "make", "makes", "good"];
      const missedKeywords = ["missed", "miss", "misses"];

     const isAssist =
  text.includes(`${playerName} assists`) ||
  text.includes(`assisted by ${playerName}`);

const isShooter = text.includes(playerName) && !isAssist;

if (isAssist) {
  action = "assist";
  success = "1";
} else if (isShooter) {
  if (text.includes("three point")) action = "3pt";
  else if (
    text.includes("jump shot") ||
    text.includes("layup") ||
    text.includes("jumper") ||
        text.includes("jumpshot") ||
    text.includes("hook")
  ) action = "2pt";
  else if (text.includes("free throw")) action = "1pt";
  else if (text.includes("rebound")) action = "rebound";
  else if (text.includes("turnover")) action = "turnover";
  else if (text.includes("foul")) action = "foul";
  else if (text.includes("block")) action = "block";
  else if (text.includes("steal")) action = "steal";

  if (madeKeywords.some(k => text.includes(k))) {
    success = "1";
  } else if (missedKeywords.some(k => text.includes(k))) {
    success = "0";
  }
}


      return [period, chrono, action, success];
    });

    const clean = data.filter(r => r[2] !== "other");

    console.log(`✅ ESPN (${gameId}): ${clean.length} actions pour ${playerName}`);
    return NextResponse.json(clean);

  } catch (error: any) {
    console.error("Erreur ESPN:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne ESPN" },
      { status: 500 }
    );
  }
}
