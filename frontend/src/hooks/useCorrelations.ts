import { useQuery } from '@tanstack/react-query'
import { fetchCorrelationMatrix } from '@/services/api'

export function useCorrelationMatrix(assets?: string[], lag?: number) {
  return useQuery({
    queryKey: ['correlations', assets, lag],
    queryFn: () => fetchCorrelationMatrix(assets, lag),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
