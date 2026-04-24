import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Calendar,
  Trophy,
  Bell,
  ShoppingBag,
  MessageSquare,
  Home,
  Play,
  Gem,
  Shield,
  Award,
} from "lucide-react";
import useNotificationStore from "../../stores/useNotificationStore";

/* ─── Reusable icon button ─── */
const NavBtn = ({
  onClick,
  title,
  children,
  className = "",
  badge = null,
  active = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`
      group relative inline-flex h-8 w-8 shrink-0 items-center justify-center
      rounded-md border transition-all duration-150
      ${
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
      }
      ${className}
    `}
  >
    <span className="inline-flex items-center justify-center">{children}</span>
    {badge}
  </button>
);

const HomeTopNav = ({
  user,
  handleLogout,
  setChatOpen,
  isChatOpen,
  setCheckInOpen,
  setLeaderboardOpen,
  setNotificationOpen,
  hasUnclaimedReward,
  levels: navLevels,
}) => {
  const navigate = useNavigate();
  const userId = user?.id;
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId, fetchNotifications]);

  const xp = user?.profile?.xp || 0;

  return (
    <>
      {/* ── TOP NAV ── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <nav
          className={`
            pointer-events-auto grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center px-7 sm:px-9
            transition-all duration-300 ease-in-out
            ${isScrolled ? "bg-glass-premium border-b border-white/10 h-14" : "app-top-nav"}
          `}
        >
          {/* LEFT */}
          <div className="flex items-center justify-start gap-3 min-w-0">
            {user ? (
              <>
                {/* Mobile: notifications shortcut */}
                <button
                  type="button"
                  onClick={() => setNotificationOpen((p) => !p)}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white sm:hidden"
                >
                  <Bell
                    size={14}
                    className={unreadCount > 0 ? "text-amber-400" : ""}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-black" />
                  )}
                </button>

                {/* XP chip */}
                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  title="Buy Points"
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-white/20
                             bg-white/5 px-2.5 transition-colors hover:bg-white/10 hover:border-white/30"
                >
                  <Gem size={13} className="text-red-500 fill-red-500/20" />
                  <span className="text-white font-semibold text-[11px] tabular-nums font-['Geist_Mono',monospace]">
                    {xp.toLocaleString()}
                  </span>
                </button>

                {/* Desktop: extra actions */}
                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                  {(user?.is_staff || user?.is_superuser) && (
                    <NavBtn
                      onClick={() => navigate("/admin/dashboard")}
                      title="Admin"
                    >
                      <Shield size={14} />
                    </NavBtn>
                  )}
                  <NavBtn
                    onClick={() => setCheckInOpen(true)}
                    title="Daily Check-in"
                    badge={
                      hasUnclaimedReward ? (
                        <span className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-black" />
                      ) : null
                    }
                  >
                    <Calendar size={14} />
                  </NavBtn>
                  <NavBtn
                    onClick={() => navigate("/achievements")}
                    title="Achievements Hall"
                  >
                    <Award size={14} />
                  </NavBtn>
                  <NavBtn onClick={() => navigate("/store")} title="Store">
                    <ShoppingBag size={14} />
                  </NavBtn>
                  <NavBtn
                    onClick={() => {
                      const allChallenges = navLevels || [];
                      const nonCert = allChallenges.filter(
                        (l) => l.slug !== "certificate",
                      );
                      // The current level is the last one that is not LOCKED
                      const current = [...nonCert]
                        .reverse()
                        .find((l) => l.status !== "LOCKED");
                      if (current) {
                        const targetId =
                          current.slug || current.id || current.order;
                        navigate(`/level/${targetId}`);
                      } else if (nonCert.length > 0) {
                        navigate(
                          `/level/${nonCert[0].slug || nonCert[0].id || nonCert[0].order}`,
                        );
                      }
                    }}
                    title="Play"
                    className="!text-emerald-400 !border-emerald-500/20 !bg-emerald-500/5 hover:!bg-emerald-500/10 hover:!border-emerald-500/30"
                  >
                    <Play size={14} fill="currentColor" />
                  </NavBtn>
                </div>
              </>
            ) : null}
          </div>

          {/* CENTER: Text wordmark */}
          <div className="flex items-center justify-center px-2">
            <button
              type="button"
              onClick={() => navigate(user ? "/home" : "/")}
              className="group overflow-hidden"
              title="Home"
            >
              <span className="text-[11px] sm:text-[11px] font-bold tracking-[0.2em] text-white hover:text-neutral-300 transition-colors uppercase font-['Geist_Mono',monospace] truncate block max-w-[140px] sm:max-w-none">
                CLASHCODE
              </span>
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3">
            {user ? (
              <>
                {/* Mobile Hall shortcut */}
                <button
                  type="button"
                  onClick={() => navigate("/achievements")}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white sm:hidden"
                >
                  <Award size={14} />
                </button>

                {/* Mobile Check-in shortcut */}
                <button
                  type="button"
                  onClick={() => setCheckInOpen(true)}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white sm:hidden"
                >
                  <Calendar size={14} />
                  {hasUnclaimedReward && (
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-black" />
                  )}
                </button>

                {/* Mobile chat toggle */}
                <button
                  type="button"
                  onClick={() => setChatOpen((p) => !p)}
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors sm:hidden ${
                    isChatOpen
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <MessageSquare
                    size={14}
                    strokeWidth={isChatOpen ? 2.5 : 1.75}
                  />
                </button>

                <div className="hidden sm:flex items-center gap-1.5">
                  <NavBtn
                    onClick={() => setChatOpen((p) => !p)}
                    title="Chat"
                    active={isChatOpen}
                  >
                    <MessageSquare size={14} />
                  </NavBtn>
                  <NavBtn
                    onClick={() => setLeaderboardOpen((p) => !p)}
                    title="Leaderboard"
                  >
                    <Trophy size={14} />
                  </NavBtn>
                  <NavBtn
                    onClick={() => {
                      if (Notification.permission === "default") {
                        useNotificationStore.getState().requestPermission();
                      }
                      setNotificationOpen((p) => !p);
                    }}
                    title="Notifications"
                    className={unreadCount > 0 ? "!text-amber-400" : ""}
                    badge={
                      unreadCount > 0 ? (
                        <span className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-black" />
                      ) : null
                    }
                  >
                    <Bell size={14} />
                  </NavBtn>

                  <div className="mx-1.5 h-4 w-px bg-white/10" />

                  {/* Avatar */}
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    title="Profile"
                    className="h-8 w-8 rounded-md overflow-hidden border border-white/20 hover:border-white/30 transition-all shrink-0 bg-white/5"
                  >
                    {user?.profile?.avatar_url ? (
                      <img
                        src={user.profile.avatar_url}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1c1c1c]">
                        <User size={12} className="text-neutral-600" />
                      </div>
                    )}
                  </button>

                  <NavBtn
                    onClick={handleLogout}
                    title="Logout"
                    className="!text-white/40 hover:!text-red-400 !border-white/5"
                  >
                    <LogOut size={13} />
                  </NavBtn>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="h-7 rounded-md bg-white px-3.5 text-[11px] font-semibold text-[#0a0a0a]
                           transition-colors hover:bg-neutral-200"
              >
                Sign in
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {user && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
          <div className="absolute left-0 right-0 top-0 h-px bg-white/5" />
          <div className="bg-black px-5 sm:px-9 pb-safe">
            <div className="flex items-center justify-around h-16">
              {[
                { Icon: Home, label: "Home", action: () => navigate("/home") },
                {
                  Icon: Trophy,
                  label: "Ranks",
                  action: () => setLeaderboardOpen((p) => !p),
                },
                {
                  Icon: Play,
                  label: "Play",
                  action: () => {
                    const allChallenges = navLevels || [];
                    const nonCert = allChallenges.filter(
                      (l) => l.slug !== "certificate",
                    );
                    const current = [...nonCert]
                      .reverse()
                      .find((l) => l.status !== "LOCKED");
                    if (current) {
                      const targetId =
                        current.slug || current.id || current.order;
                      navigate(`/level/${targetId}`);
                    } else if (nonCert.length > 0) {
                      navigate(
                        `/level/${nonCert[0].slug || nonCert[0].id || nonCert[0].order}`,
                      );
                    }
                  },
                },
                {
                  Icon: ShoppingBag,
                  label: "Store",
                  action: () => navigate("/store"),
                },
              ].map((item) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    title={item.label}
                    className="flex flex-col items-center gap-0.5 h-10 w-12 justify-center rounded-lg
                               text-white/80 hover:text-white transition-colors"
                  >
                    <Icon size={20} strokeWidth={1.8} />
                    <span className="text-[9px] font-mono tracking-wide uppercase">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              {(user?.is_staff || user?.is_superuser) && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  title="Admin"
                  className="flex flex-col items-center gap-0.5 h-10 w-12 justify-center rounded-lg
                             text-white/80 hover:text-white transition-colors"
                >
                  <Shield size={20} strokeWidth={1.8} />
                  <span className="text-[9px] font-mono tracking-wide uppercase">
                    Admin
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/profile")}
                title="Profile"
                className="flex flex-col items-center gap-0.5 h-10 w-12 justify-center rounded-lg
                           text-white/80 hover:text-white transition-colors"
              >
                {user?.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt="profile"
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-[#333]"
                  />
                ) : (
                  <User size={18} strokeWidth={1.6} />
                )}
                <span className="text-[9px] font-mono tracking-wide uppercase">
                  You
                </span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default HomeTopNav;
