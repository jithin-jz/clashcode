import api from "./api";

/**
 * Service for fetching and managing achievements.
 */
export const achievementsApi = {
  /**
   * Get all achievements with current progress/unlock status.
   */
  getAllAchievements: async () => {
    const response = await api.get("/achievements/");
    return response.data;
  },

  /**
   * Get achievements unlocked by a specific user.
   */
  getUserAchievements: async (username) => {
    const response = await api.get(`/achievements/user/${username}/`);
    return response.data;
  },
};
