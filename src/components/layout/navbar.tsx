'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { Lock, Menu, X, LayoutDashboard, BookOpen, Sparkles, TrendingUp, Award, User } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assessment', href: '/assessment', icon: BookOpen },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Results', href: '/results', icon: Award },
  { name: 'Leaderboard', href: '/leaderboard', icon: Award },
];

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { name: 'Students', href: '/teacher/students', icon: User },
  { name: 'Add Student', href: '/teacher/add-student', icon: User },
  { name: 'Class Analytics', href: '/teacher/class-analytics', icon: TrendingUp },
  { name: 'Speaking Eval', href: '/teacher/speaking', icon: BookOpen },
  { name: 'Writing Eval', href: '/teacher/writing', icon: BookOpen },
  { name: 'Reports', href: '/teacher/reports', icon: Award },
  { name: 'Analytics', href: '/teacher/analytics', icon: TrendingUp },
];

const mobileBottomNavItems = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Test', href: '/assessment', icon: BookOpen },
  { name: 'Skills', href: '/skills', icon: Sparkles },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboard();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isTeacher = pathname.startsWith('/teacher');
  const items = isTeacher ? teacherNavItems : navItems;
  const stage = data?.profile_stage || 1;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-3 sm:px-6 md:px-8 shadow-xs">
        {/* Left Side: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            aria-label="Open menu"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-brand-dark" />
          </button>
          
          <Link href={isTeacher ? "/teacher" : "/"} className="flex items-center gap-1.5 group">
            <div className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-tighter text-brand-dark group-hover:text-brand-dark/80 transition-colors">
              AELP<span className="text-brand-yellow text-xl sm:text-2xl">.</span>
            </div>
          </Link>
        </div>

        {/* Center Links (Desktop) */}
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
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/profile" 
            className="hidden sm:block text-xs font-bold tracking-wide text-brand-dark hover:text-muted-foreground transition-colors uppercase"
          >
            PROFILE
          </Link>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-brand-dark text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-sm"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 w-72 sm:w-80 h-full bg-white z-[70] shadow-2xl flex flex-col p-6 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                <div className="font-heading text-3xl tracking-tighter text-brand-dark">
                  AELP<span className="text-brand-yellow text-xl">.</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-brand-dark" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const isActive = item.href === '/teacher'
                    ? pathname === '/teacher'
                    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const isLocked = !isTeacher && stage === 1 && ['Skills', 'Progress', 'Results'].includes(item.name);
                  const Icon = item.icon;
                  
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative text-sm font-bold tracking-wide transition-all uppercase flex items-center justify-between p-3 rounded-2xl ${
                        isActive ? 'text-brand-dark bg-brand-yellow/20 font-extrabold' : 'text-muted-foreground hover:text-brand-dark hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-brand-dark" />
                        <span>{item.name}</span>
                      </div>
                      {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (For Quick Thumb Access) */}
      {!isTeacher && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-border/80 z-40 flex items-center justify-around px-2 shadow-lg">
          {mobileBottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-brand-dark scale-105 font-bold' : 'text-muted-foreground hover:text-brand-dark'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-dark fill-brand-yellow/30' : ''}`} />
                <span className="text-[10px] mt-0.5 font-bold tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

