'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PriceChartProps {
  symbol?: string;
}

export default function PriceChart({ symbol = 'BINANCE:BTCUSDT' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          studies: ['MASimple@tv-basicstudies'],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, [symbol]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ESC to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-950 p-2' : ''}`}>
      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all border border-gray-700/50 backdrop-blur-sm group"
        title={isFullscreen ? '退出全屏 (ESC)' : '全屏查看'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
        ) : (
          <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
        )}
      </button>
      
      <div
        id="tradingview_chart"
        ref={containerRef}
        className={`w-full rounded-xl overflow-hidden border border-gray-800 ${
          isFullscreen ? 'h-full' : 'h-[550px]'
        }`}
      />
    </div>
  );
}
