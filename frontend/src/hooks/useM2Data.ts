import { useQuery } from '@tanstack/react-query'
import { fetchM2Data, fetchGlobalM2Aggregate } from '@/services/api'
import type { CountryCode } from '@/types'

export function useM2Data(country?: CountryCode) {
  return useQuery({
    queryKey: ['m2', country],
    queryFn: () => fetchM2Data(country),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function useGlobalM2Aggregate() {
  return useQuery({
    queryKey: ['m2', 'aggregate'],
    queryFn: fetchGlobalM2Aggregate,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
