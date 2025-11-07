export const dynamic = 'force-dynamic'; // Force la route à être dynamique

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url'); // Récupère l'URL externe depuis les paramètres de requête

    if (!url) {
        return NextResponse.json({ error: 'URL est requise' }, { status: 400 });
    }

    try {
        // Faites la requête à l'URL externe
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Échec de la récupération des données : ${response.statusText}`);
        }

        // Retournez les données JSON
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur du proxy :', error);
        return NextResponse.json({ error: 'Échec de la récupération des données' }, { status: 500 });
    }
}