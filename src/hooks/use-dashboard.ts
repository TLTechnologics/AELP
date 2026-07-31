import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await dashboardService.getDashboard();
      return data;
    }
  });
}
