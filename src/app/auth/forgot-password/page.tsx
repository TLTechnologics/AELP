'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';

const resetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden text-center"
      >
        <h2 className="font-heading text-3xl mb-4 text-brand-dark">Check your email!</h2>
        <p className="text-muted-foreground font-medium mb-6">We've sent you a link to reset your password.</p>
        <Link href="/auth/login" className="text-brand-info font-bold hover:underline">
          Return to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
    >
      <div className="text-center mb-8 relative z-10">
        <h2 className="font-heading text-4xl mb-2">Reset Password</h2>
        <p className="text-muted-foreground font-medium">Enter your email to receive a reset link</p>
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
              Send Reset Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="flex justify-center pt-2">
          <Link href="/auth/login" className="text-sm font-bold text-brand-info hover:underline">Back to login</Link>
        </div>
      </form>
    </motion.div>
  );
}
