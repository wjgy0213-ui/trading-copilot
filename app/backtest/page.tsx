'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BacktestPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/strategy'); }, [router]);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
      <p>跳转到策略工坊...</p>
    </div>
  );
}
