'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PriceChartProps {
  symbol?: string;
}

export default function PriceChart({ symbol = 'BINANCE:BTCUSDT' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartId = useRef(`tv_chart_${Math.random().toString(36).slice(2)}`);

  // Re-create widget when symbol or fullscreen changes
  useEffect(() => {
    // Update ID to force fresh container
    chartId.current = `tv_chart_${Math.random().toString(36).slice(2)}`;
    
    const el = containerRef.current;
    if (!el) return;
    el.id = chartId.current;
    el.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && el) {
        new (window as any).TradingView.widget({
          container_id: el.id,
          symbol,
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
          autosize: true,
          allow_symbol_change: true,
          studies: ['MASimple@tv-basicstudies'],
        });
      }
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [symbol, isFullscreen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800">
          <span className="text-sm text-gray-400 font-mono">{symbol}</span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-red-600/80 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
          >
            <Minimize2 className="w-4 h-4" />
            退出全屏
          </button>
        </div>
        <div className="flex-1 p-1">
          <div
            ref={containerRef}
            className="w-full h-full rounded-lg overflow-hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-3 right-3 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all border border-gray-700/50 backdrop-blur-sm group"
        title="全屏查看"
      >
        <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
      </button>
      <div
        ref={containerRef}
        className="w-full h-[550px] rounded-xl overflow-hidden border border-gray-800"
      />
    </div>
  );
}
