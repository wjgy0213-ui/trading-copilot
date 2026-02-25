'use client';

import { useState, useEffect } from 'react';

export interface ITCData {
  itc: Record<string, number>;
  fearGreed: { value: string; value_classification: string };
  prices: { BTC: number; ETH: number };
  timestamp: number;
}

export function useITCData() {
  const [data, setData] = useState<ITCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/itc')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
