'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Target, Book, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'avatar', title: 'Choose your avatar' },
  { id: 'level', title: 'Current English Level' },
  { id: 'goals', title: 'Learning Goals' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      router.push('/');
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {steps.map((step, idx) => (
          <div key={step.id} className="h-2 flex-1 rounded-full bg-border/50 overflow-hidden">
            <motion.div 
              className="h-full bg-brand-yellow"
              initial={{ width: 0 }}
              animate={{ width: currentStep >= idx ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <div className="text-center mb-10">
              <h2 className="font-heading text-4xl mb-3">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground font-medium">Personalize your learning experience</p>
            </div>

            {/* Step 1: Avatar */}
            {currentStep === 0 && (
              <div className="grid grid-cols-3 gap-4">
                {['🦊', '🐼', '🦁', '🐸', '🐯', '🦉'].map((emoji) => (
                  <button key={emoji} className="aspect-square rounded-3xl bg-muted text-5xl flex items-center justify-center hover:bg-brand-yellow hover:scale-105 active:scale-95 transition-all focus:ring-4 focus:ring-brand-yellow/30 outline-none">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Level */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {[
                  { label: 'Beginner', desc: 'I know a few words and phrases.' },
                  { label: 'Intermediate', desc: 'I can have basic conversations.' },
                  { label: 'Advanced', desc: 'I am fluent but want to perfect it.' }
                ].map((level) => (
                  <button key={level.label} className="w-full p-4 rounded-2xl border-2 border-border hover:border-brand-yellow hover:bg-yellow-50/50 text-left transition-colors flex items-center justify-between group focus:border-brand-yellow outline-none">
                    <div>
                      <h3 className="font-bold text-lg">{level.label}</h3>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-brand-yellow flex items-center justify-center">
                      <div className="w-3 h-3 bg-brand-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Target, label: 'Pass an Exam (IELTS/TOEFL)' },
                  { icon: Book, label: 'Improve for Work' },
                  { icon: Flame, label: 'Travel & Culture' }
                ].map((goal) => (
                  <button key={goal.label} className="w-full p-5 rounded-2xl bg-muted hover:bg-brand-dark hover:text-white group transition-colors flex items-center gap-4 text-left focus:ring-4 outline-none focus:ring-brand-dark/20">
                    <div className="w-12 h-12 rounded-full bg-white text-brand-dark flex items-center justify-center group-hover:bg-brand-yellow transition-colors">
                      <goal.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg">{goal.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
          <button 
            onClick={prevStep}
            className={`p-3 rounded-full hover:bg-muted transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft className="w-6 h-6 text-brand-dark" />
          </button>
          
          <button 
            onClick={nextStep}
            className="bg-brand-dark text-white rounded-full px-8 py-3 font-bold flex items-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-xl shadow-brand-dark/20"
          >
            {currentStep === steps.length - 1 ? 'Start Learning' : 'Continue'} 
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
