'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, Mic, FileText, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STAGES = {
  INTRO: 0,
  ASSESSMENT: 1,
  RESULTS: 2
};

export default function AssessmentPage() {
  const router = useRouter();
  const [stage, setStage] = useState(STAGES.INTRO);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // Timer logic for assessment
  useEffect(() => {
    if (stage === STAGES.ASSESSMENT && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [stage, timeLeft]);

  const questions = [
    { type: 'Listening', icon: Volume2, task: 'Listen to the audio and select the best response.', color: 'text-purple-600' },
    { type: 'Reading', icon: BookOpen, task: 'Read the passage and answer the question below.', color: 'text-blue-600' },
    { type: 'Writing', icon: FileText, task: 'Write a short paragraph about your weekend.', color: 'text-orange-600' },
    { type: 'Speaking', icon: Mic, task: 'Read the following sentence aloud clearly.', color: 'text-green-600' },
  ];

  const handleNextQuestion = () => {
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(prev => prev + 1);
      setTimeLeft(60); // Reset timer
    } else {
      setStage(STAGES.RESULTS);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <AnimatePresence mode="wait">
        
        {/* INTRO STAGE */}
        {stage === STAGES.INTRO && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-8"
          >
            <div className="w-32 h-32 bg-brand-yellow rounded-full mx-auto flex items-center justify-center shadow-xl shadow-brand-yellow/30">
              <span className="text-6xl">🎯</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="font-heading text-5xl md:text-6xl">Diagnostic Assessment</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Before we build your personalized learning path, we need to assess your current skills across 4 key areas.
              </p>
            </div>

            <div className="flex justify-center gap-6 py-6">
              {[Volume2, BookOpen, FileText, Mic].map((Icon, i) => (
                <div key={i} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Icon className="w-6 h-6 text-brand-dark" />
                </div>
              ))}
            </div>

            <button 
              onClick={() => setStage(STAGES.ASSESSMENT)}
              className="bg-brand-dark text-white rounded-full px-10 py-4 font-bold text-lg inline-flex items-center gap-3 hover:bg-brand-dark/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-dark/10"
            >
              Start Assessment <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* ASSESSMENT STAGE */}
        {stage === STAGES.ASSESSMENT && (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full"
          >
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-danger animate-pulse" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                  Question {questionIdx + 1} of {questions.length}
                </div>
              </div>

              {/* Mini Progress */}
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className={`w-8 h-2 rounded-full ${i <= questionIdx ? 'bg-brand-yellow' : 'bg-border/60'}`} />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[400px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-muted rounded-bl-full opacity-50"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const QIcon = questions[questionIdx].icon;
                    return (
                      <>
                        <QIcon className={`w-6 h-6 ${questions[questionIdx].color}`} />
                        <span className="font-bold uppercase tracking-wider text-muted-foreground text-sm">
                          {questions[questionIdx].type} Assessment
                        </span>
                      </>
                    );
                  })()}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-heading mb-8">
                  {questions[questionIdx].task}
                </h2>

                {/* Dummy Interactive Area */}
                <div className="flex-1 bg-muted rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center p-8">
                  <p className="text-muted-foreground font-medium text-center">
                    [Interactive {questions[questionIdx].type} Component Here]
                  </p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleNextQuestion}
                    className="bg-brand-yellow text-brand-dark rounded-full px-8 py-3 font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md"
                  >
                    Next Question <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULTS STAGE */}
        {stage === STAGES.RESULTS && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-full space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="font-heading text-5xl">Assessment Complete!</h1>
              <p className="text-xl text-muted-foreground">We've generated your personalized learning path.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-yellow/10" />
                <div className="text-center relative z-10">
                  <p className="text-brand-dark/60 font-bold uppercase tracking-widest text-sm mb-2">Overall Level</p>
                  <h2 className="text-7xl font-heading text-brand-dark mb-2">B1</h2>
                  <p className="text-brand-dark font-medium">Intermediate</p>
                </div>
              </div>

              {/* Skill Breakdown */}
              <div className="bg-white rounded-[32px] p-8 shadow-xl space-y-5">
                <h3 className="font-bold text-lg mb-4">Skill Breakdown</h3>
                {[
                  { name: 'Reading', score: '84%', level: 'Advanced', color: 'bg-blue-500' },
                  { name: 'Listening', score: '38%', level: 'Beginner', color: 'bg-purple-500' },
                  { name: 'Writing', score: '59%', level: 'Intermediate', color: 'bg-orange-500' },
                  { name: 'Speaking', score: '42%', level: 'Beginner', color: 'bg-green-500' },
                ].map(skill => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: skill.score }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${skill.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => router.push('/')}
                className="bg-brand-dark text-white rounded-full px-12 py-4 font-bold text-lg inline-flex items-center gap-3 hover:bg-brand-dark/90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-dark/20"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
