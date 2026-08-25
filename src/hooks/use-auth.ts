import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/api';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase auth error:", error.message);
        }
        
        setUser(session?.user || null);
        
        if (requireAuth && !session) {
          router.push('/auth/login');
        } else if (session) {
          try {
            const { data: profile } = await authService.getProfile();
            if (profile?.role) {
              setRole(profile.role);
              localStorage.setItem('userRole', profile.role);
            }
            if (profile?.role === 'teacher' && pathname === '/') {
              router.push('/teacher');
              return;
            }
            if (!requireAuth) {
              router.push(profile?.role === 'teacher' ? '/teacher' : '/');
              return;
            }
          } catch (e: any) {
            if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
              console.warn('Backend server waking up from cold start... Retrying profile load in background.');
            } else {
              console.error('Error fetching profile:', e?.message || e);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        if (requireAuth) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (requireAuth && !session) {
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth, router]);

  return { user, role, loading };
}
