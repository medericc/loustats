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

const PERIODS = ['1', '2', '3', '4'];

export async function GET() {
  try {
    let combined = '';

    for (const period of PERIODS) {
      const filePath = path.join(process.cwd(), 'app', 'api', 'proxy', `cte_q${period}.txt`);
      try {
        const encoded = (await fs.readFile(filePath, 'utf-8')).trim();
        const decoded = decodeStatBroadcast(encoded);
        combined += decoded + '\n\n'; // on concatène les 4 HTML
      } catch {
        console.warn(`Quart ${period} introuvable`);
      }
    }

    if (!combined.trim()) throw new Error('Aucune période trouvée');

    return new NextResponse(combined, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    console.error('💥 /api/stats error:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}