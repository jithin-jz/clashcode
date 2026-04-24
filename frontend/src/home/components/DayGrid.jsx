import React, { memo } from "react";
import { Check, Gem } from "lucide-react";
import { cn } from "../../lib/utils";

const DAILY_REWARDS = {
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
  6: 30,
  7: 35,
};

const DayGrid = ({ checkInStatus, handleCheckIn, checkingIn }) => {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
        const currentCycleDay = checkInStatus?.cycle_day || 1;
        const isCheckedInToday = checkInStatus?.checked_in_today;

        const isClaimedInHistory = checkInStatus?.recent_checkins?.some(
          (checkin) => checkin.streak_day === day,
        );

        const isCompleted =
          isClaimedInHistory || (day === currentCycleDay && isCheckedInToday);
        const isClaimable = !isCheckedInToday && day === currentCycleDay;

        return (
          <button
            key={day}
            type="button"
            onClick={() =>
              isClaimable && !checkingIn ? handleCheckIn(day) : null
            }
            disabled={!isClaimable || checkingIn}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 py-4 sm:py-8 rounded-lg border transition-all duration-300 group overflow-hidden",
              isCompleted
                ? "bg-black border-emerald-500/40 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]"
                : isClaimable
                  ? "bg-black border-white/60 cursor-pointer shadow-lg active:scale-95"
                  : "bg-black border-white/10 opacity-60 cursor-not-allowed",
              checkingIn && "opacity-50",
            )}
          >
            {/* Glassy overlay for claimable */}
            {isClaimable && (
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            )}

            <div className="flex flex-col items-center gap-1 sm:gap-1.5 transition-all duration-500">
              <span
                className={cn(
                  "text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] font-mono",
                  isCompleted ? "text-emerald-400" : "text-white",
                )}
              >
                {day === 7 ? "ULT" : `D${day}`}
              </span>

              <div className="flex items-center gap-0.5 sm:gap-1.5">
                <span
                  className={cn(
                    "text-sm sm:text-xl font-black tabular-nums tracking-tighter font-mono",
                    isCompleted ? "text-emerald-400" : "text-white",
                  )}
                >
                  {DAILY_REWARDS[day]}
                </span>
                <Gem
                  size={11}
                  className={cn(
                    "text-red-500 fill-red-500/20",
                    isCompleted && "text-emerald-500/50 fill-emerald-500/10",
                  )}
                />
              </div>
            </div>

            {/* Status Beacons */}
            {isClaimable && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse" />
              </div>
            )}

            {isCompleted && (
              <div className="absolute top-2 right-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              </div>
            )}

            {/* Completion indicator line */}
            {isCompleted && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500/30" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default memo(DayGrid);
