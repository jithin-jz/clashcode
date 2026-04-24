import React from "react";
import { useNavigate } from "react-router-dom";
import AchievementBadges from "./AchievementBadges";
import { Button } from "../../components/ui/button";

const ProfileInfo = ({
  profileUser,
  isOwnProfile,
  handleFollowToggle,
  fetchUserList,
}) => {
  const navigate = useNavigate();

  return (
    <div className="pt-2 pb-6 px-6 text-center">
      <h2 className="text-2xl font-black text-white mb-0.5 mt-1 tracking-tighter uppercase italic">
        {[profileUser?.first_name, profileUser?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || profileUser?.username}
      </h2>
      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2">
        @{profileUser?.username}
      </p>

      {profileUser?.profile?.bio && (
        <div className="relative py-2 px-2 mb-1">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent h-[1px] top-0" />
          <p className="text-xs text-neutral-300 max-w-[280px] mx-auto leading-relaxed font-medium">
            {profileUser.profile.bio}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent h-[1px] bottom-0" />
        </div>
      )}

      {!profileUser?.profile?.bio && <div className="mb-2"></div>}

      <div className="mb-2">
        <AchievementBadges username={profileUser?.username} />
        <button
          onClick={() => navigate("/achievements")}
          className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest mt-1 transition-colors"
        >
          View All Achievements
        </button>
      </div>

      <div className="flex items-center justify-center gap-8 mb-4 border-t border-white/5 pt-3">
        <button
          onClick={() => fetchUserList("followers")}
          className="text-center group"
        >
          <div className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors">
            {profileUser?.followers_count || 0}
          </div>
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Followers
          </div>
        </button>
        <button
          onClick={() => fetchUserList("following")}
          className="text-center group"
        >
          <div className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors">
            {profileUser?.following_count || 0}
          </div>
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Following
          </div>
        </button>
      </div>

      {!isOwnProfile && (
        <div className="flex gap-2 w-full mt-4">
          <Button
            onClick={handleFollowToggle}
            className={`flex-1 h-10 font-bold ${
              profileUser?.is_following
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {profileUser?.is_following ? "Following" : "Follow"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
