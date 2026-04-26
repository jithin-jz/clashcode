import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../stores/useAuthStore";
import { useFCM } from "./useFCM";
import { useNotificationSocket } from "./useNotificationSocket";

/**
 * Root initialization hook.
 * Handles authentication check and triggers notification services.
 */
export const useInitializeApp = () => {
  const { checkAuth, user, authLoading } = useAuthStore(
    useShallow((s) => ({
      checkAuth: s.checkAuth,
      user: s.user,
      authLoading: s.loading,
    })),
  );

  // Initialize notifications hooks (they handle their own effects internally)
  useFCM(user?.id);
  useNotificationSocket(user?.id);

  useEffect(() => {
    // Initial authentication check
    checkAuth();
  }, [checkAuth]);

  const isInitialized = !authLoading;

  return useMemo(
    () => ({
      isInitialized,
      user,
      loading: authLoading,
    }),
    [isInitialized, user, authLoading],
  );
};
