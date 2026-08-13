'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { Lock, LayoutDashboard, BookOpen, Sparkles, TrendingUp, Award, User, UserPlus, Mic, PenTool, Download } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assessment', href: '/assessment', icon: BookOpen },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Results', href: '/results', icon: Award },
];

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { name: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
  { name: 'Students', href: '/teacher/students', icon: User },
  { name: 'Add Student', href: '/teacher/add-student', icon: UserPlus },
  { name: 'Class Analytics', href: '/teacher/class-analytics', icon: TrendingUp },
  { name: 'Speaking Eval', href: '/teacher/speaking', icon: Mic },
  { name: 'Writing Eval', href: '/teacher/writing', icon: PenTool },
  { name: 'Results', href: '/teacher/results', icon: Download },
];

const studentMobileNavItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Test', href: '/assessment', icon: BookOpen },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Results', href: '/results', icon: Award },
  { name: 'Profile', href: '/profile', icon: User },
];

const teacherMobileNavItems = [
  { name: 'Home', href: '/teacher', icon: LayoutDashboard },
  { name: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
  { name: 'Students', href: '/teacher/students', icon: User },
  { name: 'Add', href: '/teacher/add-student', icon: UserPlus },
  { name: 'Analytics', href: '/teacher/class-analytics', icon: TrendingUp },
  { name: 'Speaking', href: '/teacher/speaking', icon: Mic },
  { name: 'Writing', href: '/teacher/writing', icon: PenTool },
  { name: 'Results', href: '/teacher/results', icon: Download },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboard();

  const isTeacher = pathname.startsWith('/teacher');
  const items = isTeacher ? teacherNavItems : navItems;
  const mobileItems = isTeacher ? teacherMobileNavItems : studentMobileNavItems;
  // Teachers don't have a student stage — default to 4 (fully unlocked) so no nav items are locked
  const stage = isTeacher ? 4 : (data?.profile_stage || 1);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-xs">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href={isTeacher ? "/teacher" : "/"} className="flex items-center gap-1.5 group">
            <div className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-tighter text-brand-dark group-hover:text-brand-dark/80 transition-colors">
              AELP<span className="text-brand-yellow text-xl sm:text-2xl">.</span>
            </div>
          </Link>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-5 overflow-x-auto">
          {items.map((item) => {
            const isActive = item.href === '/teacher'
              ? pathname === '/teacher'
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const isLocked = !isTeacher && stage === 1 && ['Skills', 'Progress', 'Results'].includes(item.name);
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`relative text-xs font-bold tracking-wide transition-colors uppercase flex items-center gap-1.5 shrink-0 ${
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
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link 
            href="/profile" 
            className="hidden sm:block text-xs font-bold tracking-wide text-brand-dark hover:text-muted-foreground transition-colors uppercase"
          >
            PROFILE
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
            className="bg-brand-dark text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-sm"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Scrollable for All Tabs) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-border/80 z-40 flex items-center justify-start sm:justify-around px-2 gap-1 overflow-x-auto shadow-lg no-scrollbar">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/teacher' && pathname.startsWith(item.href));
          const isLocked = !isTeacher && stage === 1 && ['Skills', 'Progress', 'Results'].includes(item.name);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all shrink-0 relative ${
                isActive ? 'text-brand-dark scale-105 font-bold' : 'text-muted-foreground hover:text-brand-dark'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-dark fill-brand-yellow/30' : ''}`} />
                {isLocked && (
                  <Lock className="w-2.5 h-2.5 text-muted-foreground absolute -top-1 -right-1" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-bold tracking-tight whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

