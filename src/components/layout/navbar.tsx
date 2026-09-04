'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Lock, LayoutDashboard, BookOpen, Sparkles, TrendingUp, Award, User, UserPlus, Mic, PenTool, BarChart, FileText, LogOut, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // IMPROVE-028: module-level import
import { BrandLogo } from '@/components/ui/brand-logo';

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
  { name: 'Add Student', href: '/teacher/add-student' },
  { name: 'Assessments', href: '/teacher/assessments' },
  { name: 'Speaking', href: '/teacher/speaking' },
  { name: 'Writing', href: '/teacher/writing' },
  { name: 'Analytics', href: '/teacher/analytics' },
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
  { name: 'Students', href: '/teacher/students', icon: User },
  { name: 'Add', href: '/teacher/add-student', icon: UserPlus },
  { name: 'Speaking', href: '/teacher/speaking', icon: Mic },
  { name: 'Writing', href: '/teacher/writing', icon: PenTool },
  { name: 'Reports', href: '/teacher/reports', icon: FileText },
  { name: 'Analytics', href: '/teacher/analytics', icon: BarChart },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDashboard();
  const { role } = useAuth();

  // BUG-006: scroll shadow state
  const [scrolled, setScrolled] = useState(false);
  // BUG-007: locked toast state
  const [lockedToast, setLockedToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTeacherPath = pathname.startsWith('/teacher');
  const isTeacher = isTeacherPath || role === 'teacher';

  const items = isTeacher ? teacherNavItems : navItems;
  const mobileItems = isTeacher ? teacherMobileNavItems : studentMobileNavItems;
  const stage = isTeacher ? 4 : (data?.profile_stage || 1);

  const handleLockedClick = () => {
    setLockedToast(true);
    setTimeout(() => setLockedToast(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* BUG-007: Locked feature toast */}
      {lockedToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-brand-dark text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
        >
          <Lock className="w-4 h-4 text-brand-yellow" />
          Complete your first assessment to unlock this
        </motion.div>
      )}

      {/* BUG-006: Scroll-aware shadow on navbar */}
      <nav className={`fixed top-0 left-0 w-full h-[72px] md:h-20 bg-white/95 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 transition-all duration-300 ${scrolled ? 'shadow-md border-border' : 'shadow-none border-transparent'}`}>

        {/* Left Side: BrandLogo — IMPROVE-006, BUG-010 */}
        <div className="flex items-center gap-2">
          <BrandLogo href={isTeacher ? '/teacher' : '/'} size="md" />
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
                onClick={isLocked ? (e) => { e.preventDefault(); handleLockedClick(); } : undefined}
                aria-label={isLocked ? `${item.name} — complete your first assessment to unlock` : item.name}
                className={`relative text-[13px] font-bold tracking-wider transition-colors duration-150 uppercase flex items-center gap-1.5 py-2 ${
                  isActive ? 'text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'
                } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {item.name}
                {isLocked && <Lock className="w-3 h-3 text-muted-foreground" aria-hidden="true" />}
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

        {/* Right side — IMPROVE-007: styled logout with icon */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-brand-dark hover:text-muted-foreground transition-colors duration-150 uppercase bg-muted px-4 py-2 rounded-full"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Log out of your account"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-muted-foreground hover:text-red-500 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* Mobile Profile (Top right) */}
        <div className="lg:hidden flex items-center gap-4">
          <Link
            href="/profile"
            aria-label="Go to your profile"
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-brand-dark hover:bg-brand-yellow hover:text-brand-dark transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar — BUG-008, IMPROVE-008 */}
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
              onClick={isLocked ? (e) => { e.preventDefault(); handleLockedClick(); } : undefined}
              aria-label={isLocked ? `${item.name} — locked until first assessment` : item.name}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] ${
                isLocked ? 'opacity-40' : ''
              }`}
            >
              {/* IMPROVE-008: Active background pill */}
              <div className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'bg-brand-yellow/15' : ''
              }`}>
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px] text-brand-dark' : 'stroke-2 text-muted-foreground'}`} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-brand-dark' : 'text-muted-foreground font-medium'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
