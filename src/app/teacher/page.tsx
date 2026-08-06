'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/api';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Bell,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  PenTool,
  BookOpen
} from 'lucide-react';
import { 
  mockClasses, 
  mockAssessments, 
  mockAlerts, 
  mockRecommendations, 
  mockNotifications 
} from '@/lib/teacherMockData';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>('All');
  
  const { data: dbStudents = [], isLoading, isError } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: async () => {
      const res = await teacherService.getStudents();
      return res.data;
    }
  });

  // Filtered stats
  const students = selectedClass === 'All' 
    ? dbStudents 
    : dbStudents.filter((s: any) => s.class === selectedClass);
    
  const pendingAssessments = mockAssessments.filter(a => a.status === 'Pending');
  const gradedAssessments = mockAssessments.filter(a => a.status === 'Graded');

  // Stats calculation
  const totalStudents = students.length;
  const totalClasses = mockClasses.length;
  const pendingCount = pendingAssessments.length;
  const completedWeekly = gradedAssessments.length;
  const needingAttention = students.filter((s: any) => s.status !== 'Good').length;

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }
  
  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-xl font-heading text-gray-800">Cannot load students data</p>
          <p className="text-sm text-gray-500">Please make sure NEXT_PUBLIC_API_URL is correct and the backend is running.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg">Retry</button>
        </div>
      </MainLayout>
    );
  }
  
  const avgClassScore = Math.round(
    students.reduce((acc: number, s: any) => acc + s.overallScore, 0) / (totalStudents || 1)
  );

  // Skill averages
  const avgL = Math.round(students.reduce((acc: number, s: any) => acc + s.listeningScore, 0) / (totalStudents || 1));
  const avgR = Math.round(students.reduce((acc: number, s: any) => acc + s.readingScore, 0) / (totalStudents || 1));
  const avgW = Math.round(students.reduce((acc: number, s: any) => acc + s.writingScore, 0) / (totalStudents || 1));
  const avgS = Math.round(students.reduce((acc: number, s: any) => acc + s.speakingScore, 0) / (totalStudents || 1));

  // Radar points
  const rCenter = 50;
  const rScale = 0.4;
  const points = [
    `${rCenter},${rCenter - avgR * rScale}`, // Up (Reading)
    `${rCenter + avgW * rScale},${rCenter}`, // Right (Writing)
    `${rCenter},${rCenter + avgS * rScale}`, // Down (Speaking)
    `${rCenter - avgL * rScale},${rCenter}`  // Left (Listening)
  ].join(' ');

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-20"
      >
        {/* Header Row */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-sm sm:text-xl text-muted-foreground font-medium mb-1">Welcome back, Instructor! 👋</h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading uppercase tracking-tight">
              Teacher <span className="highlight-yellow inline-block px-2">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* Manage Lessons Link */}
            <Link 
              href="/teacher/lessons" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs hover:scale-105 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-brand-dark" /> Manage Lessons
            </Link>

            {/* Assessment Builder Link */}
            <Link 
              href="/teacher/assessments" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95"
            >
              <PenTool className="w-4 h-4" /> Assessment Builder
            </Link>

            {/* Class Filters */}
            <div className="w-full sm:w-auto flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-border/50 shadow-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground">Cohort:</span>
              </div>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer text-brand-dark"
              >
                <option value="All">All Cohorts (100 Students)</option>
                {mockClasses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Smart Alerts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {mockAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 relative overflow-hidden transition-all hover:scale-[1.02] shadow-xs ${
                alert.type === 'critical' 
                  ? 'border-brand-danger/30 bg-red-50/50 text-brand-danger' 
                  : alert.type === 'warning'
                    ? 'border-brand-warning/30 bg-orange-50/50 text-brand-warning'
                    : 'border-brand-info/30 bg-blue-50/50 text-brand-info'
              }`}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">{alert.class}</p>
                <p className="text-xs sm:text-sm font-medium text-brand-dark mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-brand-info', bg: 'bg-blue-100' },
            { label: 'Total Classes', value: totalClasses, icon: GraduationCap, color: 'text-brand-success', bg: 'bg-green-100' },
            { label: 'Pending Eval', value: pendingCount, icon: Clock, color: 'text-brand-warning', bg: 'bg-yellow-100' },
            { label: 'Weekly Graded', value: completedWeekly, icon: CheckCircle, color: 'text-brand-success', bg: 'bg-emerald-100' },
            { label: 'Need Attention', value: needingAttention, icon: AlertTriangle, color: 'text-brand-danger', bg: 'bg-red-100' },
            { label: 'Avg Class Score', value: `${avgClassScore}%`, icon: TrendingUp, color: 'text-brand-info', bg: 'bg-indigo-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs border border-border/40 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-transparent to-brand-muted rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className={`${stat.bg} ${stat.color} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="font-heading text-2xl sm:text-3xl text-brand-dark">{stat.value}</h3>
            </div>
          ))}
        </motion.div>

        {/* Main Charts & Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Skill Performance Radar & Stats */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-2xl">LRWS performance</h3>
            
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              {/* Concentric grid lines */}
              <div className="absolute inset-0 border-2 border-muted rounded-full" />
              <div className="absolute inset-6 border-2 border-muted rounded-full opacity-70" />
              <div className="absolute inset-12 border-2 border-muted rounded-full opacity-45" />
              <div className="absolute inset-18 border-2 border-muted rounded-full opacity-20" />
              
              {/* Axes lines */}
              <div className="absolute w-full h-[1px] bg-muted/60 rotate-0"></div>
              <div className="absolute w-full h-[1px] bg-muted/60 rotate-90"></div>
              
              {/* Data Polygon */}
              <svg className="absolute inset-0 w-full h-full text-brand-yellow/85" viewBox="0 0 100 100">
                <polygon points={points} fill="currentColor" stroke="var(--color-brand-dark)" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>

              {/* Labels */}
              <span className="absolute -top-6 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border">Reading ({avgR}%)</span>
              <span className="absolute -right-12 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border">Writing ({avgW}%)</span>
              <span className="absolute -bottom-6 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border">Speaking ({avgS}%)</span>
              <span className="absolute -left-12 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border">Listening ({avgL}%)</span>
            </div>

            <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Strongest Domain</p>
                <p className="font-heading text-lg mt-1 text-brand-info">Reading</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Growth Focus</p>
                <p className="font-heading text-lg mt-1 text-brand-danger">Speaking</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Progress Line Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-2xl">Weekly Activity</h3>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-full">Submissions</span>
            </div>
            
            {/* Custom SVG Line Chart */}
            <div className="relative h-44 w-full flex items-end">
              <svg className="absolute inset-0 w-full h-full text-brand-yellow" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Area under line */}
                <path d="M 0,90 Q 20,40 40,75 T 80,30 L 100,50 L 100,100 L 0,100 Z" fill="rgba(255, 225, 124, 0.15)" />
                {/* Graph line */}
                <path d="M 0,90 Q 20,40 40,75 T 80,30 L 100,50" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Plot points */}
                <circle cx="20" cy="50" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="40" cy="75" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="60" cy="45" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="80" cy="30" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
              </svg>
              
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold text-muted-foreground pt-2 border-t border-border/40">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="pt-2 text-center text-xs font-medium text-muted-foreground">
              Total submissions spiked mid-week due to Writing modules.
            </div>
          </motion.div>

          {/* Skill Groups Distribution */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-4">
            <h3 className="font-heading text-2xl">Cohorts Skill Groups</h3>
            
            <div className="space-y-3.5">
              {[
                { group: 'Beginner Listening', count: 18, color: 'bg-purple-500' },
                { group: 'Advanced Reading', count: 24, color: 'bg-blue-500' },
                { group: 'Intermediate Writing', count: 32, color: 'bg-orange-500' },
                { group: 'Beginner Speaking', count: 26, color: 'bg-green-500' },
              ].map((g, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-brand-dark">
                    <span>{g.group}</span>
                    <span>{g.count} Students ({Math.round(g.count)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.count}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Smart Recommendations */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
              <h3 className="font-heading text-3xl">Smart Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockRecommendations.map(rec => (
                <div key={rec.id} className="bg-white rounded-[24px] p-6 border border-border/40 shadow-sm flex flex-col justify-between hover:border-brand-dark hover:shadow-md transition-all group">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase bg-brand-yellow text-brand-dark px-2.5 py-1 rounded-full">
                      Focus: {rec.focus}
                    </span>
                    <p className="font-sans font-bold text-base text-brand-dark leading-snug">{rec.issue}</p>
                    <p className="text-sm text-muted-foreground font-medium">Suggested activity: <strong className="text-brand-dark">{rec.suggestedActivity}</strong></p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                    <span className="text-xs font-bold text-muted-foreground">⏱️ {rec.duration}</span>
                    <button className="text-xs font-bold text-brand-dark flex items-center gap-1 group-hover:gap-2 transition-all">
                      Assign to Cohort <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Submissions & Notifications */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-brand-dark" />
              <h3 className="font-heading text-3xl">Alerts & Activities</h3>
            </div>

            <div className="bg-white rounded-[32px] p-6 border border-border/40 shadow-sm space-y-5 max-h-[380px] overflow-y-auto custom-scrollbar">
              {mockNotifications.map(n => (
                <div key={n.id} className="flex gap-4 items-start pb-4 border-b border-border/30 last:border-0 last:pb-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${n.unread ? 'bg-brand-yellow' : 'bg-border'}`} />
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-sans font-bold text-sm text-brand-dark">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground font-medium">{n.date.split(' ')[1]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </MainLayout>
  );
}
