'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [actions, setActions] = useState<string[]>([]);
  const [rawStats, setRawStats] = useState<string>('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const text = await res.text();
      setRawStats(text);

      // Parser le HTML pour récupérer les actions
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Tous les <tr> des plays
      const rows = Array.from(doc.querySelectorAll('tr.pxprow'));
      const inesActions = rows
        .filter(row => row.textContent?.toLowerCase().includes('ines'))
        .map(row => row.textContent?.trim() || '');

      setActions(inesActions);
    } catch (err) {
      console.error(err);
      setActions([]);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Actions d'Ines Debroise :</h1>
      {actions.length > 0 ? (
        <ul>
          {actions.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      ) : (
        <p>Aucune action trouvée.</p>
      )}

      <h2>Debug — Stats brutes :</h2>
      <pre style={{ maxHeight: '300px', overflow: 'auto' }}>{rawStats}</pre>
    </div>
  );
}
