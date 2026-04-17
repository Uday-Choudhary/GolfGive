import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Draw } from '@/types'

export function useDraws() {
  return useQuery<Draw[]>({
    queryKey: ['draws'],
    queryFn: () => api.get('/draws').then((r) => r.data),
  })
}

export function useCurrentDraw() {
  return useQuery<Draw | null>({
    queryKey: ['draws', 'current'],
    queryFn: () => api.get('/draws/current').then((r) => r.data),
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

export function useDraw(id: string) {
  return useQuery<Draw>({
    queryKey: ['draws', id],
    queryFn: () => api.get(`/draws/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}
