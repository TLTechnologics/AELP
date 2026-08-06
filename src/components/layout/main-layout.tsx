'use client';

import { Navbar } from './navbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white bg-grid-pattern text-brand-dark">
      <Navbar />
      <main className="pt-16 md:pt-20 pb-20 lg:pb-8 min-h-screen">
        <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
