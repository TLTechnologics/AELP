import { useQuery } from '@tanstack/react-query';
import { progressService } from '@/services/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await progressService.getDashboard();
      return data;
    }
  });
}
