import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Score, ScoreFormData } from '@/types'

export function useScores() {
  return useQuery<Score[]>({
    queryKey: ['scores'],
    queryFn: () => api.get('/scores').then((r) => r.data),
  })
}

export function useAddScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ScoreFormData) => api.post('/scores', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scores'] }),
  })
}

export function useUpdateScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScoreFormData }) => api.put(`/scores/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scores'] }),
  })
}

export function useDeleteScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/scores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scores'] }),
  })
}
