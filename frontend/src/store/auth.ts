import { create } from 'zustand'
import { User } from '@/types'

const TOKEN_KEY = 'gg_access_token'
const USER_KEY = 'gg_user'

function readSession<T>(key: string): T | null {
  try {
    const v = sessionStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

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
  // Restore from sessionStorage on app start (survives Stripe redirects)
  accessToken: readSession<string>(TOKEN_KEY),
  user: readSession<User>(USER_KEY),
  isLoading: true,
  setAccessToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token))
    set({ accessToken: token })
  },
  setUser: (user) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    set({ accessToken: null, user: null, isLoading: false })
  },
}))

