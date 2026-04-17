import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

// Public pages
import { Home } from '@/pages/public/Home'
import { Charities } from '@/pages/public/Charities'
import { Pricing } from '@/pages/public/Pricing'

// Auth pages
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'

// Dashboard pages
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { Overview } from '@/pages/dashboard/Overview'
import { MyScores } from '@/pages/dashboard/MyScores'
import { DrawHistory } from '@/pages/dashboard/DrawHistory'
import { MyCharity } from '@/pages/dashboard/MyCharity'
import { Winnings } from '@/pages/dashboard/Winnings'

// Admin pages
import { AdminPanel } from '@/pages/admin/AdminPanel'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminDrawEngine } from '@/pages/admin/AdminDrawEngine'
import { AdminCharities } from '@/pages/admin/AdminCharities'
import { AdminWinners } from '@/pages/admin/AdminWinners'
import { AdminReports } from '@/pages/admin/AdminReports'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'charities', element: <Charities /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
          { index: true, element: <Overview /> },
          { path: 'scores', element: <MyScores /> },
          { path: 'draws', element: <DrawHistory /> },
          { path: 'charity', element: <MyCharity /> },
          { path: 'winnings', element: <Winnings /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminPanel />,
        children: [
          { index: true, element: <AdminReports /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'draws', element: <AdminDrawEngine /> },
          { path: 'charities', element: <AdminCharities /> },
          { path: 'winners', element: <AdminWinners /> },
          { path: 'reports', element: <AdminReports /> },
        ],
      },
    ],
  },
])
