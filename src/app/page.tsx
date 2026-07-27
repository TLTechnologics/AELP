'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { 
  Play, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  ArrowRight,
  PenTool
} from 'lucide-react';

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

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useDashboard();

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12 pb-24"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-xl text-muted-foreground font-medium mb-2">Welcome back, {user?.user_metadata?.full_name || data?.user_name || 'Student'}! 👋</h2>
            <h1 className="text-5xl md:text-7xl font-heading uppercase">
              Time to <span className="highlight-yellow inline-block px-2">Level Up</span>
            </h1>
          </div>
          
          <button 
            onClick={() => router.push('/lesson')}
            className="bg-brand-dark text-white rounded-full px-6 py-3 flex items-center gap-3 hover:bg-brand-dark/90 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-dark/10 font-medium"
          >
            <Play className="w-5 h-5 fill-white" />
            Continue Learning
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Overall Score', value: data?.overall_score_label || '-', sub: data?.overall_score_sub || '-', icon: Target, color: 'text-brand-info', bg: 'bg-blue-100' },
            { label: 'Weekly Goal', value: data?.weekly_goal_value || '-', sub: data?.weekly_goal_sub || '-', icon: TrendingUp, color: 'text-brand-success', bg: 'bg-green-100' },
            { label: 'Time Spent', value: data?.time_spent_value || '-', sub: data?.time_spent_sub || '-', icon: Clock, color: 'text-brand-warning', bg: 'bg-yellow-100' },
            { label: 'Words Learned', value: data?.words_learned_value || '-', sub: data?.words_learned_sub || '-', icon: BookOpen, color: 'text-brand-danger', bg: 'bg-red-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-transparent to-brand-muted rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="font-heading text-4xl mb-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground font-medium">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Learning Path & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personalized Path */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-3xl">Your Path</h3>
              <button className="text-sm font-bold text-brand-dark flex items-center gap-1 hover:gap-2 transition-all">
                View Journey <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {data?.lessons?.map((lesson: any, i: number) => {
                let Icon = BookOpen;
                let color = 'bg-blue-100 text-blue-700';
                if (lesson.type === 'Writing') {
                  Icon = PenTool;
                  color = 'bg-orange-100 text-orange-700';
                }

                return (
                  <div key={i} className={`bg-white rounded-[24px] p-5 border flex items-center justify-between transition-all ${lesson.status === 'Next' ? 'border-brand-yellow shadow-lg shadow-brand-yellow/10' : 'border-border/40 opacity-70 grayscale'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{lesson.type}</span>
                          <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{lesson.time}</span>
                        </div>
                        <h4 className="text-lg font-bold">{lesson.title}</h4>
                      </div>
                    </div>
                    
                    {lesson.status === 'Next' ? (
                      <button 
                        onClick={() => router.push('/lesson')}
                        className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                      >
                        <Play className="w-5 h-5 fill-brand-dark text-brand-dark ml-1" />
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-full bg-muted text-sm font-bold text-muted-foreground">
                        {lesson.status}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Skill Radar Placeholder */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="font-heading text-3xl">Skill Radar</h3>
            <div className="bg-white rounded-[32px] p-8 border border-border/40 h-[400px] flex flex-col items-center justify-center relative shadow-sm">
              <div className="absolute inset-0 bg-grid-pattern opacity-50 rounded-[32px]" />
              
              {/* Dummy Radar Chart visualization */}
              <div className="relative w-48 h-48 z-10 flex items-center justify-center">
                {/* Hexagon grid lines */}
                <div className="absolute inset-0 border-2 border-muted rounded-full"></div>
                <div className="absolute inset-4 border-2 border-muted rounded-full opacity-50"></div>
                <div className="absolute inset-8 border-2 border-muted rounded-full opacity-25"></div>
                
                {/* Cross lines */}
                <div className="absolute w-full h-[2px] bg-muted rotate-0"></div>
                <div className="absolute w-full h-[2px] bg-muted rotate-45"></div>
                <div className="absolute w-full h-[2px] bg-muted rotate-90"></div>
                <div className="absolute w-full h-[2px] bg-muted -rotate-45"></div>

                {/* Data Polygon */}
                <svg className="absolute inset-0 w-full h-full text-brand-yellow opacity-80" viewBox="0 0 100 100">
                  <polygon points="50,10 85,30 75,80 25,85 15,40" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>

                {/* Labels */}
                <span className="absolute -top-6 text-xs font-bold">Reading</span>
                <span className="absolute -right-10 text-xs font-bold">Writing</span>
              </div>

              <div className="mt-8 text-center z-10">
                <p className="text-sm text-muted-foreground">Strongest Skill</p>
                <p className="font-bold text-xl">Reading ({data?.reading_score || 0}%)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
