import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../stores/useAuthStore";
import useNotificationStore from "../stores/useNotificationStore";

/**
 * Custom hook to initialize authentication and notifications.
 *
 * Performance: Uses useShallow selectors to subscribe only to the
 * specific state slices needed, preventing re-renders from unrelated
 * auth store mutations (e.g. email/otp field changes on the login page).
 */
export const useInitializeApp = () => {
  const { checkAuth, user, authLoading } = useAuthStore(
    useShallow((s) => ({
      checkAuth: s.checkAuth,
      user: s.user,
      authLoading: s.loading,
    })),
  );
  const initNotifications = useNotificationStore((s) => s.initNotifications);
  const authInitRef = useRef(false);
  const notifInitUserIdRef = useRef(null);

  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      notifInitUserIdRef.current = null;
      return;
    }
    if (notifInitUserIdRef.current !== userId) {
      notifInitUserIdRef.current = userId;
      initNotifications();
    }
  }, [user, initNotifications]);

  return { user, authLoading };
};
