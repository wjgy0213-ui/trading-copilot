'use client';

import { useEffect, useRef } from 'react';

interface PriceChartProps {
  symbol?: string;
}

export default function PriceChart({ symbol = 'BINANCE:BTCUSDT' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          container_id: containerRef.current.id,
          symbol: symbol,
          interval: '15',
          timezone: 'America/Vancouver',
          theme: 'dark',
          style: '1',
          locale: 'zh_CN',
          toolbar_bg: '#0a0a1a',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          backgroundColor: '#0a0a1a',
          gridColor: 'rgba(255,255,255,0.03)',
          width: '100%',
          height: '100%',
          allow_symbol_change: true,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, [symbol]);

  return (
    <div
      id="tradingview_chart"
      ref={containerRef}
      className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-800"
    />
  );
}
