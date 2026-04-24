import React, { memo } from "react";
import { Flame } from "lucide-react";

const StreakStats = ({ checkInStatus }) => {
  const day = checkInStatus?.cycle_day || 1;
  return (
    <div className="relative overflow-hidden px-5 py-4 sm:py-6 rounded-xl bg-black border border-white/20 shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <div className="text-[32px] sm:text-[44px] font-black font-mono leading-none tracking-tighter text-white">
          0{day}
        </div>
      </div>

      <div className="relative flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.25em] font-mono">
            Core Progress
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex items-end gap-3 mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white leading-none tracking-tight font-mono">
              {day}
            </span>
            <span className="text-sm font-bold text-white/40 font-mono">
              / 07
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1 px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Active Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StreakStats);
