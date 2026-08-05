'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Bookmark, CheckCircle2, MessageSquare, Mic, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/use-dashboard';
import { FeatureLocked } from '@/components/feature-locked';
import { MainLayout } from '@/components/layout/main-layout';

export default function LessonPage() {
  const { data } = useDashboard();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');
  const [completed, setCompleted] = useState(false);

  const isLocked = data?.profile_stage === 1;

  if (isLocked) {
    return (
      <MainLayout>
        <FeatureLocked 
          title="Interactive Lessons Locked" 
          message="Complete your first diagnostic assessment to unlock your personalized learning path and lessons." 
        />
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-muted bg-grid-pattern pb-24">
      {/* Top Navigation */}
      <header className="h-20 bg-white/40 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/path" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-6 h-6 text-brand-dark" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Understanding Tone & Emotion</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Listening • Unit 1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex h-2 w-32 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-yellow w-1/2" />
          </div>
          <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {!completed ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Media & Interactions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Audio Player Card */}
              <div className="bg-brand-dark text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
                
                <h2 className="font-heading text-3xl mb-8 relative z-10">Listen to the Dialogue</h2>
                
                <div className="flex flex-col items-center gap-8 relative z-10">
                  {/* Wave Animation */}
                  <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                    {[...Array(24)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          height: isPlaying ? [10, Math.random() * 40 + 20, 10] : 10 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: isPlaying ? 0.5 + Math.random() * 0.5 : 0 
                        }}
                        className={`w-1.5 md:w-2 rounded-full ${i % 3 === 0 ? 'bg-brand-yellow' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-6 w-full max-w-md">
                    <button className="text-white/60 hover:text-white transition-colors">
                      <RotateCcw className="w-6 h-6" />
                    </button>
                    
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,225,124,0.3)]"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-brand-dark" /> : <Play className="w-8 h-8 fill-brand-dark ml-1" />}
                    </button>
                    
                    <div className="flex-1 text-sm font-bold text-center text-white/60">
                      0:42 / 1:30
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Area */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Knowledge Check</h3>
                  <span className="text-sm font-bold text-brand-info bg-blue-50 px-3 py-1 rounded-full">Question 1 of 3</span>
                </div>
                
                <p className="text-lg font-medium mb-6">What is the primary emotion expressed by the speaker when they mentioned the delay?</p>
                
                <div className="space-y-3">
                  {['Frustration', 'Excitement', 'Indifference', 'Relief'].map((opt, i) => (
                    <button key={i} className="w-full text-left p-4 rounded-2xl border-2 border-border hover:border-brand-yellow focus:border-brand-yellow focus:bg-yellow-50 outline-none transition-colors font-medium text-brand-dark">
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setCompleted(true)}
                    className="bg-brand-dark text-white rounded-full px-8 py-3 font-bold hover:bg-brand-dark/90 shadow-md"
                  >
                    Check Answer
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Tabs (Transcript / Notes / Vocab) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-border/40 h-[600px] flex flex-col">
              <div className="flex p-1 bg-muted rounded-2xl mb-6">
                {['transcript', 'vocabulary'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground hover:text-brand-dark'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'transcript' && (
                  <div className="space-y-6">
                    <p className="leading-relaxed">
                      <span className="font-bold text-brand-info">Speaker A: </span>
                      <span className="highlight-yellow inline-block px-1">I can't believe</span> the flight is delayed again. We're going to miss the connection in Dubai.
                    </p>
                    <p className="leading-relaxed opacity-50">
                      <span className="font-bold">Speaker B: </span>
                      Try to stay calm. There's another flight leaving at 8 PM.
                    </p>
                  </div>
                )}
                {activeTab === 'vocabulary' && (
                  <div className="space-y-4">
                    {[
                      { word: 'Connection', type: 'noun', def: 'A flight that you take after getting off another flight.' },
                      { word: 'Delayed', type: 'adjective', def: 'Happening at a later time than expected.' },
                    ].map((v, i) => (
                      <div key={i} className="p-4 bg-muted rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-brand-dark">{v.word}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">{v.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{v.def}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Lesson Completed State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <motion.div 
              animate={{ rotateY: 360 }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-32 h-32 bg-brand-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-success/30"
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="font-heading text-6xl mb-4">Lesson Complete!</h2>
            <p className="text-xl text-muted-foreground font-medium mb-8">You earned +50 XP and mastered 2 new words.</p>
            
            <div className="flex justify-center gap-4">
              <Link href="/path" className="bg-brand-dark text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                Continue Path
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
