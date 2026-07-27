'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      window.location.href = role === 'teacher' ? '/teacher' : '/';
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-yellow rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      
      <div className="text-center mb-6 relative z-10">
        <h2 className="font-heading text-4xl mb-2">Welcome Back</h2>
        <p className="text-muted-foreground font-medium">Continue your learning journey</p>
      </div>

      {/* Role Switcher */}
      <div className="flex bg-muted p-1 rounded-2xl mb-6 relative z-10">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${role === 'student' ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'}`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'}`}
        >
          Teacher
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="space-y-1">
          <label className="text-sm font-bold text-brand-dark px-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input 
              type="email" 
              placeholder="alex@example.com"
              className="w-full bg-muted border border-border/50 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-brand-dark px-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-muted border border-border/50 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="#" className="text-sm font-bold text-brand-info hover:underline">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-brand-dark text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 group shadow-lg shadow-brand-dark/10"
        >
          {isLoading ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>


    </motion.div>
  );
}
