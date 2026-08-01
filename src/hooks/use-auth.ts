import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/api';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (requireAuth && !session) {
        router.push('/auth/login');
      } else if (session) {
        try {
          const { data: profile } = await authService.getProfile();
          if (profile.role === 'teacher' && pathname === '/') {
            setLoading(false);
            router.push('/teacher');
            return;
          }
          if (!requireAuth) {
            setLoading(false);
            router.push(profile.role === 'teacher' ? '/teacher' : '/');
            return;
          }
        } catch (e) {
          console.error('Error fetching profile', e);
        }
      }
      setLoading(false);
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

  return { user, loading };
}
