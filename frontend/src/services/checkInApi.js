import api from "./api";

export const checkInApi = {
  // Perform daily check-in
  checkIn: async () => {
    const response = await api.post("/rewards/check-in/");
    return response.data;
  },

  // Get check-in status
  getCheckInStatus: async () => {
    const response = await api.get("/rewards/check-in/");
    return response.data;
  },
};
