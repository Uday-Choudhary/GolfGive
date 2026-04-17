import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { accessToken, isLoading, setAccessToken, setUser, setLoading } = useAuthStore()

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

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
