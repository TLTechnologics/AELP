'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Assessment', href: '/assessment' },
  { name: 'Skills', href: '/skills' },
  { name: 'Progress', href: '/progress' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-8">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="font-heading text-4xl tracking-tighter text-brand-dark group-hover:text-brand-dark/80 transition-colors">
          AELP<span className="text-brand-yellow text-2xl">.</span>
        </div>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`relative text-sm font-bold tracking-wide transition-colors ${
                isActive ? 'text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'
              }`}
            >
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-yellow"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side Profile/Action */}
      <div className="flex items-center gap-6">
        <Link 
          href="/profile" 
          className="text-sm font-bold tracking-wide text-brand-dark hover:text-muted-foreground transition-colors"
        >
          PROFILE
        </Link>
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-brand-dark text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-md"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
