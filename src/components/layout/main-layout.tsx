'use client';

import { Navbar } from './navbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-muted bg-grid-pattern text-brand-dark">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-24 lg:pb-12 min-h-screen">
        <div className="px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
