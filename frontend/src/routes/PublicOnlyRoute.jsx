import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { isBoneyard } from "../utils/isBoneyard";

const PageLoader = () => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
  </div>
);

/**
 * PublicOnlyRoute - For login/register pages
 * Redirects authenticated users based on role:
 * - Admins → /admin/dashboard
 * - Regular users → /home
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user, loading } = useAuthStore();

  // Wait for auth check to complete before rendering
  if (!isInitialized || loading) {
    return <PageLoader />;
  }

  // Redirect authenticated users away from public pages (unless crawler)
  if (isAuthenticated && !isBoneyard()) {
    if (user?.is_staff || user?.is_superuser) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
