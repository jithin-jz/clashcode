import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../stores/useAuthStore";
import useChallengesStore from "../stores/useChallengesStore";
import useChatStore from "../stores/useChatStore";
import {
  HomeTopNav,
  ChatDrawer,
  LeaderboardDrawer,
  NotificationDrawer,
  DailyCheckInModal,
  SiteFooter,
} from "../home";
import { checkInApi } from "../services/checkInApi";

/**
 * MainLayout — Single persistent layout wrapping all authenticated routes.
 *
 * Performance optimisations applied:
 *  1. useShallow selectors on Zustand stores → prevents re-render when
 *     unrelated store slices change (e.g. marketplace mutations).
 *  2. useCallback on every handler → stable references for memoised children.
 *  3. React.memo on the export → avoids parent-triggered re-renders.
 *  4. Memoised hideNav / showFooter flags.
 */
const MainLayout = memo(({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Zustand Selectors (shallow) ----
  const { user, userId, logout } = useAuthStore(
    useShallow((s) => ({ user: s.user, userId: s.user?.id, logout: s.logout })),
  );
  const { apiLevels, fetchChallenges, ensureFreshChallenges } =
    useChallengesStore(
      useShallow((s) => ({
        apiLevels: s.challenges,
        fetchChallenges: s.fetchChallenges,
        ensureFreshChallenges: s.ensureFreshChallenges,
      })),
    );

  // ---- Local UI State ----
  // ---- Zustand Chat State ----
  const { isChatOpen, setChatOpen } = useChatStore(
    useShallow((s) => ({
      isChatOpen: s.isChatOpen,
      setChatOpen: s.setChatOpen,
    })),
  );

  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);

  // ---- Derived state (memoised) ----
  const hideNav = useMemo(
    () =>
      location.pathname.startsWith("/level/") ||
      location.pathname.startsWith("/admin/"),
    [location.pathname],
  );
  const showFooter = useMemo(() => {
    const footerPaths = [
      "/",
      "/home",
      "/profile",
      "/marketplace",
      "/store",
      "/buy-xp",
      "/shop",
      "/game",
    ];
    const isProfilePath = location.pathname.startsWith("/profile/");
    return footerPaths.includes(location.pathname) || isProfilePath;
  }, [location.pathname]);

  // ---- Data Fetching ----
  useEffect(() => {
    if (userId) fetchChallenges();
  }, [userId, fetchChallenges]);

  useEffect(() => {
    if (!userId) return undefined;

    const refreshIfNeeded = () => {
      ensureFreshChallenges(20000);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
    };

    window.addEventListener("focus", refreshIfNeeded);
    document.addEventListener("visibilitychange", onVisible);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
    }, 30000);

    return () => {
      window.removeEventListener("focus", refreshIfNeeded);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(intervalId);
    };
  }, [userId, ensureFreshChallenges]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await checkInApi.getCheckInStatus();
        if (!cancelled) setHasUnclaimedReward(!data.checked_in_today);
      } catch (error) {
        console.error("Failed to check reward status:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ---- Stable Callbacks ----
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const handleCloseNotification = useCallback(
    () => setNotificationOpen(false),
    [],
  );
  const handleCloseCheckIn = useCallback(() => setCheckInOpen(false), []);
  const handleClaimReward = useCallback(() => setHasUnclaimedReward(false), []);

  // ---- Keyboard Shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = typeof e?.key === "string" ? e.key.toLowerCase() : "";
      if (!key) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (key) {
        case "b":
          e.preventDefault();
          setChatOpen((prev) => !prev);
          break;
        case "l":
          e.preventDefault();
          setLeaderboardOpen((prev) => !prev);
          break;
        case "p":
          e.preventDefault();
          if (user) navigate("/profile");
          break;
        case "x":
          e.preventDefault();
          if (user) navigate("/shop");
          break;
        case "s":
          e.preventDefault();
          if (user) navigate("/store");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, navigate, setChatOpen]);

  // ---- Early exit for gameplay screens ----
  if (hideNav) return children;

  return (
    <div className="relative min-h-full bg-black text-foreground selection:bg-primary/20 ds-spotlight">
      {/* Global pure-black background with subtle texture */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black app-grid-overlay opacity-[0.03]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_100%)]" />

      <div className="relative z-10 flex min-h-full flex-col">
        <HomeTopNav
          user={user}
          levels={apiLevels}
          handleLogout={handleLogout}
          setChatOpen={setChatOpen}
          isChatOpen={isChatOpen}
          setCheckInOpen={setCheckInOpen}
          setLeaderboardOpen={setLeaderboardOpen}
          setNotificationOpen={setNotificationOpen}
          hasUnclaimedReward={hasUnclaimedReward}
        />

        <ChatDrawer isOpen={isChatOpen} setOpen={setChatOpen} user={user} />

        <LeaderboardDrawer
          isLeaderboardOpen={isLeaderboardOpen}
          setLeaderboardOpen={setLeaderboardOpen}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
        />

        <DailyCheckInModal
          isOpen={checkInOpen}
          onClose={handleCloseCheckIn}
          onClaim={handleClaimReward}
        />

        <main className="flex-1 pt-14">{children}</main>

        {showFooter && (
          <div className={user ? "pb-16 sm:pb-0" : ""}>
            <SiteFooter />
          </div>
        )}
      </div>
    </div>
  );
});

MainLayout.displayName = "MainLayout";

export default MainLayout;
