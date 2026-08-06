'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();
          
        if (userData && userData.role === 'teacher') {
          router.push('/teacher');
        } else {
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
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-yellow rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      
      <div className="text-center mb-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-bold text-brand-dark px-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input 
              type="email" 
              {...register('email')}
              placeholder="alex@example.com"
              className={`w-full bg-muted border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20'} rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs px-1 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-brand-dark px-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input 
              type="password" 
              {...register('password')}
              placeholder="••••••••"
              className={`w-full bg-muted border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20'} rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium`}
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs px-1 font-medium">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-bold text-brand-info hover:underline">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-brand-dark text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 group shadow-lg shadow-brand-dark/10 disabled:opacity-70 disabled:active:scale-100"
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
