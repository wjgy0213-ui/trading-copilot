'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const page = pathname || '/';
    const pathGroup = page === '/'
      ? 'landing'
      : page.startsWith('/pricing')
        ? 'pricing'
        : page.startsWith('/waitlist')
          ? 'waitlist'
          : page.startsWith('/practice') || page.startsWith('/trade')
            ? 'practice'
            : page.startsWith('/strategy')
              ? 'strategy'
              : 'other';

    analytics.pageView(page, { path_group: pathGroup, query: searchParams?.toString() || '' });
  }, [pathname, searchParams]);

  return null;
}
