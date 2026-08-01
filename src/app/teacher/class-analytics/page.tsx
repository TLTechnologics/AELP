'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  BookOpen,
  Volume2,
  Mic,
  FileText,
  Clock,
  Award
} from 'lucide-react';
import { mockClasses, mockStudents } from '@/lib/teacherMockData';

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

export default function ClassAnalytics() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>(mockClasses.length > 0 ? mockClasses[0].name : '');

  // Retrieve active class metrics
  const activeClass = mockClasses.find(c => c.name === selectedClass) || mockClasses[0] || null;
  const classStudents = mockStudents.filter(s => s.class === selectedClass);
  const total = classStudents.length || 1;

  // Sorting lists
  const sortedOverall = [...classStudents].sort((a, b) => b.overallScore - a.overallScore);
  const topThree = sortedOverall.slice(0, 3);
  const criticalList = classStudents.filter(s => s.status === 'Critical');
  const needsImprovementList = classStudents.filter(s => s.status === 'Needs Improvement');

  // Heatmap helper for cell background
  const getCellColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-brand-success';
    if (attendance >= 80) return 'text-brand-warning';
    return 'text-brand-danger';
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-20"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-xl text-muted-foreground font-medium mb-1">Cohort-Wide Analytics</h2>
            <h1 className="text-5xl md:text-6xl font-heading uppercase">
              Class <span className="highlight-yellow inline-block px-2">Analytics</span>
            </h1>
          </div>
          
          {/* Class Select Dropdown */}
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-border/50 shadow-sm flex items-center gap-3">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-full overflow-x-auto">
            {mockClasses.length > 0 ? mockClasses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.name)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedClass === c.name 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {c.name}
              </button>
            )) : <span className="px-4 py-2 text-sm text-gray-500">No classes available</span>}
            </div>
          </div>
        </motion.div>

        {activeClass ? (
          <>
            {/* Class Level Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Cohort Students', value: activeClass?.totalStudents, icon: Users, color: 'text-brand-info', bg: 'bg-blue-100' },
                { label: 'Overall Average Score', value: `${activeClass?.avgOverall}%`, icon: TrendingUp, color: 'text-brand-yellow', bg: 'bg-yellow-100' },
                { label: 'Average Attendance', value: `${activeClass?.attendance}%`, icon: Clock, color: 'text-brand-success', bg: 'bg-green-100' },
                { label: 'At Risk (Critical)', value: activeClass?.missingAssessments, icon: AlertTriangle, color: 'text-brand-danger', bg: 'bg-red-100' },
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

            {/* LRWS Averages Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { name: 'Listening Avg', score: activeClass?.avgListening, icon: Volume2, color: 'text-purple-600', fill: 'bg-purple-500' },
                { name: 'Reading Avg', score: activeClass?.avgReading, icon: BookOpen, color: 'text-blue-600', fill: 'bg-blue-500' },
                { name: 'Writing Avg', score: activeClass?.avgWriting, icon: FileText, color: 'text-orange-600', fill: 'bg-orange-500' },
                { name: 'Speaking Avg', score: activeClass?.avgSpeaking, icon: Mic, color: 'text-green-600', fill: 'bg-green-500' },
              ].map((skill, i) => (
                <div key={i} className="bg-white rounded-[24px] p-6 border border-border/40 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <skill.icon className={`w-5 h-5 ${skill.color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{skill.name}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-heading text-3xl text-brand-dark">{skill.score}%</span>
                      <span className="text-xs text-muted-foreground font-bold">{skill.score >= 70 ? 'Satisfactory' : 'Needs Focus'}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${skill.fill}`} style={{ width: `${skill.score}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Top Performers & At Risk Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Top Performers */}
              <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
                  <h3 className="font-heading text-2xl">Top Performers</h3>
                </div>
                
                <div className="space-y-4">
                  {topThree.map((std, i) => (
                    <div 
                      key={std.id}
                      onClick={() => router.push(`/teacher/students/${std.id}`)}
                      className="flex items-center justify-between p-3.5 bg-muted/50 rounded-2xl border border-border/20 cursor-pointer hover:border-brand-dark transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-xl text-muted-foreground">#0{i + 1}</span>
                        <div>
                          <p className="font-bold text-brand-dark">{std.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">XP: {std.xp.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-heading text-xl text-brand-dark">{std.overallScore}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Students Needing Attention */}
              <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-brand-danger" />
                  <h3 className="font-heading text-2xl text-brand-danger">Needs Attention</h3>
                </div>
                
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {criticalList.length > 0 ? (
                    criticalList.map((std) => (
                      <div 
                        key={std.id}
                        onClick={() => router.push(`/teacher/students/${std.id}`)}
                        className="flex items-center justify-between p-3.5 bg-red-50/20 rounded-2xl border border-brand-danger/10 cursor-pointer hover:border-brand-danger transition-all animate-pulse"
                      >
                        <div>
                          <p className="font-bold text-brand-dark">{std.name}</p>
                          <p className="text-[10px] text-brand-danger font-bold uppercase">Critical Margin</p>
                        </div>
                        <span className="font-heading text-xl text-brand-danger">{std.overallScore}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground text-center py-8">No students are currently in the Critical bracket. Great work!</p>
                  )}
                </div>
              </motion.div>

              {/* Missing Assessments */}
              <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-brand-success" />
                  <h3 className="font-heading text-2xl">Class Highlights</h3>
                </div>
                
                <div className="space-y-4 text-xs font-bold text-brand-dark">
                  <div className="p-4 bg-muted rounded-2xl space-y-1 border border-border/30">
                    <p className="text-muted-foreground uppercase text-[10px]">Highest Attendance</p>
                    <p className="text-sm">{classStudents.sort((a,b)=>b.attendance-a.attendance)[0]?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-2xl space-y-1 border border-border/30">
                    <p className="text-muted-foreground uppercase text-[10px]">Most Consistent Practice</p>
                    <p className="text-sm">{classStudents.sort((a,b)=>b.streak-a.streak)[0]?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-2xl space-y-1 border border-border/30">
                    <p className="text-muted-foreground uppercase text-[10px]">Cohort Growth Focus</p>
                    <p className="text-sm">Speaking Rubric Context (Stress & Vowels)</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Cohort Heatmap Grid */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-heading text-3xl">Performance Heatmap</h3>
                  <p className="text-sm text-muted-foreground font-medium">Quick inspection of skill averages across the student roster.</p>
                </div>
                
                {/* Color key */}
                <div className="flex gap-4 text-xs font-bold uppercase">
                  <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-green-100 border border-green-200 rounded" /> &ge; 80%</span>
                  <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-orange-100 border border-orange-200 rounded" /> &ge; 60%</span>
                  <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-red-100 border border-red-200 rounded" /> &lt; 60%</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40">
                      <th className="p-4">Student</th>
                      <th className="p-4 text-center">Listening</th>
                      <th className="p-4 text-center">Reading</th>
                      <th className="p-4 text-center">Writing</th>
                      <th className="p-4 text-center">Speaking</th>
                      <th className="p-4 text-center">Overall</th>
                      <th className="p-4 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-brand-dark divide-y divide-border/20">
                    {classStudents.slice(0, 15).map(std => (
                      <tr key={std.id} className="hover:bg-muted/30">
                        <td 
                          onClick={() => router.push(`/teacher/students/${std.id}`)}
                          className="p-4 font-bold hover:text-brand-yellow cursor-pointer"
                        >
                          {std.name}
                        </td>
                        <td className={`p-4 text-center border-x border-border/10 ${getCellColor(std.listeningScore)}`}>{std.listeningScore}%</td>
                        <td className={`p-4 text-center border-x border-border/10 ${getCellColor(std.readingScore)}`}>{std.readingScore}%</td>
                        <td className={`p-4 text-center border-x border-border/10 ${getCellColor(std.writingScore)}`}>{std.writingScore}%</td>
                        <td className={`p-4 text-center border-x border-border/10 ${getCellColor(std.speakingScore)}`}>{std.speakingScore}%</td>
                        <td className="p-4 text-center font-heading text-sm">{std.overallScore}%</td>
                        <td className={`p-4 text-center font-bold ${getAttendanceColor(std.attendance)}`}>{std.attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => router.push('/teacher/students')}
                  className="text-xs font-bold text-brand-dark bg-muted hover:bg-border/60 px-5 py-2.5 rounded-xl border border-border/40 transition-colors uppercase"
                >
                  View Full Directory List
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No class data available</p>
          </div>
        )}

      </motion.div>
    </MainLayout>
  );
}
