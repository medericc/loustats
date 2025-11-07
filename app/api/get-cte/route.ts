// app/api/get-cte/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app', 'api', 'proxy', 'cte.txt');
    const content = (await fs.readFile(filePath, 'utf-8')).trim();
    return new NextResponse(content, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'cte.txt introuvable' }, { status: 500 });
  }
}
