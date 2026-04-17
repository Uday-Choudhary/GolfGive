import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  isLoading: boolean
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isLoading: true,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  clear: () => set({ accessToken: null, user: null, isLoading: false }),
}))
