import { useState, useEffect, useMemo } from "react";
import { achievementsApi } from "../services/achievementsApi";

export const useAchievements = (user) => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [allRes, userRes] = await Promise.all([
          achievementsApi.getAllAchievements(),
          achievementsApi.getUserAchievements(user.username),
        ]);
        setAchievements(allRes || []);
        setUserAchievements(userRes || []);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setTimeout(() => setLoading(false), 500); // Small smooth delay
      }
    };
    fetchData();
  }, [user]);

  const filteredAchievements = useMemo(() => {
    if (activeTab === "all") return achievements;
    return achievements.filter((a) => a.category === activeTab);
  }, [achievements, activeTab]);

  const isUnlocked = (achievementId) => {
    return userAchievements.some((ua) => ua.achievement.id === achievementId);
  };

  return {
    achievements,
    userAchievements,
    loading,
    activeTab,
    setActiveTab,
    filteredAchievements,
    isUnlocked,
  };
};
