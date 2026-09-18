import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';

export default function ProtectedAdminRoute() {
  const { isLoading, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#120d11] text-[#f5eee8] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#d68b8b] border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-[#d68b8b]">Checking session</p>
          <p className="mt-2 text-sm text-white/70">Loading admin access.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}