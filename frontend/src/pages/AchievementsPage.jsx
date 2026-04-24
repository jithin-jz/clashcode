import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  Users,
  Medal,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "boneyard-js/react";
import useAuthStore from "../stores/useAuthStore";

// Components
import AchievementCard from "../components/AchievementCard";

// Hooks
import { useAchievements } from "../hooks/useAchievements";

const CATEGORIES = [
  { id: "all", label: "All Hall", icon: Trophy },
  { id: "CODING", label: "Coding", icon: Target },
  { id: "COMMUNITY", label: "Community", icon: Users },
  { id: "CONSISTENCY", label: "Consistency", icon: TrendingUp },
  { id: "SPECIAL", label: "Special", icon: Medal },
];

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const {
    achievements,
    userAchievements,
    loading,
    activeTab,
    setActiveTab,
    filteredAchievements,
    isUnlocked,
  } = useAchievements(user);

  return (
    <Skeleton name="achievements-page" loading={loading}>
      <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 pb-24 relative overflow-hidden">
        {/* Vivid Background FX */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,10,10,0.4),#000)]" />
          <div className="absolute top-[5%] right-[-5%] w-[450px] h-[450px] bg-purple-600/10 blur-[130px] rounded-full animate-pulse opacity-40" style={{ animationDuration: "10s" }} />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse opacity-30" style={{ animationDuration: "14s" }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="group relative w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ArrowLeft size={18} className="relative z-10 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <p className="ds-eyebrow mb-0.5">Hall of Fame</p>
                <h1 className="text-lg font-bold tracking-tight text-white uppercase sm:text-2xl">Achievements</h1>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="ds-eyebrow">Trophy Score</p>
                <p className="text-lg font-mono font-bold leading-none">{(userAchievements?.length || 0) * 10}</p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="group relative p-5 flex items-center justify-between gap-5 bg-black/40 backdrop-blur-xl border border-emerald-500/20 rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden transition-all hover:border-emerald-500/40">
              <div className="flex items-start gap-4 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={22} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 font-mono mb-1">Collection</p>
                  <p className="text-sm font-black leading-snug text-neutral-100 uppercase tracking-tight">Honor Roll</p>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-3xl font-black font-mono tracking-tighter text-white">
                  {userAchievements?.length || 0}
                  <span className="text-xs text-neutral-600 ml-1">/{achievements?.length || 0}</span>
                </p>
              </div>
            </div>

            <div className="group relative p-5 flex items-center justify-between gap-5 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden transition-all hover:border-purple-500/40">
              <div className="flex items-start gap-4 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-xl border border-purple-500/20 bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 group-hover:scale-110 transition-transform">
                  <Zap size={22} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/60 font-mono mb-1">Impact</p>
                  <p className="text-sm font-black leading-snug text-neutral-100 uppercase tracking-tight">Total Might</p>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-3xl font-black font-mono tracking-tighter text-white">
                  {(userAchievements?.length || 0) * 10}
                  <span className="text-[10px] text-neutral-600 ml-1 uppercase">XP</span>
                </p>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`
                    group relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all border font-mono whitespace-nowrap overflow-hidden
                    ${isActive
                      ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-105 z-10"
                      : "text-white/40 border-white/5 bg-white/[0.02] hover:text-white hover:border-white/20 hover:bg-white/[0.05]"
                    }
                  `}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 pointer-events-none" />}
                  <Icon size={14} strokeWidth={isActive ? 3 : 2} className={isActive ? "text-emerald-600" : ""} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement, idx) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={isUnlocked(achievement.id)}
                  idx={idx}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Skeleton>
  );
};

export default AchievementsPage;
