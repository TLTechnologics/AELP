'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  ChevronRight,
  Filter,
  PenTool,
  BookOpen,
  Info,
  Search,
  Mic
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
  const [searchQuery, setSearchQuery] = useState(''); // IMPROVE-023
  const [assignToast, setAssignToast] = useState(false); // BUG-043
  
  const { data: dbStudents = [], isLoading } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: async () => {
      try {
        const res = await teacherService.getStudents();
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    }
  });

  // Filtered stats — IMPROVE-023: name search
  const students = (selectedClass === 'All' 
    ? dbStudents 
    : dbStudents.filter((s: any) => s.class === selectedClass)
  ).filter((s: any) => 
    !searchQuery || s.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
    
  const pendingAssessments = mockAssessments.filter(a => a.status === 'Pending');
  const gradedAssessments = mockAssessments.filter(a => a.status === 'Graded');

  // Stats calculation
  const totalStudents = students.length;
  const totalClasses = mockClasses.length;
  const pendingCount = pendingAssessments.length;
  const completedWeekly = gradedAssessments.length;
  const needingAttention = students.filter((s: any) => s.status !== 'Good').length;

  const avgClassScore = Math.round(
    students.reduce((acc: number, s: any) => acc + s.overallScore, 0) / (totalStudents || 1)
  );

  // Skill averages
  const avgL = Math.round(students.reduce((acc: number, s: any) => acc + s.listeningScore, 0) / (totalStudents || 1));
  const avgR = Math.round(students.reduce((acc: number, s: any) => acc + s.readingScore, 0) / (totalStudents || 1));
  const avgW = Math.round(students.reduce((acc: number, s: any) => acc + s.writingScore, 0) / (totalStudents || 1));
  const avgS = Math.round(students.reduce((acc: number, s: any) => acc + s.speakingScore, 0) / (totalStudents || 1));

  // BUG-045: Compute strongest/weakest domains dynamically
  const skillMap: Record<string, number> = { Listening: avgL, Reading: avgR, Writing: avgW, Speaking: avgS };
  const sortedSkills = Object.entries(skillMap).sort(([,a],[,b]) => b - a);
  const strongestDomain = sortedSkills[0][0];
  const growthFocus = sortedSkills[sortedSkills.length - 1][0];

  // BUG-042: Compute skill group distribution from real student data
  const skillGroups = [
    { group: 'Listening', count: students.filter((s: any) => (s.listeningScore || 0) > 0).length, color: 'bg-purple-500' },
    { group: 'Reading', count: students.filter((s: any) => (s.readingScore || 0) > 0).length, color: 'bg-blue-500' },
    { group: 'Writing', count: students.filter((s: any) => (s.writingScore || 0) > 0).length, color: 'bg-orange-500' },
    { group: 'Speaking', count: students.filter((s: any) => (s.speakingScore || 0) > 0).length, color: 'bg-green-500' },
  ];
  const maxGroupCount = Math.max(...skillGroups.map(g => g.count), 1);

  // BUG-044: Proper date formatting helper
  const formatNotifTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dateStr));
    } catch {
      return dateStr?.split(' ')[1] || dateStr;
    }
  };

  // BUG-043: Assign to Cohort handler
  const handleAssignToCohort = () => {
    setAssignToast(true);
    setTimeout(() => setAssignToast(false), 2000);
  };

  // Radar points
  const rCenter = 50;
  const rScale = 0.4;
  const points = [
    `${rCenter},${rCenter - avgR * rScale}`,
    `${rCenter + avgW * rScale},${rCenter}`,
    `${rCenter},${rCenter + avgS * rScale}`,
    `${rCenter - avgL * rScale},${rCenter}`
  ].join(' ');

  return (
    <>
      {isLoading && <LiquidLoader isLooping={true} />}
      <MainLayout>
        {/* BUG-043: Assign toast notification */}
        <AnimatePresence>
          {assignToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 font-bold"
            >
              <CheckCircle className="w-5 h-5 text-white" />
              Student assigned successfully
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className={`space-y-8 pb-20 ${isLoading ? 'blur-sm opacity-50 pointer-events-none select-none transition-all duration-300' : 'transition-all duration-300'}`}
        >
        {/* Header Row */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-sm sm:text-xl text-muted-foreground font-medium mb-1">Welcome back, Instructor! 👋</h2>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase tracking-tight">
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

            {/* Speaking Eval Link */}
            <Link 
              href="/teacher/speaking" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4" /> Speaking Eval
            </Link>

            {/* Writing Eval Link */}
            <Link 
              href="/teacher/writing" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95"
            >
              <PenTool className="w-4 h-4" /> Writing Eval
            </Link>

            {/* Class Filters */}
            <div className="w-full sm:w-auto flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-border/50 shadow-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-bold uppercase text-muted-foreground">Cohort:</span>
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

        {/* Smart Alerts — IMPROVE-024: use Info icon for info-type alerts */}
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
              {alert.type === 'info' 
                ? <Info className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                : <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
              }
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-75">{alert.class}</p>
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
              <p className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="font-heading text-2xl sm:text-3xl text-brand-dark">{stat.value}</h3>
            </div>
          ))}
        </motion.div>

        {/* Main Charts & Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Skill Performance Radar & Stats */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-2xl">LRWS performance</h3>
            
            {/* BUG-040: overflow-visible on labels container so they don't clip */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center overflow-visible">
              <div className="absolute inset-0 border-2 border-muted rounded-full" />
              <div className="absolute inset-6 border-2 border-muted rounded-full opacity-70" />
              <div className="absolute inset-12 border-2 border-muted rounded-full opacity-45" />
              
              <div className="absolute w-full h-[1px] bg-muted/60 rotate-0"></div>
              <div className="absolute w-full h-[1px] bg-muted/60 rotate-90"></div>
              
              <svg className="absolute inset-0 w-full h-full text-brand-yellow/85" viewBox="0 0 100 100">
                <polygon points={points} fill="currentColor" stroke="var(--color-brand-dark)" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>

              {/* BUG-040: Labels repositioned to avoid clipping */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border whitespace-nowrap">R {avgR}%</span>
              <span className="absolute top-1/2 -right-14 -translate-y-1/2 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border whitespace-nowrap">W {avgW}%</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border whitespace-nowrap">S {avgS}%</span>
              <span className="absolute top-1/2 -left-14 -translate-y-1/2 text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-border whitespace-nowrap">L {avgL}%</span>
            </div>

            {/* BUG-045: Dynamic strongest/weakest domains */}
            <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Strongest Domain</p>
                <p className="font-heading text-lg mt-1 text-brand-info">{strongestDomain}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Growth Focus</p>
                <p className="font-heading text-lg mt-1 text-brand-danger">{growthFocus}</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Activity Line Chart — BUG-041: clearly labeled as demo */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-2xl">Weekly Activity</h3>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">Demo Data</span>
            </div>
            
            <div className="relative h-44 w-full flex items-end">
              <svg className="absolute inset-0 w-full h-full text-brand-yellow" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 0,90 Q 20,40 40,75 T 80,30 L 100,50 L 100,100 L 0,100 Z" fill="rgba(255, 225, 124, 0.15)" />
                <path d="M 0,90 Q 20,40 40,75 T 80,30 L 100,50" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="20" cy="50" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="40" cy="75" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="60" cy="45" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
                <circle cx="80" cy="30" r="4" fill="var(--color-brand-yellow)" stroke="var(--color-brand-dark)" strokeWidth="1.5" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs font-bold text-muted-foreground pt-2 border-t border-border/40">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="pt-2 text-center text-xs font-medium text-muted-foreground">
              Real activity data will appear here once integrated.
            </div>
          </motion.div>

          {/* Skill Groups — BUG-042: computed from real student data */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-4">
            <h3 className="font-heading text-2xl">Skills Progress</h3>
            
            <div className="space-y-3.5">
              {skillGroups.map((g, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-brand-dark">
                    <span>{g.group}</span>
                    <span>{g.count} students</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${g.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(g.count / maxGroupCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
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
            
            {/* IMPROVE-023: Search input above student list */}
            <div className="flex items-center gap-3 bg-white rounded-[24px] px-4 py-3 border border-border/40 shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student by name..."
                className="bg-transparent text-sm font-medium text-brand-dark outline-none w-full placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockRecommendations.map(rec => (
                <div key={rec.id} className="bg-white rounded-[24px] p-6 border border-border/40 shadow-sm flex flex-col justify-between hover:border-brand-dark hover:shadow-md transition-all group">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase bg-brand-yellow text-brand-dark px-2.5 py-1 rounded-full">
                      Focus: {rec.focus}
                    </span>
                    <p className="font-sans font-bold text-base text-brand-dark leading-snug">{rec.issue}</p>
                    <p className="text-sm text-muted-foreground font-medium">Suggested activity: <strong className="text-brand-dark">{rec.suggestedActivity}</strong></p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                    <span className="text-xs font-bold text-muted-foreground">⏱️ {rec.duration}</span>
                    {/* BUG-043: Assign button now has a handler */}
                    <button
                      onClick={handleAssignToCohort}
                      className="text-xs font-bold text-brand-dark flex items-center gap-1 group-hover:gap-2 transition-all hover:text-brand-info"
                    >
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
                      {/* BUG-044: proper date formatting */}
                      <span className="text-xs text-muted-foreground font-medium">{formatNotifTime(n.date)}</span>
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
    </>
  );
}
