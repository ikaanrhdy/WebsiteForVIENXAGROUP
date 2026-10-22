import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext.jsx'

// role: 'super_admin' | 'user'
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="boot">Memuat…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />
  return children
}
