import { useState, useEffect, memo } from "react";
import { checkInApi } from "../../services/checkInApi";
import useUserStore from "../../stores/useUserStore";
import useAuthStore from "../../stores/useAuthStore";
import { Calendar, X, Sparkles, Flame, Snowflake } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

// Subcomponents
import StreakStats from "../components/StreakStats";
import DayGrid from "../components/DayGrid";

const DailyCheckInModal = ({ isOpen, onClose, onClaim }) => {
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const { fetchCurrentUser } = useUserStore();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadCheckInStatus();
    }
  }, [isOpen]);

  const loadCheckInStatus = async () => {
    setLoading(true);
    try {
      const data = await checkInApi.getCheckInStatus();
      setCheckInStatus(data);
    } catch (error) {
      console.error("Failed to load check-in status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (day) => {
    const nextDay = checkInStatus?.checked_in_today
      ? checkInStatus.current_streak + 1
      : (checkInStatus?.current_streak || 0) + 1;

    if (day !== nextDay || checkInStatus?.checked_in_today) return;

    setCheckingIn(true);
    try {
      const data = await checkInApi.checkIn();
      setCheckInStatus({
        ...checkInStatus,
        checked_in_today: true,
        current_streak: data.streak_day,
        today_checkin: data.check_in,
        freezes_left: data.freezes_left,
      });

      if (user?.profile && typeof data.xp_earned === "number") {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            xp: (user.profile.xp || 0) + data.xp_earned,
          },
        });
      }

      if (fetchCurrentUser) {
        void fetchCurrentUser().catch(() => {});
      }
      if (onClaim) onClaim();

      if (data.streak_saved) {
        toast.info(`Streak Saved!`, {
          description: `Used 1 Freeze. ${data.freezes_left} remains.`,
          icon: <Snowflake className="text-blue-400" size={18} />,
        });
      } else {
        toast.success(`Day ${data.streak_day} Claimed!`, {
          description: `+${data.xp_earned} added to your core.`,
          icon: <Sparkles className="text-primary" size={18} />,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Transmission failed");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-32px)] sm:max-w-[620px] bg-black border border-white/20 text-white shadow-2xl p-0 overflow-hidden rounded-xl"
        showClose={false}
      >
        <div className="relative p-5 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-xl font-bold tracking-tight text-white font-['Geist_Sans',sans-serif]">
                Daily Rewards
              </DialogTitle>
              <p className="text-[10px] text-white/50 font-mono uppercase tracking-[0.2em]">
                Synchronization Terminal
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/10"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <StreakStats checkInStatus={checkInStatus} />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-7 gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-lg bg-white/[0.01] border border-white/[0.03] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <DayGrid
                  checkInStatus={checkInStatus}
                  handleCheckIn={handleCheckIn}
                  checkingIn={checkingIn}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DailyCheckInModal);
