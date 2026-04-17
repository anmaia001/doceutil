import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const { isAuthenticated, loading, checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}
