import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';

export function useDashboard() {
  // Check if we are on a teacher page — teacher accounts have no student profile,
  // so calling /api/dashboard/ (which requires student auth) returns 401 and
  // cascades into fallback dummy data on all other queries.
  const isTeacherPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/teacher');

  return useQuery({
    queryKey: ['dashboard'],
    enabled: !isTeacherPage,
    queryFn: async () => {
      const { data } = await dashboardService.getDashboard();
      return data;
    }
  });
}
