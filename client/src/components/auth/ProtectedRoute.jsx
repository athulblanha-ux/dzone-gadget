import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store';

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !['admin', 'superadmin'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
