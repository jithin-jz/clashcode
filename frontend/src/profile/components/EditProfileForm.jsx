import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const EditProfileForm = ({
  editForm,
  setEditForm,
  uploadingBanner,
  handleImageUpload,
  setDeleteDialogOpen,
  handleSaveProfile,
  savingProfile,
}) => {
  const bannerInputRef = useRef(null);

  return (
    <Card className="bg-[#141414]/70 border-[#404040]/20">
      <CardHeader className="p-4 border-b border-white/5">
        <CardTitle className="text-sm font-medium">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-neutral-400">First Name</label>
            <input
              type="text"
              value={editForm.first_name}
              onChange={(e) =>
                setEditForm({ ...editForm, first_name: e.target.value })
              }
              className="w-full bg-[#1a1a1a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-neutral-400">Last Name</label>
            <input
              type="text"
              value={editForm.last_name}
              onChange={(e) =>
                setEditForm({ ...editForm, last_name: e.target.value })
              }
              className="w-full bg-[#1a1a1a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-neutral-400">Username</label>
          <input
            type="text"
            value={editForm.username}
            onChange={(e) =>
              setEditForm({ ...editForm, username: e.target.value })
            }
            className="w-full bg-[#1a1a1a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-neutral-400">Bio</label>
          <textarea
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            className="w-full bg-[#1a1a1a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 min-h-[80px] resize-none"
            placeholder="Write something about yourself..."
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-[#1a1a1a]/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Camera size={16} className="text-neutral-400" />
            <span className="text-sm text-neutral-300">Profile Banner</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={uploadingBanner}
            onClick={() => bannerInputRef.current?.click()}
            className="text-xs text-neutral-300 hover:text-white"
          >
            {uploadingBanner ? "Saving..." : "Change"}
          </Button>
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "banner")}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs"
          >
            Delete Account
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-white text-black hover:bg-zinc-200 h-9 px-6 font-bold"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
