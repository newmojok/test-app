import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '@/services/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
