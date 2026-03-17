import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trading Copilot AI',
    short_name: 'Trading Copilot',
    description: 'AI-powered trading strategy backtest & simulation platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#10b981',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
