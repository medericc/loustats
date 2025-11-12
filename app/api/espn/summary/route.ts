// app/api/espn/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // ⚡️ toujours frais (pas de cache)

// app/api/espn/summary/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId') || '401822211';
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/summary?gameId=${gameId}`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data);
}
