import { useAuth } from '@/hooks/useAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}
