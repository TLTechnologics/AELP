'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { teacherService } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function AddStudentPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    semester: 'Semester 1'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) return;
    
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      await teacherService.addStudent({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        semester: formData.semester
      });
      setStatus('success');
      setFormData({ fullName: '', email: '', password: '', semester: 'Semester 1' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.detail || 'Failed to create student account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-8 pb-24"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-xl text-muted-foreground font-medium mb-2">Student Management</h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase">
            Add New <span className="highlight-yellow inline-block px-2">Student</span>
          </h1>
          <p className="text-muted-foreground mt-4 font-medium">
            Register a new student to the platform. They will use the email and password you set here to access their personalized dashboard.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[32px] border border-border/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <AnimatePresence>
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Student account created successfully! They can now log in.
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 font-medium"
                >
                  <AlertCircle className="w-5 h-5" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-brand-dark px-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-muted border border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium text-brand-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-brand-dark px-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="student@silveroak.com"
                  className="w-full bg-muted border border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium text-brand-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-brand-dark px-1 uppercase tracking-wider">Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-muted border border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 transition-all font-medium text-brand-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-brand-dark px-1 uppercase tracking-wider">Semester</label>
              <div className="relative">
                <select 
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange as any}
                  className="w-full bg-muted border border-border/50 focus:border-brand-yellow focus:ring-brand-yellow/20 rounded-2xl py-3 px-4 outline-none focus:ring-2 transition-all font-bold text-brand-dark cursor-pointer appearance-none"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-dark text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-xl disabled:opacity-70 disabled:hover:scale-100 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Register Student
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
