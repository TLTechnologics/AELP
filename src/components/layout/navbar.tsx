'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { Lock, LayoutDashboard, BookOpen, Sparkles, TrendingUp, Award, User, UserPlus, Mic, PenTool, BarChart, ClipboardList, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Assessment', href: '/assessment' },
  { name: 'Learning', href: '/lesson' },
  { name: 'Skills', href: '/skills' },
  { name: 'Progress', href: '/progress' },
  { name: 'Results', href: '/results' },
];

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher' },
  { name: 'Lessons', href: '/teacher/lessons' },
  { name: 'Students', href: '/teacher/students' },
  { name: 'Analytics', href: '/teacher/analytics' },
  { name: 'Assessments', href: '/teacher/assessments' },
];

const studentMobileNavItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Test', href: '/assessment', icon: BookOpen },
  { name: 'Learn', href: '/lesson', icon: Sparkles },
  { name: 'Skills', href: '/skills', icon: TrendingUp },
  { name: 'Progress', href: '/progress', icon: BarChart },
  { name: 'Results', href: '/results', icon: Award },
];

const teacherMobileNavItems = [
  { name: 'Home', href: '/teacher', icon: LayoutDashboard },
  { name: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
  { name: 'Students', href: '/teacher/students', icon: User },
  { name: 'Analytics', href: '/teacher/analytics', icon: BarChart },
  { name: 'Reports', href: '/teacher/reports', icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = pathname.startsWith('/teacher');
  const items = isTeacher ? teacherNavItems : navItems;
  const mobileItems = isTeacher ? teacherMobileNavItems : studentMobileNavItems;
  // Teachers don't have a student stage — default to 4 (fully unlocked)
  const stage = isTeacher ? 4 : (data?.profile_stage || 1);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-[72px] md:h-20 bg-white/95 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 transition-all">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href={isTeacher ? "/teacher" : "/"} className="flex items-center gap-1.5 group">
            <div className="font-heading text-2xl sm:text-3xl tracking-tighter text-brand-dark transition-colors">
              AELP<span className="text-brand-yellow text-xl sm:text-2xl">.</span>
            </div>
          </Link>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          {items.map((item) => {
            const isActive = item.href === '/teacher' || item.href === '/'
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const isLocked = !isTeacher && stage === 1 && ['Skills', 'Progress', 'Results', 'Learning'].includes(item.name);
            
            return (
              <Link 
                key={item.name} 
                href={isLocked ? '#' : item.href}
                className={`relative text-[13px] font-bold tracking-wider transition-colors uppercase flex items-center gap-1.5 py-2 ${
                  isActive ? 'text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'
                } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {item.name}
                {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-yellow rounded-t-sm"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side Profile/Action */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-brand-dark hover:text-muted-foreground transition-colors uppercase bg-muted px-4 py-2 rounded-full"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button 
            onClick={async () => {
              try {
                const { supabase } = await import('@/lib/supabaseClient');
                await supabase.auth.signOut();
              } catch (e) {}
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/auth/login';
            }}
            className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground hover:text-red-500 transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Mobile Profile (Top right) */}
        <div className="lg:hidden flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-brand-dark hover:bg-brand-yellow hover:text-white transition-colors">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </nav>



      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-md border-t border-border z-30 flex items-center justify-around px-2 pb-safe">
        {mobileItems.map((item) => {
          const isActive = item.href === '/' || item.href === '/teacher' 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          const isLocked = !isTeacher && stage === 1 && ['Skills', 'Results', 'Learn', 'Progress'].includes(item.name);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={isLocked ? '#' : item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-brand-dark' : 'text-muted-foreground'
              } ${isLocked ? 'opacity-50' : ''}`}
            >
              <div className="relative">
                <Icon className={`w-[22px] h-[22px] mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-yellow rounded-full" />
                )}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? '' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

