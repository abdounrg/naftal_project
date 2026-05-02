import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const LockedAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="relative max-w-md w-full text-center">
        <div className="absolute inset-0 -z-10 bg-rose-400/10 dark:bg-rose-500/10 blur-3xl rounded-full" />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 mb-5">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Access restricted
        </h1>
        <p className="text-[13.5px] text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          You do not have permission to view this page. Contact an administrator to request access.
        </p>
        <code className="inline-block px-3 py-1 rounded-md text-[11.5px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-6">
          {location.pathname}
        </code>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-[12.5px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canViewRoute } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <LockedAccess />;
  }

  // Routes that any authenticated user can access (no granular permission required).
  const ALWAYS_ALLOWED = ['/home', '/dashboard', '/users/request', '/settings'];

  // Show a Locked screen instead of redirecting away so users understand why.
  if (!ALWAYS_ALLOWED.includes(location.pathname) && !canViewRoute(location.pathname)) {
    return <LockedAccess />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
