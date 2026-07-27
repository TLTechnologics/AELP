'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';
import { mockClasses, mockStudents } from '@/lib/teacherMockData';

export default function ReportsHub() {
  const [activeReport, setActiveReport] = useState<'weekly' | 'monthly' | 'student' | 'class'>('weekly');
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].name);
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeStudent = mockStudents.find(s => s.id === selectedStudent) || mockStudents[0];
  const activeCohort = mockClasses.find(c => c.name === selectedClass) || mockClasses[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      triggerToast('PDF Report downloaded successfully! 📄📥');
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-20 relative">
        
        {/* Toast Notification Container */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-24 right-8 bg-brand-dark text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-2xl border border-brand-yellow/30 z-[100] flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-brand-yellow" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Row */}
        <div>
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Generate & Download Academic PDF Statements</h2>
          <h1 className="text-5xl md:text-6xl font-heading uppercase">
            Reports <span className="highlight-yellow inline-block px-2">Hub</span>
          </h1>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Console Card */}
          <div className="bg-white rounded-[32px] p-8 border border-border/40 shadow-sm space-y-6">
            <h3 className="font-heading text-2xl">Report Criteria</h3>

            {/* Report Type Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Report Scope</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'weekly', name: 'Weekly summary' },
                  { id: 'monthly', name: 'Monthly overview' },
                  { id: 'student', name: 'Individual Student' },
                  { id: 'class', name: 'Class Cohort' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveReport(tab.id as any)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      activeReport === tab.id 
                        ? 'bg-brand-dark text-white border-brand-dark shadow-sm' 
                        : 'bg-muted border-border/40 text-brand-dark hover:bg-muted/70'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Class selection dropdown */}
            {activeReport === 'class' && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Class Cohort</label>
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-muted border border-border/50 rounded-2xl py-3 px-4 outline-none font-bold text-xs text-brand-dark cursor-pointer"
                >
                  {mockClasses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Student selection dropdown */}
            {activeReport === 'student' && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Student</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-muted border border-border/50 rounded-2xl py-3 px-4 outline-none font-bold text-xs text-brand-dark cursor-pointer"
                >
                  {mockStudents.slice(0, 20).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
            )}

            {/* General parameters */}
            <div className="p-4 bg-yellow-50/50 border border-brand-yellow/20 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-brand-dark">Output Format</h4>
              <p className="text-[10px] text-muted-foreground leading-normal">Reports generate standard CEFR benchmark calculations including diagnostic level assessment graphs.</p>
            </div>

            {/* Action buttons */}
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Statement...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Download PDF Report
                </>
              )}
            </button>
          </div>

          {/* Interactive Report PDF Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-heading text-3xl">Live PDF Previewer</h3>

            <div className="bg-[#FAF9F6] border-2 border-brand-dark rounded-[32px] p-8 shadow-lg min-h-[500px] relative overflow-hidden flex flex-col justify-between">
              
              {/* PDF Header mockup */}
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b-2 border-brand-dark/10 pb-6">
                  <div>
                    <h2 className="font-heading text-3xl text-brand-dark">AELP ACADEMIC REPORT</h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Adaptive English Learning Platform Statement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Statement Date</p>
                    <p className="text-xs font-bold text-brand-dark">2026-07-28</p>
                  </div>
                </div>

                {/* PDF Content conditional rendering */}
                {isGenerating ? (
                  /* Loading State skeleton */
                  <div className="space-y-4 py-12 animate-pulse">
                    <div className="h-6 bg-border/50 rounded-lg w-2/3" />
                    <div className="h-4 bg-border/50 rounded-lg w-1/2" />
                    <div className="grid grid-cols-2 gap-4 pt-8">
                      <div className="h-24 bg-border/50 rounded-[20px]" />
                      <div className="h-24 bg-border/50 rounded-[20px]" />
                    </div>
                    <div className="h-20 bg-border/50 rounded-[20px] pt-4" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Weekly / Monthly Summary */}
                    {(activeReport === 'weekly' || activeReport === 'monthly') && (
                      <div className="space-y-6">
                        <div className="p-5 bg-white border border-border/60 rounded-2xl space-y-2">
                          <p className="font-sans font-bold text-sm text-brand-dark">Executive Roster Metrics ({activeReport === 'weekly' ? 'Week 30' : 'July 2026'})</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Cohort averages across all registered active students indicate a positive trend line. General reading benchmarks have improved by 3.2% over the active testing cycle. Speaking parameters continue to be the primary coaching focus.
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Average Attendance</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">91.5%</span>
                          </div>
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">XP Accumulation</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">14,250</span>
                          </div>
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Accuracy Ratio</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">94%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Class Cohort Details */}
                    {activeReport === 'class' && (
                      <div className="space-y-6">
                        <div className="flex gap-4 items-center bg-white p-5 border border-border/60 rounded-2xl">
                          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-brand-yellow shrink-0">
                            <Users className="w-6 h-6 text-brand-dark" />
                          </div>
                          <div>
                            <p className="font-sans font-bold text-sm text-brand-dark">Cohort Statement: {activeCohort.name}</p>
                            <p className="text-xs text-muted-foreground font-medium"> Roster capacity: {activeCohort.totalStudents} enrolled students.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-center text-xs font-bold text-brand-dark">
                          <div className="p-3 bg-white border rounded-xl">
                            <span className="text-[9px] text-muted-foreground block uppercase">Listening Avg</span>
                            {activeCohort.avgListening}%
                          </div>
                          <div className="p-3 bg-white border rounded-xl">
                            <span className="text-[9px] text-muted-foreground block uppercase">Reading Avg</span>
                            {activeCohort.avgReading}%
                          </div>
                          <div className="p-3 bg-white border rounded-xl">
                            <span className="text-[9px] text-muted-foreground block uppercase">Writing Avg</span>
                            {activeCohort.avgWriting}%
                          </div>
                          <div className="p-3 bg-white border rounded-xl">
                            <span className="text-[9px] text-muted-foreground block uppercase">Speaking Avg</span>
                            {activeCohort.avgSpeaking}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student Details */}
                    {activeReport === 'student' && (
                      <div className="space-y-6">
                        <div className="flex gap-4 items-center bg-white p-5 border border-border/60 rounded-2xl">
                          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center font-heading text-xl text-brand-dark shrink-0">
                            {activeStudent.avatar}
                          </div>
                          <div>
                            <p className="font-sans font-bold text-sm text-brand-dark">{activeStudent.name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{activeStudent.id} • {activeStudent.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Overall Level</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">{activeStudent.cefrLevel}</span>
                          </div>
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Streak Log</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">{activeStudent.streak} Days</span>
                          </div>
                          <div className="p-4 bg-white border border-border/60 rounded-2xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Aggregate score</span>
                            <span className="font-heading text-2xl text-brand-dark mt-1">{activeStudent.overallScore}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PDF Footer Mock */}
              <div className="border-t border-brand-dark/10 pt-4 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase mt-8">
                <span>Adaptive English Learning Platform (AELP)</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
