import { useQuery } from '@tanstack/react-query'
import { fetchCreditImpulse } from '@/services/api'
import type { CountryCode } from '@/types'

export function useCreditImpulse(country?: CountryCode) {
  return useQuery({
    queryKey: ['creditImpulse', country],
    queryFn: () => fetchCreditImpulse(country),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
