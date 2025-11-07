// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// ROT13 + Base64
function rot13Char(c: string): string {
  if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97);
  if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + 13) % 26) + 65);
  return c;
}

function tatdsy(s: string) {
  return s.split('').map(rot13Char).join('');
}

function atou(b64: string) {
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function decodeStatBroadcast(encoded: string) {
  const cleaned = encoded.replace(/\s+/g, '');
  return atou(tatdsy(cleaned));
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app', 'api', 'proxy', 'cte.txt');
    const encoded = (await fs.readFile(filePath, 'utf-8')).trim();
    if (!encoded) throw new Error('cte.txt est vide');

    const decoded = decodeStatBroadcast(encoded);

    try {
      const json = JSON.parse(decoded);
      return NextResponse.json(json);
    } catch {
      return new NextResponse(decoded, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  } catch (err: any) {
    console.error('💥 /api/stats error:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
