import React, { useState, useEffect } from "react";
import { postsAPI } from "../services/api";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Heart, MoreHorizontal, Share2 } from "lucide-react";
import { notify } from "../services/notification";
import useAuthStore from "../stores/useAuthStore";
import useChatStore from "../stores/useChatStore"; // Added useChatStore
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";

const PostGrid = ({ username, refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [editCaption, setEditCaption] = useState("");

  const { user: currentUser } = useAuthStore();
  const { sendMessage } = useChatStore(); // Chat store
  const [searchParams, setSearchParams] = useSearchParams(); // URL params

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postsAPI.getUserPosts(username);
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [username, refreshTrigger]);

  // Deep Linking: Open post from URL
  useEffect(() => {
    const postId = searchParams.get("post");
    if (postId && posts.length > 0) {
      const post = posts.find((p) => p.id === parseInt(postId));
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [searchParams, posts]);

  // Sync selectedPost closing with URL cleanup
  useEffect(() => {
    if (!selectedPost) {
      // Remove post param if present
      if (searchParams.get("post")) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("post");
        setSearchParams(newParams);
      }
      setIsOptionsOpen(false);
      setIsDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      setIsEditing(false);
      setEditCaption("");
    }
  }, [selectedPost, searchParams, setSearchParams]);

  const handleShareToChat = () => {
    if (!selectedPost) return;
    const message = `IMAGE:${selectedPost.image_url}|${selectedPost.user.username}`;
    sendMessage(message);
    notify.success("Image shared to Global Chat!");
  };

  const handleLike = async (post) => {
    if (!currentUser) return;

    // Optimistic update
    const isLiked = post.is_liked;
    const newLikeCount = isLiked ? post.likes_count - 1 : post.likes_count + 1;

    // Update local state for grid
    const updatePostState = (p) =>
      p.id === post.id
        ? { ...p, is_liked: !isLiked, likes_count: newLikeCount }
        : p;
    setPosts((prev) => prev.map(updatePostState));

    // Update selected post if open
    if (selectedPost && selectedPost.id === post.id) {
      setSelectedPost((prev) => ({
        ...prev,
        is_liked: !isLiked,
        likes_count: newLikeCount,
      }));
    }

    try {
      await postsAPI.toggleLike(post.id);
    } catch {
      // Revert on error
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      if (selectedPost && selectedPost.id === post.id) setSelectedPost(post);
      notify.error("Failed to like post");
    }
  };

  const confirmDelete = async (postId) => {
    if (!postId) return;
    setIsDeleting(true);
    try {
      await postsAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setIsDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      setSelectedPost(null);
      notify.success("Post deleted");
    } catch (error) {
      notify.error(error?.response?.data?.detail || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (postId) => {
    setPendingDeleteId(postId);
    setIsDeleteConfirmOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPost?.id) return;
    setIsUpdating(true);
    try {
      await postsAPI.updatePost(selectedPost.id, { caption: editCaption });

      // Update local state
      const updatedPost = { ...selectedPost, caption: editCaption };
      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? updatedPost : p)),
      );
      setSelectedPost(updatedPost);

      setIsEditing(false);
      notify.success("Post updated");
    } catch (error) {
      notify.error(error?.response?.data?.detail || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square bg-zinc-900 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-zinc-700" />
        </div>
        <h3 className="text-white font-medium mb-1">No posts yet</h3>
        <p className="text-zinc-500 text-sm">
          Photos shared by {username} will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-4 mt-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group relative aspect-square bg-zinc-900 cursor-pointer overflow-hidden rounded-md"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.image_url}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
              <button
                className="flex items-center gap-1 hover:scale-110 transition-transform active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(post);
                }}
              >
                <Heart
                  className={
                    post.is_liked
                      ? "fill-red-500 text-red-500"
                      : "fill-white text-white"
                  }
                  size={20}
                />
                <span className="font-bold">{post.likes_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Viewer Modal */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="bg-zinc-950 border border-white/10 p-0 text-white max-w-5xl w-full h-[85vh] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden rounded-xl">
          {/* Image Section */}
          <div className="w-full md:flex-1 bg-black flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 bg-zinc-900/50 min-h-[300px] shrink-0 md:shrink">
            {selectedPost && (
              <img
                src={selectedPost.image_url}
                alt="Post"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col w-full md:w-[400px] h-auto md:h-full bg-zinc-950 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 ring-1 ring-white/10">
                  <AvatarImage src={selectedPost?.user?.avatar_url} />
                  <AvatarFallback>
                    {selectedPost?.user?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm hover:underline cursor-pointer">
                    {selectedPost?.user?.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pr-12">
                {currentUser?.username === selectedPost?.user?.username && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setIsOptionsOpen(true)}
                  >
                    <MoreHorizontal size={20} />
                  </Button>
                )}
              </div>
            </div>

            {/* Caption Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedPost && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 hidden sm:block shrink-0">
                    <AvatarImage src={selectedPost?.user?.avatar_url} />
                    <AvatarFallback>
                      {selectedPost?.user?.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm w-full">
                    <span className="font-semibold mr-2">
                      {selectedPost?.user?.username}
                    </span>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-zinc-700 text-sm text-white"
                          placeholder="Update caption..."
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditCaption(selectedPost.caption || "");
                              setIsEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleUpdate}
                            disabled={isUpdating}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {selectedPost.caption}
                      </span>
                    )}
                    <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wide">
                      {formatDistanceToNow(new Date(selectedPost.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-4 border-t border-white/5 bg-zinc-950 shrink-0 space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(selectedPost)}
                  className={`transition-colors hover:scale-110 active:scale-95 ${selectedPost?.is_liked ? "text-red-500" : "text-white hover:text-zinc-300"}`}
                >
                  <Heart
                    size={26}
                    className={selectedPost?.is_liked ? "fill-current" : ""}
                  />
                </button>
                <button
                  onClick={handleShareToChat}
                  className="text-white hover:text-zinc-300"
                >
                  <Share2 size={26} />
                </button>
              </div>
              <div className="font-semibold text-sm block">
                {selectedPost?.likes_count} likes
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Options Dialog (Instagram Style) */}
      <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
        <DialogContent
          showClose={false}
          className="bg-zinc-900 border border-white/10 p-0 text-white sm:max-w-[400px] gap-0 overflow-hidden rounded-xl"
        >
          <div className="flex flex-col">
            <button
              onClick={() => {
                handleDelete(selectedPost.id);
                setIsOptionsOpen(false);
              }}
              className="w-full p-3 text-center text-red-500 font-bold border-b border-white/10 hover:bg-white/5 transition-colors text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setEditCaption(selectedPost.caption);
                setIsEditing(true);
                setIsOptionsOpen(false);
              }}
              className="w-full p-3 text-center text-white border-b border-white/10 hover:bg-white/5 transition-colors text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => setIsOptionsOpen(false)}
              className="w-full p-3 text-center text-white hover:bg-white/5 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent
          showClose={false}
          className="bg-zinc-900 border border-white/10 text-white sm:max-w-[420px] rounded-xl"
        >
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Delete Post</h3>
            <p className="text-sm text-zinc-400">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setPendingDeleteId(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete(pendingDeleteId)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostGrid;
