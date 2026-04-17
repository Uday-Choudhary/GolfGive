import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui/Spinner'
import { useEffect } from 'react'
import api from '@/lib/axios'

export function AdminRoute() {
  const { accessToken, user, isLoading, setAccessToken, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (!accessToken) {
      // Try to restore session via refresh token cookie
      api
        .post('/auth/refresh')
        .then(({ data }) => {
          setAccessToken(data.accessToken)
          return api.get('/auth/me')
        })
        .then(({ data }) => {
          setUser(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!accessToken) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
