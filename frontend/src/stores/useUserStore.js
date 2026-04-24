import { create } from "zustand";
import { authAPI } from "../services/api";
import useAuthStore from "./useAuthStore";
import useChatStore from "./useChatStore";

const useUserStore = create((set, get) => ({
  // State
  loading: false,
  error: null,
  viewedProfile: null, // For viewing other users' profiles

  // Actions
  setLoading: (loading) => set({ loading }),
  clearError: () => set({ error: null }),

  // Fetch Current User (Syncs with Auth Store)
  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.getCurrentUser();
      // Update useAuthStore as it holds the "current user" session
      useAuthStore.getState().setUser(response.data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.error || "Failed to fetch profile",
      });
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (data, isImageUpdate = false) => {
    set({ loading: true, error: null });
    try {
      let response;
      if (isImageUpdate) {
        // If it's an image update, data should be { type: 'avatar'|'banner', file: File }
        const formData = new FormData();
        formData.append(data.type, data.file);
        response = await authAPI.updateProfile(formData);
      } else {
        // Normal JSON update
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        response = await authAPI.updateProfile(formData);
      }

      // Update Auth Store with new user data
      useAuthStore.getState().setUser(response.data);

      // Force Chat reconnection with fresh auth cookies so identity changes reflect immediately.
      const chatState = useChatStore.getState();
      const wasConnected = chatState.isConnected;
      chatState.disconnect();
      if (wasConnected) {
        setTimeout(() => {
          useChatStore.getState().connect();
        }, 150);
      }

      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set({ loading: false, error: errorMsg });
      throw error;
    }
  },

  // Follow User
  followUser: async (username) => {
    try {
      const response = await authAPI.followUser(username);
      const data = response.data;

      // Update local user's following count in Auth Store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const change = data.is_following ? 1 : -1;
        const currentCount = currentUser.following_count || 0;

        useAuthStore.getState().setUser({
          ...currentUser,
          following_count: Math.max(0, currentCount + change),
        });
      }

      // If we are currently viewing this user's profile, update it too
      const viewedProfile = get().viewedProfile;
      if (viewedProfile && viewedProfile.username === username) {
        set({
          viewedProfile: {
            ...viewedProfile,
            is_following: data.is_following,
            followers_count: data.follower_count,
          },
        });
      }

      return data;
    } catch (error) {
      console.error("Follow action failed:", error);
      throw error;
    }
  },

  // Redeem Referral
  redeemReferral: async (code) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.redeemReferral(code);
      const data = response.data;

      // Update Auth Store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          profile: {
            ...currentUser.profile,
            xp: data.new_total_xp,
            is_referred: true,
          },
        });
      }

      set({ loading: false });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set({ loading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  // View Another User's Profile
  fetchUserProfile: async (username) => {
    set({ loading: true, error: null, viewedProfile: null });
    try {
      const response = await authAPI.getUserProfile(username);
      set({ viewedProfile: response.data, loading: false });
    } catch {
      set({ loading: false, error: "User not found" });
    }
  },
}));

export default useUserStore;
