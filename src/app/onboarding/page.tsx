'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Target, Book, Flame, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'avatar', title: 'Choose Your Avatar' },   // BUG-017: fixed to UPPERCASE
  { id: 'level', title: 'Current English Level' },
  { id: 'goals', title: 'Learning Goals' },
];

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐯', '🦉'];
const LEVELS = [
  { label: 'Beginner', desc: 'I know a few words and phrases.' },
  { label: 'Intermediate', desc: 'I can have basic conversations.' },
  { label: 'Advanced', desc: 'I am fluent but want to perfect it.' },
];
const GOALS = [
  { icon: Target, label: 'Pass an Exam (IELTS/TOEFL)' },
  { icon: Book, label: 'Improve for Work' },
  { icon: Flame, label: 'Travel & Culture' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // BUG-014, 015, 016: track selection state for all three steps
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

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
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 }),
  };

  return (
    <div className="w-full max-w-2xl">
      {/* IMPROVE-012: Labeled step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              currentStep === idx
                ? 'bg-brand-dark text-white shadow-md'
                : currentStep > idx
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-border/50 text-muted-foreground'
            }`}>
              {currentStep > idx ? <Check className="w-3 h-3" /> : <span>{idx + 1}</span>}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full transition-colors ${currentStep > idx ? 'bg-brand-yellow' : 'bg-border/50'}`} />
            )}
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

            {/* Step 1: Avatar — BUG-014: visible selected state */}
            {currentStep === 0 && (
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    aria-pressed={selectedAvatar === emoji}
                    className={`aspect-square rounded-3xl text-5xl flex items-center justify-center transition-all focus:outline-none active:scale-95 relative ${
                      selectedAvatar === emoji
                        ? 'bg-brand-yellow scale-105 shadow-lg ring-2 ring-brand-dark ring-offset-2'
                        : 'bg-muted hover:bg-brand-yellow/30 hover:scale-105'
                    }`}
                  >
                    {emoji}
                    {selectedAvatar === emoji && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-dark text-white rounded-full flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Level — BUG-015: visible selected state */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {LEVELS.map((level) => (
                  <button
                    key={level.label}
                    onClick={() => setSelectedLevel(level.label)}
                    aria-pressed={selectedLevel === level.label}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group focus:outline-none ${
                      selectedLevel === level.label
                        ? 'border-brand-dark bg-brand-yellow/10 shadow-sm'
                        : 'border-border hover:border-brand-yellow hover:bg-yellow-50/50'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark">{level.label}</h3>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedLevel === level.label
                        ? 'border-brand-dark bg-brand-dark'
                        : 'border-border group-hover:border-brand-yellow'
                    }`}>
                      {selectedLevel === level.label && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Goals — BUG-016: visible selected state */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {GOALS.map((goal) => (
                  <button
                    key={goal.label}
                    onClick={() => setSelectedGoal(goal.label)}
                    aria-pressed={selectedGoal === goal.label}
                    className={`w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all focus:outline-none ${
                      selectedGoal === goal.label
                        ? 'bg-brand-dark text-white shadow-lg'
                        : 'bg-muted hover:bg-brand-dark hover:text-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      selectedGoal === goal.label ? 'bg-brand-yellow' : 'bg-white'
                    }`}>
                      <goal.icon className={`w-6 h-6 ${selectedGoal === goal.label ? 'text-brand-dark' : 'text-brand-dark'}`} />
                    </div>
                    <span className="font-bold text-lg">{goal.label}</span>
                    {selectedGoal === goal.label && (
                      <Check className="w-5 h-5 ml-auto text-brand-yellow shrink-0" />
                    )}
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
            aria-label="Go to previous step"
          >
            <ArrowLeft className="w-6 h-6 text-brand-dark" />
          </button>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={nextStep}
              className="bg-brand-dark text-white rounded-full px-8 py-3 font-bold flex items-center gap-2 hover:bg-brand-dark/90 transition-transform active:scale-95 shadow-xl shadow-brand-dark/20"
            >
              {currentStep === steps.length - 1 ? 'Start Learning' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
            {/* IMPROVE-013: Skip option */}
            <button
              onClick={() => router.push('/')}
              className="text-xs text-muted-foreground hover:text-brand-dark transition-colors font-medium"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
