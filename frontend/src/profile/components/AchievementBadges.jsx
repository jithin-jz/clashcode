import React, { useState, useEffect } from "react";
import {
  Trophy,
  Lock,
  Zap,
  TrendingUp,
  Medal,
  Crown,
  Flame,
  Star,
  Calendar,
  UserPlus,
  Users,
  CheckCircle2,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const ICON_MAP = {
  Zap: Zap,
  TrendingUp: TrendingUp,
  Medal: Medal,
  Crown: Crown,
  Flame: Flame,
  Star: Star,
  Calendar: Calendar,
  UserPlus: UserPlus,
  Users: Users,
  Trophy: Trophy,
};

const CATEGORY_COLORS = {
  challenge: {
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/5",
  },
  streak: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/10",
    text: "text-amber-400",
    glow: "shadow-amber-500/5",
  },
  social: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-blue-500/5",
  },
  special: {
    bg: "bg-purple-500/5",
    border: "border-purple-500/10",
    text: "text-purple-400",
    glow: "shadow-purple-500/5",
  },
};

const AchievementBadges = ({ username }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    if (!username) return;
    const fetchAchievements = async () => {
      try {
        const res = await api.get(`/achievements/user/${username}/`);
        setAchievements(res.data);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-center gap-2 text-neutral-500 uppercase tracking-[0.2em] font-black text-[9px] mb-1 animate-pulse">
          <div className="h-px w-6 bg-white/5" />
          <span>Achievements</span>
          <div className="h-px w-6 bg-white/5" />
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="flex items-center justify-center gap-2 text-neutral-500 uppercase tracking-[0.2em] font-black text-[9px] mb-1">
          <div className="h-px w-6 bg-white/5" />
          <span>Achievements</span>
          <div className="h-px w-6 bg-white/5" />
        </div>
        <div className="flex items-center gap-1.5 text-neutral-700 text-[10px] font-bold uppercase tracking-[0.1em]">
          <Lock size={10} strokeWidth={3} />
          <span>No achievements</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 mb-2">
        <div className="flex items-center justify-center gap-2 text-neutral-500 uppercase tracking-[0.2em] font-black text-[9px] mb-1">
          <div className="h-px w-6 bg-white/5" />
          <span>Achievements</span>
          <div className="h-px w-6 bg-white/5" />
        </div>

        <div className="flex gap-4 flex-wrap justify-center items-center">
          {achievements.map(({ achievement, unlocked_at }) => {
            const colors =
              CATEGORY_COLORS[achievement.category] ||
              CATEGORY_COLORS.challenge;
            const IconComponent = ICON_MAP[achievement.icon] || Trophy;

            return (
              <Motion.button
                key={achievement.slug}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setSelectedAchievement({ ...achievement, unlocked_at })
                }
                className="relative flex items-center justify-center transition-all cursor-pointer group p-1"
                title={achievement.title}
              >
                <div
                  className={`absolute inset-full blur-md opacity-0 group-hover:opacity-40 transition-opacity rounded-full ${colors.bg}`}
                />
                <IconComponent
                  size={15}
                  strokeWidth={2.5}
                  className={`${colors.text} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                />
              </Motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedAchievement && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-[320px] w-full text-center shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]"
            >
              <div className="relative inline-flex mb-6">
                <div
                  className={`absolute inset-0 blur-2xl opacity-20 ${(CATEGORY_COLORS[selectedAchievement.category] || CATEGORY_COLORS.challenge).bg}`}
                />
                {(() => {
                  const colors =
                    CATEGORY_COLORS[selectedAchievement.category] ||
                    CATEGORY_COLORS.challenge;
                  const IconDetail =
                    ICON_MAP[selectedAchievement.icon] || Trophy;

                  return (
                    <div
                      className={`relative w-24 h-24 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
                    >
                      <IconDetail size={40} className={colors.text} />
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                  {selectedAchievement.title}
                </h3>
                <p className="text-[13px] text-neutral-400 leading-relaxed font-medium">
                  {selectedAchievement.description}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                {selectedAchievement.xp_reward > 0 && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                    <Zap size={10} fill="currentColor" />+
                    {selectedAchievement.xp_reward} Reward XP
                  </div>
                )}

                {selectedAchievement.unlocked_at && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <CheckCircle2 size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Earned{" "}
                      {new Date(
                        selectedAchievement.unlocked_at,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="mt-8 w-full py-3 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementBadges;
