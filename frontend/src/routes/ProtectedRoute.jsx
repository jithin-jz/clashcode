import { Navigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../stores/useAuthStore";
import { isBoneyard } from "../utils/isBoneyard";

const PageLoader = () => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
  </div>
);

/**
 * ProtectedRoute - Requires authentication
 * Redirects unauthenticated users to landing page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, loading } = useAuthStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      isInitialized: s.isInitialized,
      loading: s.loading,
    })),
  );

  if (!isInitialized || loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated && !isBoneyard()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
