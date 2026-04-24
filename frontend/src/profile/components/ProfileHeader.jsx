import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ArrowLeft, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const ProfileHeader = ({
  profileUser,
  isOwnProfile,
  uploadingAvatar,
  uploadingBanner,
  handleImageUpload,
  setIsEditing,
  isEditing,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  return (
    <div className="h-32 bg-[#1a1a1a]/40 relative overflow-hidden rounded-t-xl">
      {profileUser?.profile?.banner_url ? (
        <img
          src={profileUser.profile.banner_url}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-r from-[#1a1a1a] to-[#141414]" />
      )}

      {/* Profile Controls Overlay on Banner */}
      <div className="absolute top-3 px-3 w-full flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all"
          >
            <ArrowLeft size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {isOwnProfile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all"
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-white/80 hover:text-red-400 bg-black/20 hover:bg-red-500/20 backdrop-blur-md rounded-lg transition-all"
              >
                <LogOut size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Avatar (Absolute positioned) */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <Avatar className="w-24 h-24 border-4 border-[#000000]">
          <AvatarImage
            src={profileUser?.profile?.avatar_url}
            alt={profileUser?.username}
          />
          <AvatarFallback className="bg-[#1a1a1a] text-neutral-300 text-2xl">
            {profileUser?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a1a1a] border border-white/15 rounded-full flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {uploadingAvatar ? (
                <div className="w-3.5 h-3.5 rounded-full bg-white/20 animate-pulse" />
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </>
        )}
      </div>

      {/* Banner Upload Trigger for Edit Mode */}
      {isOwnProfile && isEditing && (
        <input
          type="file"
          ref={bannerInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "banner")}
        />
      )}
    </div>
  );
};

export default ProfileHeader;
