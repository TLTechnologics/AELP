import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';

const fallbackDashboard = {
  student_name: 'Student',
  profile_stage: 1,
  profile_completeness: 0,
  overall_progress: 0,
  average_score: 0,
  completed_assessments: 0,
  latest_cefr_level: 'A1',
  recent_activity: [],
  recommended_lessons: [],
  weak_skills: [],
  achievements: [],
  notifications: [],
};

export function useDashboard() {
  // Check if we are on a teacher page — teacher accounts have no student profile,
  // so calling /api/dashboard/ (which requires student auth) returns 401 and
  // cascades into fallback dummy data on all other queries.
  const isTeacherPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/teacher');
  const isTeacherUser = typeof window !== 'undefined' && localStorage.getItem('userRole') === 'teacher';

  return useQuery({
    queryKey: ['dashboard'],
    enabled: !isTeacherPage && !isTeacherUser,
    queryFn: async () => {
      try {
        const { data } = await dashboardService.getDashboard();
        return data;
      } catch (err) {
        console.warn('Backend unavailable for dashboard, using fallback data.');
        return fallbackDashboard;
      }
    }
  });
}
