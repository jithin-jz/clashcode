import { create } from "zustand";
import { notificationsAPI } from "../services/api";
import { notify } from "../services/notification";
import { buildWebSocketUrl } from "../utils/websocketUrl";

/**
 * Centralized notification management.
 * Shared between NotificationDrawer and NotificationDropdown
 * for consistent state and unread count.
 */
const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  lastFetched: null,
  fcmToken: null,
  permission:
    typeof Notification !== "undefined" ? Notification.permission : "default",
  _recentToastMap: new Map(),

  /**
   * Helper to show de-duplicated toast.
   */
  _showToast: (title, body) => {
    if (!title && !body) return;
    const key = `${title}:${body}`;
    const now = Date.now();

    // We use a Map to track the last show time for each unique notification content.
    // This catches simultaneous fire from WS and FCM in the foreground.
    const recent = get()._recentToastMap || new Map();
    const lastTime = recent.get(key);

    // If shown in the last 3 seconds, ignore.
    if (lastTime && now - lastTime < 3000) {
      return;
    }

    recent.set(key, now);
    set({ _recentToastMap: recent });

    // Auto-cleanup stale entries from the map every now and then
    if (recent.size > 50) {
      for (const [k, time] of recent.entries()) {
        if (now - time > 10000) recent.delete(k);
      }
    }

    notify.info(title || "New Notification", {
      description: body,
      duration: 5000,
      icon: (
        <img src="/favicon.png" className="w-5 h-5 rounded-md" alt="logo" />
      ),
    });
    get().scheduleRealtimeSync();
  },

  /**
   * Initialize Real-time Notifications (FCM + WebSocket).
   */
  initNotifications: async () => {
    const { initFCM, connectWS } = get();
    set({ wsShouldReconnect: true });
    await initFCM();
    connectWS();
  },

  /**
   * Establish WebSocket connection for real-time notifications.
   */
  connectWS: () => {
    const state = get();
    if (!state.wsShouldReconnect) return;
    if (state.socket) {
      if (
        state.socket.readyState === WebSocket.OPEN ||
        state.socket.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      state.socket.close();
    }

    const WS_URL = buildWebSocketUrl({
      explicitUrl:
        import.meta.env.VITE_NOTIFICATIONS_WS_URL ||
        import.meta.env.VITE_WS_NOTIFICATIONS_URL,
      apiUrl: import.meta.env.VITE_API_URL,
      defaultPath: "/ws/notifications",
      legacyPaths: ["/notifications", "/ws"],
      label: "Notifications",
    });
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      set({ isWSConnected: true, socket });
      console.info("[Notifications] WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          get()._showToast(data.title, data.body);
        } else if (data.type === "mention") {
          get()._showToast(
            "You were mentioned",
            `@${data.sender} mentioned you in ${data.room}`,
          );
        }
      } catch (err) {
        console.error("[Notifications] Failed to parse socket message", err);
      }
    };

    socket.onclose = () => {
      set({ isWSConnected: false, socket: null });
      if (get().wsShouldReconnect) {
        console.warn("[Notifications] WebSocket closed. Retrying in 5s...");
        setTimeout(() => get().connectWS(), 5000);
      }
    };

    socket.onerror = (error) => {
      console.error("[Notifications] WebSocket error:", error);
      socket.close();
    };
  },

  /**
   * Initialize FCM notifications.
   */
  initFCM: async () => {
    if (typeof Notification === "undefined") {
      console.warn("Notifications are not supported in this browser.");
      return;
    }

    if (Notification.permission === "default") {
      // Avoid duplicate toasts if already shown this session
      if (!get()._promptShown) {
        notify.info("Enable Notifications", {
          description:
            "Stay updated with real-time alerts. Click Allow to enable browser notifications.",
          duration: Infinity, // Stay until interacted with
          action: {
            label: "Allow",
            onClick: () => get().requestPermission(),
          },
          cancel: {
            label: "Not Now",
            onClick: () => {},
          },
        });
        set({ _promptShown: true });
      }
    } else if (Notification.permission === "granted") {
      await get().registerFCM();
    } else {
      console.warn(
        "Notification permission is denied. Real-time updates will not work.",
      );
      // Only show once per session to avoid annoyance
      if (!get()._deniedWarned) {
        notify.error("Notifications Blocked", {
          description:
            "Browser permissions are currently blocked. Please reset them in your address bar.",
          duration: Infinity,
          action: {
            label: "Allow",
            onClick: () => {
              // If it's still denied, give specific guidance
              if (Notification.permission === "denied") {
                notify.warning("Still Blocked", {
                  description:
                    "You must manually click the 🔒 lock icon in the address bar to unblock notifications first.",
                  duration: 8000,
                });
              } else {
                set({ _deniedWarned: false });
                get().initFCM();
              }
            },
          },
          cancel: {
            label: "Not Now",
            onClick: () => {},
          },
        });
        set({ _deniedWarned: true });
      }
    }

    // Listen for foreground messages (only once)
    if (get()._listenerSetup) return;
    set({ _listenerSetup: true });
    try {
      const { onMessageListener } = await import("../services/firebase");
      onMessageListener((payload) => {
        const title =
          payload.notification?.title ||
          payload.data?.title ||
          "New Notification";
        const body =
          payload.notification?.body ||
          payload.data?.body ||
          "You have a new message.";

        if (payload.notification || payload.data) {
          get()._showToast(title, body);
        }
        // Debounced sync keeps badge/list up to date.
        get().scheduleRealtimeSync();
      });
    } catch (error) {
      console.error("Error setting up foreground message listener:", error);
    }
  },

  /**
   * Request notification permission and register token.
   */
  requestPermission: async () => {
    if (typeof Notification === "undefined") return "default";
    try {
      const permission = await Notification.requestPermission();
      set({ permission });
      if (permission === "granted") {
        notify.success("Permission Granted!", {
          description: "Setting up real-time secure channel...",
        });
        await get().registerFCM();
      } else if (permission === "denied") {
        notify.error("Permission Denied", {
          description:
            "You've blocked notifications. Please enable them in site settings.",
        });
      }
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "default";
    }
  },

  /**
   * Register FCM token with backend.
   */
  registerFCM: async () => {
    try {
      const { requestForToken } = await import("../services/firebase");
      const token = await requestForToken();

      if (!token) {
        console.warn(
          "[FCM] No token received from Firebase. Registration aborted.",
        );
        return;
      }

      // Force sync with backend on every login/re-init to be safe
      const response = await notificationsAPI.registerFCMToken({
        token: token,
        device_id: navigator.userAgent,
      });

      set({ fcmToken: token });
      void response;
      // Only show success toast if it's the first time or explicitly needed
      if (token !== get().fcmToken) {
        notify.success("Push notifications active! 🔔");
      }
    } catch (error) {
      console.error("[FCM] Registration error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorDetail = error.message || "Unknown error";
      notify.error("Registration Failed", {
        description: `Could not sync with backend: ${errorDetail}`,
        duration: 8000,
      });
    }
  },

  // Cache duration (2 minutes for real-time feel)
  CACHE_DURATION: 2 * 60 * 1000,

  /**
   * Debounced forced-sync for realtime events.
   */
  scheduleRealtimeSync: (delayMs = 300) => {
    const existing = get()._realtimeSyncTimer;
    if (existing) clearTimeout(existing);

    const timerId = setTimeout(() => {
      set({ _realtimeSyncTimer: null });
      get().fetchNotifications(true);
    }, delayMs);

    set({ _realtimeSyncTimer: timerId });
  },

  /**
   * Fetch all notifications with caching.
   */
  fetchNotifications: async (force = false, options = {}) => {
    const state = get();
    const now = Date.now();
    const page = Math.max(options.page || 1, 1);
    const append = Boolean(options.append && page > 1);
    const pageSize = Math.max(options.pageSize || state.pageSize || 50, 1);

    // De-duplicate concurrent calls from multiple mounted components
    if (state._fetchPromise) {
      return state._fetchPromise;
    }

    // Use cache if valid
    if (
      !force &&
      page === 1 &&
      state.lastFetched &&
      now - state.lastFetched < state.CACHE_DURATION &&
      state.notifications.length > 0
    ) {
      return state.notifications;
    }

    const fetchPromise = (async () => {
      set({
        isLoading: !append,
        isLoadingMore: append,
        error: null,
      });

      try {
        const response = await notificationsAPI.getNotifications({
          page,
          page_size: pageSize,
        });
        const payload = Array.isArray(response.data)
          ? {
              count: response.data.length,
              unread_count: response.data.filter((n) => !n.is_read).length,
              page,
              page_size: pageSize,
              total_pages: 1,
              results: response.data,
            }
          : (response.data ?? {});
        const fetchedNotifications = Array.isArray(payload.results)
          ? payload.results
          : [];
        const notifications = append
          ? [
              ...state.notifications,
              ...fetchedNotifications.filter(
                (nextItem) =>
                  !state.notifications.some(
                    (existing) => existing.id === nextItem.id,
                  ),
              ),
            ]
          : fetchedNotifications;
        const unreadCount =
          typeof payload.unread_count === "number"
            ? payload.unread_count
            : notifications.filter((n) => !n.is_read).length;
        const totalPages = Math.max(
          payload.total_pages ||
            Math.ceil((payload.count || 0) / pageSize) ||
            1,
          1,
        );

        set({
          notifications,
          unreadCount,
          totalCount: payload.count ?? notifications.length,
          currentPage: payload.page || page,
          pageSize: payload.page_size || pageSize,
          totalPages,
          hasMore: (payload.page || page) < totalPages,
          isLoading: false,
          isLoadingMore: false,
          lastFetched: Date.now(),
          error: null,
        });

        return notifications;
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        set({
          isLoading: false,
          isLoadingMore: false,
          error: error.response?.data?.error || "Failed to load notifications",
        });
        return [];
      } finally {
        set({ _fetchPromise: null });
      }
    })();

    set({ _fetchPromise: fetchPromise });
    return fetchPromise;
  },

  loadMoreNotifications: async () => {
    const state = get();
    if (state.isLoading || state.isLoadingMore || !state.hasMore) {
      return state.notifications;
    }

    return get().fetchNotifications(true, {
      page: state.currentPage + 1,
      pageSize: state.pageSize,
      append: true,
    });
  },

  /**
   * Mark a notification as read.
   */
  markAsRead: async (notificationId) => {
    try {
      await notificationsAPI.markRead(notificationId);

      // Update local state
      set((state) => {
        const target = state.notifications.find((n) => n.id === notificationId);
        const updatedNotifications = state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        );

        return {
          notifications: updatedNotifications,
          unreadCount:
            target && !target.is_read
              ? Math.max(state.unreadCount - 1, 0)
              : state.unreadCount,
        };
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllRead();

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
        unreadCount: 0,
      }));

      return { success: true };
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all notifications.
   */
  clearAll: async () => {
    try {
      await notificationsAPI.clearAll();

      set({
        notifications: [],
        unreadCount: 0,
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a new notification (for real-time updates).
   */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      totalCount: state.totalCount + 1,
    }));
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Clear cache and reset state.
   */
  clearCache: () => {
    const { socket, _realtimeSyncTimer } = get();
    if (socket) socket.close();
    if (_realtimeSyncTimer) clearTimeout(_realtimeSyncTimer);

    set({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      currentPage: 1,
      pageSize: 50,
      totalPages: 1,
      hasMore: false,
      lastFetched: null,
      error: null,
      fcmToken: null,
      _deniedWarned: false,
      _promptShown: false,
      _fetchPromise: null,
      _realtimeSyncTimer: null,
      socket: null,
      isWSConnected: false,
      wsShouldReconnect: false,
      isLoadingMore: false,
    });
  },
}));

export default useNotificationStore;
