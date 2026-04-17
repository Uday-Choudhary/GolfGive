import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { useNavigate } from 'react-router-dom'
import { LoginFormData, RegisterFormData } from '@/types'

export function useAuth() {
  const { setAccessToken, setUser, clear } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const login = useMutation({
    mutationFn: (data: LoginFormData) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard')
    },
  })

  const register = useMutation({
    mutationFn: (data: RegisterFormData) => api.post('/auth/register', data),
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken)
      setUser(data.user)
      navigate('/pricing')
    },
  })

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clear()
      queryClient.clear()
      navigate('/')
    },
  })

  return { login, register, logout }
}
