'use client';

import { Navbar } from './navbar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white bg-grid-pattern text-brand-dark">
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
