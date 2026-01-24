import { useQuery } from '@tanstack/react-query'
import { fetchDebtMaturities, fetchQuarterlyMaturities } from '@/services/api'

export function useDebtMaturities(filters?: {
  geography?: string
  sector?: string
  rating?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ['maturities', filters],
    queryFn: () => fetchDebtMaturities(filters),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export function useQuarterlyMaturities() {
  return useQuery({
    queryKey: ['maturities', 'quarterly'],
    queryFn: fetchQuarterlyMaturities,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
