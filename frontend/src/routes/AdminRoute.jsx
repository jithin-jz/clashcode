import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { isBoneyard } from "../utils/isBoneyard";

const PageLoader = () => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
  </div>
);

/**
 * AdminRoute - For admin-only pages
 * Requires user to be authenticated AND be staff/superuser
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, isInitialized } = useAuthStore();

  if (loading || !isInitialized) {
    return <PageLoader />;
  }

  // Allow Boneyard crawler to pass through
  if (isBoneyard()) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff && !user?.is_superuser) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
