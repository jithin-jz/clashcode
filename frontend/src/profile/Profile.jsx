import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

// Components
import CreatePostDialog from "../posts/CreatePostDialog";
import PostGrid from "../posts/PostGrid";
import ContributionGraph from "./components/ContributionGraph";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ReferralSection from "./components/ReferralSection";
import EditProfileForm from "./components/EditProfileForm";
import UserListDialog from "./components/UserListDialog";

// Hooks
import { useProfile } from "../hooks/useProfile";

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const {
    currentUser,
    profileUser,
    isOwnProfile,
    loading,
    userNotFound,
    isEditing,
    setIsEditing,
    suggestedUsers,
    editForm,
    setEditForm,
    uploadingAvatar,
    uploadingBanner,
    savingProfile,
    deleteDialogOpen,
    setDeleteDialogOpen,
    copied,
    referralCodeInput,
    setReferralCodeInput,
    isRedeeming,
    contributionData,
    loadingContributions,
    listType,
    setListType,
    userList,
    listLoading,
    handleImageUpload,
    handleSaveProfile,
    handleFollowToggle,
    handleListFollowToggle,
    handleCopyReferral,
    handleRedeemReferral,
    handleLogout,
    confirmDeleteAccount,
    fetchUserList,
  } = useProfile(username);

  const [createPostOpen, setCreatePostOpen] = React.useState(false);
  const [refreshPosts, setRefreshPosts] = React.useState(0);

  if (userNotFound) {
    return (
      <div className="h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-neutral-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">User Not Found</h1>
          <p className="text-neutral-400 mb-6 text-sm">
            This user may have changed their username or doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/home")}
            className="bg-white text-black hover:bg-zinc-200"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Skeleton name="profile-page" loading={loading}>
      <div className="relative w-full pb-20 sm:pb-0 text-white flex flex-col">
        <main className="relative z-10 flex-1 px-4 sm:px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-4 min-w-0">
                <Card className="bg-[#141414]/70 border-[#404040]/20 overflow-hidden">
                  <ProfileHeader
                    profileUser={profileUser}
                    isOwnProfile={isOwnProfile}
                    uploadingAvatar={uploadingAvatar}
                    uploadingBanner={uploadingBanner}
                    handleImageUpload={handleImageUpload}
                    setIsEditing={setIsEditing}
                    isEditing={isEditing}
                    handleLogout={handleLogout}
                  />
                  <ProfileInfo
                    profileUser={profileUser}
                    isOwnProfile={isOwnProfile}
                    handleFollowToggle={handleFollowToggle}
                    fetchUserList={fetchUserList}
                  />
                </Card>

                {isOwnProfile && (
                  <ReferralSection
                    currentUser={currentUser}
                    copied={copied}
                    handleCopyReferral={handleCopyReferral}
                    referralCodeInput={referralCodeInput}
                    setReferralCodeInput={setReferralCodeInput}
                    handleRedeemReferral={handleRedeemReferral}
                    isRedeeming={isRedeeming}
                  />
                )}
              </div>

              {/* Middle Column */}
              <div className="lg:col-span-2 space-y-4 min-w-0">
                {isEditing && isOwnProfile ? (
                  <EditProfileForm
                    editForm={editForm}
                    setEditForm={setEditForm}
                    uploadingBanner={uploadingBanner}
                    handleImageUpload={handleImageUpload}
                    setDeleteDialogOpen={setDeleteDialogOpen}
                    handleSaveProfile={handleSaveProfile}
                    savingProfile={savingProfile}
                  />
                ) : (
                  <>
                    <ContributionGraph
                      data={contributionData}
                      loading={loadingContributions}
                    />
                    <div className="flex items-center justify-between mb-4 mt-8">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Battle Feed
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-neutral-500 font-mono">
                          {profileUser?.username}
                        </span>
                      </h3>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          onClick={() => setCreatePostOpen(true)}
                          className="bg-white text-black hover:bg-zinc-200 h-8 gap-2 rounded-lg font-bold text-xs"
                        >
                          <Plus size={14} /> New Post
                        </Button>
                      )}
                    </div>
                    <PostGrid
                      username={profileUser?.username}
                      refreshTrigger={refreshPosts}
                    />
                  </>
                )}
              </div>

              {/* Right Column - Suggestions */}
              <div className="lg:col-span-1 space-y-4 hidden lg:block">
                {isOwnProfile && suggestedUsers.length > 0 && (
                  <Card className="bg-[#141414]/70 border-[#404040]/20">
                    <CardHeader className="p-4 border-b border-white/5">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Suggested For You
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {suggestedUsers.slice(0, 5).map((u) => (
                        <div
                          key={u.username}
                          className="flex items-center justify-between gap-3 group cursor-pointer"
                          onClick={() => navigate(`/profile/${u.username}`)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/5 overflow-hidden">
                              <img
                                src={u.profile?.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {u.username}
                              </div>
                              <div className="text-[10px] text-neutral-500 truncate">
                                Suggested for you
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Dialogs */}
        <UserListDialog
          listType={listType}
          setListType={setListType}
          userList={userList}
          listLoading={listLoading}
          handleListFollowToggle={handleListFollowToggle}
          currentUser={currentUser}
        />

        <CreatePostDialog
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          onSuccess={() => setRefreshPosts((prev) => prev + 1)}
        />

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-[#141414] border-[#404040]/30 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-500">Delete Account</DialogTitle>
              <DialogDescription className="text-neutral-400">
                This action is permanent. All your battles, scores, and profile
                data will be purged.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Skeleton>
  );
};

export default Profile;
