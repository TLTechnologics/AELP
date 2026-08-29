'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LiquidLoader } from '@/components/ui/liquid-loader';

export function GlobalRouteLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state when route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // 1. Intercept Link clicks
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      
      // Ignore external links, anchors, mailto, etc.
      if (!href.startsWith('/') && !href.startsWith(window.location.origin)) return;
      if (target.target === '_blank') return;
      
      const url = new URL(href, window.location.origin);
      
      // If it's the exact same path + query, ignore (it's not a real navigation)
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      
      if (url.origin === window.location.origin) {
        setIsNavigating(true);
      }
    };

    // 2. Intercept programmatic router.push via RSC fetch calls
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = args[0] instanceof Request ? args[0].url : typeof args[0] === 'string' ? args[0] : '';
      const headers = args[1]?.headers || (args[0] instanceof Request ? args[0].headers : null);
      
      let isRsc = url.includes('?_rsc=');
      let isPrefetch = false;
      
      if (headers) {
        const checkHeader = (key: string) => {
          if (headers instanceof Headers) return headers.has(key);
          if (typeof headers === 'object' && !Array.isArray(headers)) {
            return !!(headers as any)[key] || !!(headers as any)[key.toLowerCase()];
          }
          if (Array.isArray(headers)) {
            return headers.some(([k]) => k.toLowerCase() === key.toLowerCase());
          }
          return false;
        };
        if (checkHeader('RSC')) isRsc = true;
        if (checkHeader('Next-Router-Prefetch')) isPrefetch = true;
      }

      // If Next.js is fetching a new RSC payload and it's not just a prefetch,
      // it means a programmatic navigation (or non-prefetched Link) is occurring.
      if (isRsc && !isPrefetch) {
        setIsNavigating(true);
      }
      
      try {
        return await originalFetch.apply(this, args);
      } catch (error) {
        setIsNavigating(false);
        throw error;
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.fetch = originalFetch;
    };
  }, []);

  if (!isNavigating) return null;

  return <LiquidLoader isLooping={true} />;
}
