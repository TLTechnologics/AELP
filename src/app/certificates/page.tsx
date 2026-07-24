'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { Award, Download, Lock, CheckCircle2 } from 'lucide-react';

const certificates = [
  { 
    id: 1, 
    title: 'AELP Foundation Level', 
    level: 'A2', 
    date: 'March 15, 2026', 
    status: 'unlocked', 
    imageColor: 'from-blue-400 to-indigo-600'
  },
  { 
    id: 2, 
    title: 'Intermediate Mastery', 
    level: 'B1', 
    date: 'July 24, 2026', 
    status: 'unlocked',
    imageColor: 'from-brand-yellow to-orange-500'
  },
  { 
    id: 3, 
    title: 'Advanced Proficiency', 
    level: 'B2', 
    date: null, 
    status: 'locked',
    imageColor: 'from-purple-500 to-pink-600'
  },
  { 
    id: 4, 
    title: 'Expert Fluency', 
    level: 'C1', 
    date: null, 
    status: 'locked',
    imageColor: 'from-emerald-400 to-teal-600'
  },
];

export default function CertificatesPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-heading text-5xl mb-2">Your Certificates</h1>
            <p className="text-muted-foreground font-medium text-lg">Official proof of your English language mastery.</p>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-border/40 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-brand-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Level</p>
              <p className="font-heading text-2xl">B1 Intermediate</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificates.map((cert, i) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-[32px] p-6 border transition-all ${
                cert.status === 'locked' 
                  ? 'border-border/40 opacity-70 grayscale' 
                  : 'border-brand-yellow/50 shadow-xl shadow-brand-yellow/5 hover:scale-[1.02]'
              }`}
            >
              {/* Certificate Graphic */}
              <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${cert.imageColor} relative overflow-hidden flex items-center justify-center mb-6`}>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-50" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-tr-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center text-white text-center">
                  <Award className="w-12 h-12 mb-2 opacity-90" />
                  <span className="font-heading text-4xl drop-shadow-md">{cert.level}</span>
                  <span className="font-bold text-sm tracking-widest uppercase opacity-80 mt-1">Certified</span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-2xl mb-1">{cert.title}</h3>
                  {cert.status === 'unlocked' ? (
                    <p className="text-brand-success font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Achieved {cert.date}
                    </p>
                  ) : (
                    <p className="text-muted-foreground font-bold text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Locked - Reach Level {cert.level}
                    </p>
                  )}
                </div>
                
                {cert.status === 'unlocked' && (
                  <button className="bg-brand-dark text-white p-3 rounded-full hover:bg-brand-dark/90 transition-colors shadow-sm" title="Download PDF">
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
