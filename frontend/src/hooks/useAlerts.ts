import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAlerts, markAlertRead } from '@/services/api'

export function useAlerts(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['alerts', unreadOnly],
    queryFn: () => fetchAlerts(unreadOnly),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  })
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
