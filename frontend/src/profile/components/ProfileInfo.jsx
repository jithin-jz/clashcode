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
    <div className="pt-16 sm:pt-20 pb-6 px-6 text-center">
      <div className="h-2 sm:h-4" />
      <h2 className="text-xl font-bold text-white mb-1 mt-2 sm:mt-4">
        {[profileUser?.first_name, profileUser?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || profileUser?.username}
      </h2>

      {profileUser?.profile?.bio && (
        <p className="text-[13px] text-neutral-400 mt-4 mb-6 max-w-[240px] mx-auto leading-relaxed italic">
          {profileUser.profile.bio}
        </p>
      )}

      {!profileUser?.profile?.bio && <div className="mb-4"></div>}

      <div className="mb-4">
        <AchievementBadges username={profileUser?.username} />
        <button
          onClick={() => navigate("/achievements")}
          className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest mt-2 transition-colors"
        >
          View All Achievements
        </button>
      </div>

      <div className="flex items-center justify-center gap-8 mb-6 border-t border-white/5 pt-4">
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
