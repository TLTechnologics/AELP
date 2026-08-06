'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  Clock, 
  Zap, 
  Flame, 
  Target, 
  AlertTriangle,
  Play, 
  BookOpen, 
  Volume2, 
  Mic, 
  FileText,
  PlusCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useStudentDetails } from '@/hooks/use-teacher';
import { Loader2 } from 'lucide-react';

export default function StudentDetailProfile() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { data: student, isLoading } = useStudentDetails(studentId);

  // New feedback text state
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState(student ? student.feedbackHistory : []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-40 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-dark animate-spin mx-auto" />
          <h1 className="font-heading text-2xl uppercase">Loading Profile...</h1>
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <HelpCircle className="w-16 h-16 text-brand-danger mx-auto" />
          <h1 className="font-heading text-4xl uppercase">Student Not Found</h1>
          <p className="text-muted-foreground font-medium">The student ID does not match our directory logs.</p>
          <button 
            onClick={() => router.push('/teacher/students')}
            className="bg-brand-dark text-white rounded-full px-6 py-3 font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        </div>
      </MainLayout>
    );
  }

  // Handle adding new feedback
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    const newFb = {
      id: `fb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'General' as const,
      feedback: newFeedback,
      teacher: 'Prof. Sarah Jenkins'
    };

    setFeedbackHistory((prev: any[]) => [newFb, ...prev]);
    setNewFeedback('');
  };

  // Skill icons mapper
  const getSkillIcon = (type: string) => {
    switch (type) {
      case 'Listening': return Volume2;
      case 'Reading': return BookOpen;
      case 'Writing': return FileText;
      case 'Speaking': return Mic;
      default: return Target;
    }
  };

  // Render weekly progress points (for SVG graph)
  const maxWeekly = Math.max(...student.weeklyProgress, 100);
  const weeklyPoints = student.weeklyProgress.map((xp: number, idx: number) => {
    const x = idx * 16.6; // 100 / 6
    const y = 90 - (xp / maxWeekly) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <MainLayout>
      <div className="space-y-8 pb-20">
        
        {/* Back Link */}
        <button 
          onClick={() => router.push('/teacher/students')}
          className="flex items-center gap-2 text-sm font-bold text-brand-dark hover:gap-3 transition-all uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* Profile Demographics Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white shrink-0 overflow-hidden">
            {typeof student.avatar === 'string' && student.avatar.startsWith('http') ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : student.avatar}
          </div>

          <div className="flex-1 text-center md:text-left z-10 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="font-heading text-4xl">{student.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 ${
                student.status === 'Good' 
                  ? 'bg-green-100 text-green-700' 
                  : student.status === 'Needs Improvement'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Good' ? 'bg-green-600' : student.status === 'Needs Improvement' ? 'bg-orange-600' : 'bg-red-600'}`} />
                {student.status}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground uppercase">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> New York, USA</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {student.id}</span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-muted px-3 py-1.5 rounded-xl text-xs font-bold text-brand-dark border border-border/30">
                Class: {student.class}
              </span>
              <span className="bg-muted px-3 py-1.5 rounded-xl text-xs font-bold text-brand-dark border border-border/30">
                Group: {student.group}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0 w-full md:w-auto">
            <div className="bg-muted px-4 py-3 rounded-2xl border border-border/50 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Attendance</p>
              <p className="font-heading text-2xl text-brand-dark mt-1">{student.attendance}%</p>
            </div>
            <div className="bg-muted px-4 py-3 rounded-2xl border border-border/50 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Accuracy</p>
              <p className="font-heading text-2xl text-brand-dark mt-1">{student.accuracy}%</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats & Weekly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Skill Mastery Dashboard */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-2xl">Language Skills Mastery</h3>
            
            <div className="space-y-5">
              {[
                { name: 'Reading', score: student.readingScore, color: 'bg-blue-500', bg: 'bg-blue-50' },
                { name: 'Listening', score: student.listeningScore, color: 'bg-purple-500', bg: 'bg-purple-50' },
                { name: 'Writing', score: student.writingScore, color: 'bg-orange-500', bg: 'bg-orange-50' },
                { name: 'Speaking', score: student.speakingScore, color: 'bg-green-500', bg: 'bg-green-50' },
              ].map(skill => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-brand-dark">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.score}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border/40 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Placement Grade</span>
              <p className="font-heading text-5xl text-brand-dark mt-1">
                {student.cefrLevel} <span className="text-lg font-bold text-muted-foreground font-sans">({student.overallScore}%)</span>
              </p>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-2xl">XP Progress Trend</h3>
            
            <div className="relative h-44 w-full flex items-end">
              <svg className="absolute inset-0 w-full h-full text-brand-yellow" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Area */}
                <path d={`M 0,90 C 25,60 50,75 75,30 L 100,60 L 100,100 L 0,100 Z`} fill="rgba(255, 225, 124, 0.15)" />
                {/* Line */}
                <path d={`M 0,90 C 25,60 50,75 75,30 L 100,60`} fill="none" stroke="var(--color-brand-dark)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              
              <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold text-muted-foreground pt-2 border-t border-border/40">
                <span>W1</span>
                <span>W2</span>
                <span>W3</span>
                <span>W4</span>
                <span>W5</span>
              </div>
            </div>
            
            <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold text-brand-dark">
              <div className="p-2 bg-muted rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Weekly Avg</span>
                {student.streak} Days
              </div>
              <div className="p-2 bg-muted rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Active Streak</span>
                <span className="flex items-center justify-center gap-0.5"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> {student.streak}d</span>
              </div>
              <div className="p-2 bg-muted rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Time Logs</span>
                {student.timeSpent}h
              </div>
            </div>
          </div>

          {/* Homework & Recommendations */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl">Tasks & Lessons</h3>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assigned Syllabus</p>
                {student.assignedLessons.map((l: string, idx: number) => (
                  <div key={idx} className="flex gap-2.5 items-center bg-muted/60 p-2.5 rounded-xl border border-border/30">
                    <BookOpen className="w-4 h-4 text-brand-dark" />
                    <span className="text-xs font-bold text-brand-dark">{l}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">SMART Recommendations</p>
                {student.recommendations.map((r: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-brand-dark font-medium leading-relaxed bg-brand-yellow/10 border border-brand-yellow/20 p-3 rounded-xl">
                    <Zap className="w-4 h-4 text-brand-yellow fill-brand-yellow mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback History & Assessment Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Assessment History Table */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-3xl">Assessment History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3 text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-brand-dark divide-y divide-border/20">
                  {student.assessmentHistory.map((as: any) => {
                    const SIcon = getSkillIcon(as.type);
                    return (
                      <tr key={as.id} className="hover:bg-muted/30">
                        <td className="p-3 font-bold">{as.title}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded border">
                            <SIcon className="w-3 h-3 text-brand-dark" />
                            {as.type}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{as.date}</td>
                        <td className="p-3 text-center text-sm">{as.score}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-3xl">Teacher Feedback history</h3>
            
            {/* New Feedback Form */}
            <form onSubmit={handleAddFeedback} className="space-y-3">
              <textarea 
                placeholder="Type private general comments or suggestions for this student..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="w-full bg-muted border border-border/50 rounded-2xl p-4 text-xs font-medium outline-none focus:border-brand-yellow transition-all"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="bg-brand-dark text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-dark/90 active:scale-95 transition-transform"
                >
                  <PlusCircle className="w-4 h-4" /> Save Feedback
                </button>
              </div>
            </form>

            {/* List of past feedback */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {feedbackHistory.map((fb: any) => (
                <div key={fb.id} className="p-4 bg-muted/60 border border-border/30 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Type: {fb.type} {fb.score !== undefined && `• Score: ${fb.score}%`}</span>
                    <span>{fb.date}</span>
                  </div>
                  <p className="text-xs font-medium text-brand-dark leading-relaxed">"{fb.feedback}"</p>
                  <p className="text-[10px] font-bold text-brand-dark/60 text-right">— {fb.teacher}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
}
