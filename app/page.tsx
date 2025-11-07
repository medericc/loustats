'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState<string | object>('');
  const [proxyResp, setProxyResp] = useState<string>('');

  const fetchProxy = async () => {
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: '553533',
          data: 'CTEcqvO4oJkhpmcjnUN9Vzu...' // ton cte.txt ou partie du contenu
        })
      });
      const text = await res.text();
      setProxyResp(text);
    } catch (err) {
      console.error(err);
      setProxyResp('Erreur fetch proxy');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.headers.get('Content-Type')?.includes('application/json')) {
        const json = await res.json();
        setStats(json);
      } else {
        const text = await res.text();
        setStats(text);
      }
    } catch (err) {
      console.error(err);
      setStats('Erreur fetch stats');
    }
  };

  useEffect(() => {
    fetchProxy();
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Proxy Response:</h1>
      <pre>{proxyResp}</pre>
      <h1>Decoded Stats:</h1>
      <pre>{typeof stats === 'string' ? stats : JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
