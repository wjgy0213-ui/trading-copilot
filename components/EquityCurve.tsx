'use client';

import { useEffect, useRef } from 'react';
import { Trade } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { formatLocaleCurrency, formatLocaleNumber } from '@/lib/i18n-helpers';

interface EquityCurveProps {
  trades: Trade[];
  initialBalance: number;
}

export default function EquityCurve({ trades, initialBalance }: EquityCurveProps) {
  const { t, locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tEquityTitle = t('equity.title');
  const tInitial = t('equity.initial');
  const tMaxDrawdown = t('equity.max_drawdown');
  const tTradeNth = (n: number) => t('equity.trade_nth').replace('{n}', String(n));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trades.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Build equity points
    const sorted = [...trades]
      .filter(t => t.closedAt && t.pnl !== undefined)
      .sort((a, b) => (a.closedAt || 0) - (b.closedAt || 0));

    if (sorted.length === 0) return;

    const points: { x: number; y: number; equity: number; trade: Trade }[] = [];
    let equity = initialBalance;

    // Starting point
    points.push({ x: 0, y: equity, equity, trade: sorted[0] });

    sorted.forEach((t, i) => {
      equity += t.pnl || 0;
      points.push({ x: i + 1, y: equity, equity, trade: t });
    });

    // Calculate bounds
    const minEquity = Math.min(...points.map(p => p.y));
    const maxEquity = Math.max(...points.map(p => p.y));
    const range = maxEquity - minEquity || 1;
    const padding = { top: 30, right: 20, bottom: 40, left: 65 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    const scaleX = (i: number) => padding.left + (i / (points.length - 1 || 1)) * chartW;
    const scaleY = (v: number) => padding.top + chartH - ((v - minEquity) / range) * chartH;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 12);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      // Y labels
      const val = maxEquity - (range / gridLines) * i;
      ctx.fillStyle = '#666';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(
        formatLocaleCurrency(val, locale, 'USD', { maximumFractionDigits: 0 }),
        padding.left - 8,
        y + 4,
      );
    }

    // Initial balance line
    const baseY = scaleY(initialBalance);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, baseY);
    ctx.lineTo(W - padding.right, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = '#888';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${tInitial} ${formatLocaleCurrency(initialBalance, locale, 'USD', { maximumFractionDigits: 0 })}`,
      padding.left + 4,
      baseY - 6,
    );

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
    const lastEquity = points[points.length - 1].equity;
    if (lastEquity >= initialBalance) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.01)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
    }

    ctx.beginPath();
    ctx.moveTo(scaleX(0), scaleY(points[0].y));
    points.forEach((p, i) => ctx.lineTo(scaleX(i), scaleY(p.y)));
    ctx.lineTo(scaleX(points.length - 1), H - padding.bottom);
    ctx.lineTo(scaleX(0), H - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.moveTo(scaleX(0), scaleY(points[0].y));
    points.forEach((p, i) => ctx.lineTo(scaleX(i), scaleY(p.y)));
    ctx.strokeStyle = lastEquity >= initialBalance ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots for each trade
    points.forEach((p, i) => {
      if (i === 0) return; // skip initial
      const isWin = (p.trade.pnl || 0) > 0;
      ctx.beginPath();
      ctx.arc(scaleX(i), scaleY(p.y), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isWin ? '#22c55e' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Max drawdown highlight
    let peak = initialBalance;
    let maxDd = 0;
    let ddStart = 0;
    let ddEnd = 0;
    points.forEach((p, i) => {
      if (p.y > peak) peak = p.y;
      const dd = (peak - p.y) / peak;
      if (dd > maxDd) {
        maxDd = dd;
        ddEnd = i;
      }
    });

    if (maxDd > 0.05) {
      // Only show if >5%
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      // find peak index before ddEnd
      let peakIdx = 0;
      let peakVal = 0;
      for (let i = 0; i <= ddEnd; i++) {
        if (points[i].y > peakVal) {
          peakVal = points[i].y;
          peakIdx = i;
        }
      }
      ctx.fillRect(
        scaleX(peakIdx),
        padding.top,
        scaleX(ddEnd) - scaleX(peakIdx),
        chartH
      );

      // DD label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${tMaxDrawdown} ${formatLocaleNumber(maxDd * 100, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
        (scaleX(peakIdx) + scaleX(ddEnd)) / 2,
        padding.top + 14
      );
    }

    // Title
    ctx.fillStyle = '#eee';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(tEquityTitle, padding.left, padding.top - 10);

    // Current equity label
    ctx.textAlign = 'right';
    ctx.fillStyle = lastEquity >= initialBalance ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 14px system-ui';
    const pnlPct = formatLocaleNumber((lastEquity - initialBalance) / initialBalance * 100, locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    ctx.fillText(
      `${formatLocaleCurrency(lastEquity, locale, 'USD', { maximumFractionDigits: 0 })} (${lastEquity >= initialBalance ? '+' : ''}${pnlPct}%)`,
      W - padding.right,
      padding.top - 10
    );

    // X axis: trade count
    ctx.fillStyle = '#666';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(tTradeNth(1), scaleX(1), H - padding.bottom + 16);
    if (points.length > 2) {
      ctx.fillText(tTradeNth(points.length - 1), scaleX(points.length - 1), H - padding.bottom + 16);
    }
    if (points.length > 5) {
      const mid = Math.floor(points.length / 2);
      ctx.fillText(tTradeNth(mid), scaleX(mid), H - padding.bottom + 16);
    }

  }, [trades, initialBalance, locale, tEquityTitle, tInitial, tMaxDrawdown]);

  if (trades.filter(t => t.closedAt).length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center text-gray-500">
        <p>{t('equity.empty')}</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: '240px' }}
    />
  );
}
