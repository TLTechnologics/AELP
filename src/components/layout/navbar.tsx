'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { Lock } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Assessment', href: '/assessment' },
  { name: 'Skills', href: '/skills' },
  { name: 'Progress', href: '/progress' },
  { name: 'Results', href: '/results' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher' },
  { name: 'Students', href: '/teacher/students' },
  { name: 'Add Student', href: '/teacher/add-student' },
  { name: 'Class Analytics', href: '/teacher/class-analytics' },
  { name: 'Speaking Eval', href: '/teacher/speaking' },
  { name: 'Writing Eval', href: '/teacher/writing' },
  { name: 'Reports', href: '/teacher/reports' },
  { name: 'Analytics', href: '/teacher/analytics' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboard();

  const isTeacher = pathname.startsWith('/teacher');
  const items = isTeacher ? teacherNavItems : navItems;
  const stage = data?.profile_stage || 1;

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-8">
      {/* Brand */}
      <Link href={isTeacher ? "/teacher" : "/"} className="flex items-center gap-2 group">
        <div className="font-heading text-4xl tracking-tighter text-brand-dark group-hover:text-brand-dark/80 transition-colors">
          AELP<span className="text-brand-yellow text-2xl">.</span>
        </div>
      </Link>

      {/* Center Links */}
      <div className="hidden lg:flex items-center gap-6">
        {items.map((item) => {
          const isActive = item.href === '/teacher'
            ? pathname === '/teacher'
            : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const isLocked = !isTeacher && stage === 1 && ['Skills', 'Progress', 'Results'].includes(item.name);
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`relative text-xs font-bold tracking-wide transition-colors uppercase flex items-center gap-1.5 ${
                isActive ? 'text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'
              }`}
            >
              {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
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
      <div className="flex items-center gap-4">

        <Link 
          href="/profile" 
          className="text-xs font-bold tracking-wide text-brand-dark hover:text-muted-foreground transition-colors uppercase"
        >
          PROFILE
        </Link>
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-md"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

