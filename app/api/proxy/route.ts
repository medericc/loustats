import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { game, data } = await request.json();
    if (!game || !data) {
      return NextResponse.json({ error: 'game ou data manquant' }, { status: 400 });
    }

    const baseUrl = 'https://stats.statbroadcast.com/interface/webservice/statsdata';
    const url = `${baseUrl}?game=${encodeURIComponent(game)}&data=${encodeURIComponent(data)}`;

    const resp = await fetch(url);
    const text = await resp.text();

    return new NextResponse(text, {
      status: resp.status,
      headers: { 'Content-Type': resp.headers.get('Content-Type') || 'text/plain' },
    });
  } catch (err: any) {
    console.error('💥 /api/proxy error:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
