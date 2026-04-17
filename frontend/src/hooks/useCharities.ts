import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Charity } from '@/types'

export function useCharities(params?: { search?: string; category?: string; featured?: boolean }) {
  return useQuery<Charity[]>({
    queryKey: ['charities', params],
    queryFn: () => api.get('/charities', { params }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCharity(id: string) {
  return useQuery<Charity>({
    queryKey: ['charity', id],
    queryFn: () => api.get(`/charities/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}
