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
        className="space-y-8 sm:space-y-12 pb-24"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
          <div>
            <h2 className="text-base sm:text-xl text-muted-foreground font-medium mb-1 sm:mb-2">Welcome back, {user?.user_metadata?.full_name || data?.student_name || 'Student'}! 👋</h2>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-heading uppercase leading-tight">
              Time to <span className="highlight-yellow inline-block px-2">Level Up</span>
            </h1>
          </div>
          
          {data?.profile_stage === 1 ? (
            <button 
              onClick={() => router.push('/assessment')}
              className="w-full sm:w-auto bg-brand-yellow text-brand-dark rounded-full px-6 py-3.5 flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl font-bold text-sm sm:text-base"
            >
              <Target className="w-5 h-5 text-brand-dark" />
              Start First Assessment
            </button>
          ) : (
            <button 
              onClick={() => router.push('/lesson')}
              className="w-full sm:w-auto bg-brand-dark text-white rounded-full px-6 py-3.5 flex items-center justify-center gap-3 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-xl shadow-brand-dark/10 font-bold text-sm sm:text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              Continue Learning
            </button>
          )}
        </motion.div>
        
        {/* Progressive Unlocking Banner */}
        <motion.div variants={itemVariants} className="bg-brand-dark text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-yellow flex items-center justify-center shrink-0">
              {data?.profile_stage === 4 ? <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-brand-dark" /> : <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-dark" />}
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-2xl mb-0.5 sm:mb-1">
                {data?.profile_stage === 1 && "Start Your Journey"}
                {data?.profile_stage === 2 && "Personalized Journey Started"}
                {data?.profile_stage === 3 && "Advanced Profile Upgraded"}
                {data?.profile_stage === 4 && "Congratulations!"}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm font-medium leading-normal">
                {data?.profile_stage === 1 && "Complete your first assessment to begin your personalized English learning journey."}
                {data?.profile_stage === 2 && "Complete both Reading and Writing assessments to receive a more accurate learning plan."}
                {data?.profile_stage === 3 && "Your personalized learning plan has been upgraded based on multiple assessments. Complete Speaking next!"}
                {data?.profile_stage === 4 && "Your complete English profile is now available."}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow mb-1">Profile Completion</span>
            <span className="text-2xl sm:text-3xl font-heading">{data?.profile_completeness || 0}%</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Overall Progress', value: `${data?.overall_progress || 0}%`, sub: `Level: ${data?.latest_cefr_level || 'A1'}`, icon: Target, color: 'text-brand-info', bg: 'bg-blue-100' },
            { label: 'Avg Score', value: `${data?.average_score || 0}%`, sub: 'Across tests', icon: TrendingUp, color: 'text-brand-success', bg: 'bg-green-100' },
            { label: 'Assessments', value: data?.completed_assessments || 0, sub: 'Completed', icon: Clock, color: 'text-brand-warning', bg: 'bg-yellow-100' },
            { label: 'Recent Activity', value: data?.recent_activity?.length || 0, sub: 'Last 7 days', icon: BookOpen, color: 'text-brand-danger', bg: 'bg-red-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-xs border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-transparent to-brand-muted rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className={`${stat.bg} ${stat.color} w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-0.5">{stat.label}</p>
              <h3 className="font-heading text-2xl sm:text-4xl mb-0.5">{stat.value}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Learning Path & Radar */}
        {data?.profile_stage === 1 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-[32px] border border-border/40 p-6 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-2xl sm:text-4xl mb-2 sm:mb-3">Feature Locked</h3>
            <p className="text-muted-foreground text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
              Your personalized Learning Path and Weak Skills analysis will appear here after you complete your first assessment.
            </p>
            <button 
              onClick={() => router.push('/assessment')}
              className="w-full sm:w-auto bg-brand-dark text-white rounded-full px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-lg hover:-translate-y-1 transition-transform shadow-xl inline-flex items-center justify-center gap-2"
            >
              Start First Assessment <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Personalized Path */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-2xl sm:text-3xl">Your Path</h3>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
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
                      <div key={i} className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all border-brand-yellow shadow-md">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">{lesson.difficulty || 'All Levels'}</span>
                              {lesson.priority === 'HIGH' && (
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-md">High Priority</span>
                              )}
                            </div>
                            <h4 className="text-base sm:text-lg font-bold mb-1">{lesson.title}</h4>
                            {lesson.reason && (
                              <div className="text-xs text-muted-foreground flex gap-1 items-start max-w-sm">
                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{lesson.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => router.push(`/lesson?id=${lesson.id || 1}`)}
                          className="w-full sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-full bg-brand-yellow flex items-center justify-center hover:scale-105 transition-transform shadow-sm font-bold text-xs sm:text-base text-brand-dark"
                        >
                          <span className="sm:hidden mr-1">Start Lesson</span>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-brand-dark text-brand-dark" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-muted-foreground bg-white border border-border/40 rounded-2xl sm:rounded-[24px] text-sm">
                    You have completed all recommended lessons! Keep up the great work.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Weak Skills */}
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-2xl sm:text-3xl">Weak Skills</h3>
              </div>
              <div className="bg-white rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-border/40 shadow-xs space-y-3 sm:space-y-4 max-h-[380px] overflow-y-auto">
                {data?.weak_skills?.length > 0 ? (
                  data.weak_skills.map((skill: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm sm:text-base text-brand-dark">{skill.skill}</span>
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${skill.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {skill.priority}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>Latest Score</span>
                        <span className="font-medium text-brand-dark">{Math.round(skill.score)}%</span>
                      </div>
                      <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${skill.priority === 'HIGH' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(Math.max(skill.score, 5), 100)}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Target className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-xs sm:text-sm">Complete more assessments to analyze your weak skills.</p>
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
