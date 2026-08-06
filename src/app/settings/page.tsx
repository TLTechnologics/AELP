'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Bell, Moon, LogOut, Camera, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: Camera, label: 'Change Profile Picture', onClick: () => alert('Upload feature coming soon') },
        { icon: Mail, label: 'Change Email Address', value: user?.email || 'student@example.com', onClick: () => alert('Email change coming soon') },
        { icon: Lock, label: 'Change Password', onClick: () => alert('Password reset coming soon') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notification Preferences', value: 'Enabled', onClick: () => alert('Notifications settings coming soon') },
        { icon: Moon, label: 'Theme (Future Ready)', value: 'Light', onClick: () => alert('Dark mode coming in v2.0') },
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <div>
          <h2 className="text-xl text-muted-foreground font-medium mb-1">Preferences</h2>
          <h1 className="text-5xl md:text-6xl font-heading uppercase">
            Account <span className="highlight-yellow inline-block px-2">Settings</span>
          </h1>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-[32px] p-2 shadow-sm border border-border/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 bg-slate-50/50 rounded-t-[30px]">
                <h3 className="font-heading text-xl text-slate-800">{section.title}</h3>
              </div>
              <div className="divide-y divide-border/20">
                {section.items.map((item, j) => (
                  <button 
                    key={j}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 text-brand-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.value && <span className="text-sm font-bold text-muted-foreground hidden sm:block">{item.value}</span>}
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-dark transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="font-heading text-xl text-red-600 mb-1">Sign Out</h3>
                <p className="text-sm font-medium text-slate-500">End your current session securely.</p>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
                <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
