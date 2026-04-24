import React from "react";
import { Trophy, CheckCircle2, Lock, Zap } from "lucide-react";
import { motion as Motion } from "framer-motion";

const AchievementCard = ({ achievement, unlocked, idx }) => {
  return (
    <Motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: idx * 0.03 }}
      className="h-full"
    >
      <div
        className={`
        relative h-full flex flex-col p-6 rounded-[2rem] border transition-all duration-500 group overflow-hidden
        ${
          unlocked
            ? "bg-white/[0.03] backdrop-blur-md border-white/10 hover:border-emerald-500/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            : "bg-white/[0.01] border-white/10 opacity-100"
        }
      `}
      >
        {unlocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        )}
        
        {/* Icon & Unlocked state */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div
            className={`
            w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-700 relative overflow-hidden
            ${
              unlocked
                ? "bg-black/60 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                : "bg-white/[0.02] border-white/10 text-white/10"
            }
          `}
          >
            {unlocked && (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent animate-pulse" />
            )}
            <Trophy
              size={26}
              strokeWidth={unlocked ? 2.5 : 1.5}
              className={unlocked ? "drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" : ""}
            />
          </div>

          <div className="shrink-0 pt-1">
            {unlocked ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Lock size={12} className="text-white/20" />
              </div>
            )}
          </div>
        </div>

        {/* Metadata Headlines */}
        <div className="space-y-1.5 mb-8 flex-1 relative z-10">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono transition-colors ${unlocked ? "text-emerald-500/60 group-hover:text-emerald-400" : "text-neutral-600"}`}>
            {achievement.category}
          </p>
          <h3 className={`text-base font-black tracking-tight font-mono ${unlocked ? "text-white" : "text-white/80"}`}>
            {achievement.title}
          </h3>
          <p className={`text-[12px] leading-relaxed line-clamp-2 font-medium ${unlocked ? "text-neutral-400 group-hover:text-neutral-300" : "text-white/40"}`}>
            {achievement.description}
          </p>
        </div>

        {/* Footer / Reward */}
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/[0.05] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Zap size={11} className={unlocked ? "text-emerald-400" : "text-white/10"} />
            </div>
            <span className={`text-xs font-black font-mono tracking-tighter ${unlocked ? "text-emerald-50/90" : "text-white/10"}`}>
              {achievement.xp_reward} <span className="text-[10px] opacity-40">XP</span>
            </span>
          </div>

          {unlocked && (
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black font-mono text-emerald-500 uppercase tracking-[0.2em]">Claimed</span>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

export default AchievementCard;
