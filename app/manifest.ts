import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '交易陪练 AI',
    short_name: '交易陪练',
    description: 'AI驱动的交易策略回测与模拟平台',
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
