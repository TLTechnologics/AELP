'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // IMPROVE-010: show/hide password toggle
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      if (authData.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userData && userData.role === 'teacher') {
          localStorage.setItem('userRole', 'teacher');
          router.push('/teacher');
        } else {
          localStorage.setItem('userRole', 'student');
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="w-full max-w-md bg-white rounded-[32px] shadow-2xl relative overflow-hidden"
    >
      {/* IMPROVE-009: Branded dark header band */}
      <div className="bg-brand-dark px-8 pt-8 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-yellow/40 to-transparent" />
        <h1 className="text-3xl font-heading text-white mb-1">Welcome back</h1>
        <p className="text-white/60 text-sm font-medium">Sign in to your AELP account</p>
      </div>

      <div className="px-8 py-8 space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            {/* BUG-011: use brand tokens not gray-* */}
            <label className="text-sm font-bold text-brand-dark px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                {...register('email')}
                placeholder="alex@example.com"
                className={`w-full bg-muted border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20'} rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium text-brand-dark`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs px-1 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password — IMPROVE-010: show/hide toggle */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-brand-dark px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full bg-muted border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20'} rounded-2xl py-3 pl-12 pr-12 outline-none focus:ring-2 transition-all font-medium text-brand-dark`}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-3.5 text-muted-foreground hover:text-brand-dark transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs px-1 font-medium">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-bold text-brand-info hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* BUG-012: use shared Button component for correct shape */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
        </form>

        {/* BUG-013: Contact note for new users */}
        <p className="text-center text-xs text-muted-foreground font-medium pt-2">
          Don&apos;t have an account?{' '}
          <span className="text-brand-dark font-bold">Contact your administrator</span> to get access.
        </p>
      </div>
    </motion.div>
  );
}
