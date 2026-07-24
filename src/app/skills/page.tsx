'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Headphones, BookOpen, PenTool, Mic, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const skills = [
  { id: 'listening', title: 'Listening', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-100', desc: 'Understand spoken English in various accents and contexts.' },
  { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Comprehend complex texts, articles, and literature.' },
  { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-orange-600', bg: 'bg-orange-100', desc: 'Express your thoughts clearly with proper grammar and structure.' },
  { id: 'speaking', title: 'Speaking', icon: Mic, color: 'text-green-600', bg: 'bg-green-100', desc: 'Converse fluently and confidently in real-world scenarios.' },
];

export default function SkillsHubPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="font-heading text-6xl">Core Skills</h1>
          <p className="text-xl text-muted-foreground font-medium">Focus on specific areas of your English journey. Select a skill to view your mastery and start targeted lessons.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, i) => (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={`/skills/${skill.id}`}
                className="group flex flex-col h-full bg-white rounded-[32px] p-8 shadow-sm border border-border/40 hover:border-brand-dark transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full ${skill.bg} opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${skill.bg} ${skill.color} mb-6 shadow-inner`}>
                    <skill.icon className="w-8 h-8" />
                  </div>
                  
                  <h2 className="font-heading text-4xl mb-3 group-hover:text-brand-yellow transition-colors">{skill.title}</h2>
                  <p className="text-muted-foreground font-medium text-lg mb-8 flex-1">{skill.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-sm tracking-widest uppercase opacity-60">View Dashboard</span>
                    <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
