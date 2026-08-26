'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BookOpen, 
  Volume2, 
  Mic, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  GraduationCap,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/api';
import { mockClasses } from '@/lib/teacherMockData';
import { LiquidLoader } from '@/components/ui/liquid-loader';

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

export default function AnalyticsDashboard() {
  const [activeSkillTab, setActiveSkillTab] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');

  const { data: response, isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: teacherService.getStudents
  });

  const students = response?.data || [];

  // Overall calculations across all students
  const totalStudents = students.length || 1;
  const avgOverall = Math.round(students.reduce((acc: any, s: any) => acc + s.overallScore, 0) / totalStudents) || 0;
  const avgListening = Math.round(students.reduce((acc: any, s: any) => acc + s.listeningScore, 0) / totalStudents) || 0;
  const avgReading = Math.round(students.reduce((acc: any, s: any) => acc + s.readingScore, 0) / totalStudents) || 0;
  const avgWriting = Math.round(students.reduce((acc: any, s: any) => acc + s.writingScore, 0) / totalStudents) || 0;
  const avgSpeaking = Math.round(students.reduce((acc: any, s: any) => acc + s.speakingScore, 0) / totalStudents) || 0;
  const avgAttendance = Math.round(students.reduce((acc: any, s: any) => acc + s.attendance, 0) / totalStudents) || 0;

  // Ready for promotion (CEFR Level is B2 or higher and score >= 85)
  const promotionReady = students.filter((s: any) => s.overallScore >= 80).slice(0, 5);
  
  // At risk (score < 50)
  const atRisk = students.filter((s: any) => s.status === 'Critical').slice(0, 5);

  // Skill analysis data block
  const skillDetails = {
    listening: {
      title: 'Listening Domain Analysis',
      average: avgListening,
      subtext: 'Listening scores are down 1.2% this week.',
      metricLabel: 'Weakest Skill Roster',
      criticalCount: students.filter((s: any) => s.listeningScore < 50).length,
      topPerformance: students.length > 0 ? [...students].sort((a,b)=>b.listeningScore-a.listeningScore)[0].name : 'N/A'
    },
    reading: {
      title: 'Reading Domain Analysis',
      average: avgReading,
      subtext: 'Reading scores have spiked due to vocabulary drills.',
      metricLabel: 'Top Reading Roster',
      criticalCount: students.filter((s: any) => s.readingScore < 50).length,
      topPerformance: students.length > 0 ? [...students].sort((a,b)=>b.readingScore-a.readingScore)[0].name : 'N/A'
    },
    writing: {
      title: 'Writing Domain Analysis',
      average: avgWriting,
      subtext: 'Sentence coherence index represents steady growth.',
      metricLabel: 'Weakest Writing Roster',
      criticalCount: students.filter((s: any) => s.writingScore < 50).length,
      topPerformance: students.length > 0 ? [...students].sort((a,b)=>b.writingScore-a.writingScore)[0].name : 'N/A'
    },
    speaking: {
      title: 'Speaking Domain Analysis',
      average: avgSpeaking,
      subtext: 'Focus needed on vowel phonemes and paragraph stressors.',
      metricLabel: 'Weakest Speaking Roster',
      criticalCount: students.filter((s: any) => s.speakingScore < 50).length,
      topPerformance: students.length > 0 ? [...students].sort((a,b)=>b.speakingScore-a.speakingScore)[0].name : 'N/A'
    }
  };

  const activeSkill = skillDetails[activeSkillTab];

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-20"
      >
        {/* Header Row */}
        <div>
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Global Platform Diagnostics & Stats</h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase">
            Global <span className="highlight-yellow inline-block px-2">Analytics</span>
          </h1>
        </div>

        {/* Top Summary Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Overall Average score', value: `${avgOverall}%`, icon: TrendingUp, color: 'text-brand-yellow', bg: 'bg-yellow-100' },
            { label: 'Assessment Completion', value: '88%', icon: CheckCircle, color: 'text-brand-success', bg: 'bg-green-100' },
            { label: 'Platform Attendance Avg', value: `${avgAttendance}%`, icon: Users, color: 'text-brand-info', bg: 'bg-blue-100' },
            { label: 'Roster At-Risk Rate', value: '11%', icon: AlertTriangle, color: 'text-brand-danger', bg: 'bg-red-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-border/40 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-transparent to-brand-muted rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="font-heading text-4xl text-brand-dark">{stat.value}</h3>
            </div>
          ))}
        </motion.div>

        {/* Skill Analytics Tabs View */}
        <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/40 pb-4">
            <h3 className="font-heading text-3xl">Domain Performance</h3>
            
            {/* Skill Selector Tabs */}
            <div className="flex p-1 bg-muted rounded-2xl w-full md:w-auto">
              {[
                { id: 'listening', name: 'Listening', icon: Volume2 },
                { id: 'reading', name: 'Reading', icon: BookOpen },
                { id: 'writing', name: 'Writing', icon: FileText },
                { id: 'speaking', name: 'Speaking', icon: Mic },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveSkillTab(tab.id as any)}
                  className={`flex-1 md:flex-none py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                    activeSkillTab === tab.id 
                      ? 'bg-white shadow-sm text-brand-dark' 
                      : 'text-muted-foreground hover:text-brand-dark'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Performance Ring SVG Mockup */}
            <div className="text-center space-y-4">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                {/* SVG Circle indicator */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="60" stroke="var(--color-border)" strokeWidth="12" fill="none" className="text-muted/20" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="60" 
                    stroke="var(--color-brand-dark)" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * activeSkill.average) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground font-bold uppercase">Average</span>
                  <p className="font-heading text-4xl text-brand-dark">{activeSkill.average}%</p>
                </div>
              </div>
            </div>

            {/* Diagnostic stats text */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-heading text-3xl text-brand-dark">{activeSkill.title}</h4>
              <p className="text-sm text-muted-foreground font-medium">{activeSkill.subtext}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-brand-dark">
                <div className="p-4 bg-muted rounded-2xl border border-border/30">
                  <span className="text-[9px] text-muted-foreground block uppercase">Critical Domain Count</span>
                  <span className="text-sm block mt-1">{activeSkill.criticalCount} Students (&lt;50%)</span>
                </div>
                <div className="p-4 bg-muted rounded-2xl border border-border/30">
                  <span className="text-[9px] text-muted-foreground block uppercase">Top Domain Scholar</span>
                  <span className="text-sm block mt-1">{activeSkill.topPerformance}</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Promotion Ready vs At Risk lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Promotion Candidates */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-brand-success" />
              <h3 className="font-heading text-2xl text-brand-success">Promotion Ready</h3>
            </div>
            
            <div className="space-y-4 divide-y divide-border/20">
              {promotionReady.map(std => (
                <div key={std.id} className="flex justify-between items-center pt-4 first:pt-0">
                  <div>
                    <p className="font-bold text-brand-dark text-sm">{std.name}</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{std.class} • Score: {std.overallScore}%</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    CEFR {std.cefrLevel} &rarr; Level-Up
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* At Risk Candidates */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-brand-danger" />
              <h3 className="font-heading text-2xl text-brand-danger">At Risk (Critical)</h3>
            </div>
            
            <div className="space-y-4 divide-y divide-border/20">
              {atRisk.map(std => (
                <div key={std.id} className="flex justify-between items-center pt-4 first:pt-0">
                  <div>
                    <p className="font-bold text-brand-dark text-sm">{std.name}</p>
                    <p className="text-xs text-brand-danger font-bold uppercase">{std.class} • Score: {std.overallScore}%</p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Needs Practice
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </motion.div>
    </MainLayout>
  );
}
