'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { LiquidLoader } from '@/components/ui/liquid-loader';
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
  Mic,
  AlertCircle,
  Lock,
  CheckCircle2,
  Trophy,
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
  const { data, isLoading, isError } = useDashboard();

  if (authLoading || isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-xl font-heading text-gray-800">Cannot connect to the server</p>
        <p className="text-sm text-gray-500">Please make sure NEXT_PUBLIC_API_URL is correct and the backend is running.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg">Retry</button>
      </div>
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
            <h2 className="text-xl text-muted-foreground font-medium mb-2">Welcome back, {user?.user_metadata?.full_name || data?.student_name || 'Student'}! 👋</h2>
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
        
        {/* Progressive Unlocking Banner */}
        <motion.div variants={itemVariants} className="bg-brand-dark text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center shrink-0">
              {data?.profile_stage === 4 ? <Trophy className="w-6 h-6 text-brand-dark" /> : <Lock className="w-6 h-6 text-brand-dark" />}
            </div>
            <div>
              <h3 className="font-heading text-2xl mb-1">
                {data?.profile_stage === 1 && "Start Your Journey"}
                {data?.profile_stage === 2 && "Personalized Journey Started"}
                {data?.profile_stage === 3 && "Advanced Profile Upgraded"}
                {data?.profile_stage === 4 && "Congratulations!"}
              </h3>
              <p className="text-white/80 text-sm font-medium">
                {data?.profile_stage === 1 && "Complete your first assessment to begin your personalized English learning journey."}
                {data?.profile_stage === 2 && "Complete both Reading and Writing assessments to receive a more accurate learning plan."}
                {data?.profile_stage === 3 && "Your personalized learning plan has been upgraded based on multiple assessments. Complete Speaking next!"}
                {data?.profile_stage === 4 && "Your complete English profile is now available."}
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end shrink-0">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-yellow mb-1">Profile Completion</span>
            <span className="text-3xl font-heading">{data?.profile_completeness || 0}%</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, sub: `Level: ${data?.latest_cefr_level || 'A1'}`, icon: Target, color: 'text-brand-info', bg: 'bg-blue-100' },
            { label: 'Avg Score', value: `${data?.average_score || 0}%`, sub: 'Across assessments', icon: TrendingUp, color: 'text-brand-success', bg: 'bg-green-100' },
            { label: 'Assessments', value: data?.completed_assessments || 0, sub: 'Completed', icon: Clock, color: 'text-brand-warning', bg: 'bg-yellow-100' },
            { label: 'Recent Activity', value: data?.recent_activity?.length || 0, sub: 'Last 7 days', icon: BookOpen, color: 'text-brand-danger', bg: 'bg-red-100' },
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
        {data?.profile_stage === 1 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] border border-border/40 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-4xl mb-3">Feature Locked</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Your personalized Learning Path and Weak Skills analysis will appear here after you complete your first assessment.
            </p>
            <button 
              onClick={() => router.push('/assessment')}
              className="bg-brand-dark text-white rounded-full px-8 py-4 font-bold text-lg hover:-translate-y-1 transition-transform shadow-xl inline-flex items-center gap-2"
            >
              Start First Assessment <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
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
                {data?.recommended_lessons?.length > 0 ? (
                  data.recommended_lessons.map((lesson: any, i: number) => {
                    let Icon = BookOpen;
                    let color = 'bg-blue-100 text-blue-700';
                    if (lesson.title?.toLowerCase().includes('writ')) {
                      Icon = PenTool;
                      color = 'bg-orange-100 text-orange-700';
                    } else if (lesson.title?.toLowerCase().includes('speak')) {
                      Icon = Mic;
                      color = 'bg-purple-100 text-purple-700';
                    }

                    return (
                      <div key={i} className={`bg-white rounded-[24px] p-5 border flex items-center justify-between transition-all border-brand-yellow shadow-lg shadow-brand-yellow/10`}>
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{lesson.difficulty || 'All Levels'}</span>
                              {lesson.priority === 'HIGH' && (
                                <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-md">High Priority</span>
                              )}
                            </div>
                            <h4 className="text-lg font-bold mb-2">{lesson.title}</h4>
                            {lesson.reason && (
                              <div className="text-xs text-muted-foreground flex gap-1 items-start max-w-sm">
                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{lesson.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => router.push('/lesson')}
                          className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        >
                          <Play className="w-5 h-5 fill-brand-dark text-brand-dark ml-1" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground bg-white border border-border/40 rounded-[24px]">
                    You have completed all recommended lessons! Keep up the great work.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Weak Skills */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-3xl">Weak Skills</h3>
              </div>
              <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-4 h-[400px] overflow-y-auto">
                {data?.weak_skills?.length > 0 ? (
                  data.weak_skills.map((skill: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-dark">{skill.skill}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${skill.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {skill.priority}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Latest Score</span>
                        <span className="font-medium text-brand-dark">{Math.round(skill.score)}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${skill.priority === 'HIGH' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(Math.max(skill.score, 5), 100)}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Target className="w-12 h-12 mb-4 opacity-20" />
                    <p>Complete more assessments to analyze your weak skills.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
