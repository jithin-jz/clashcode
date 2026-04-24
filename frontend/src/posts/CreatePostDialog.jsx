import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { ImagePlus, X, ArrowLeft } from "lucide-react";
import { notify } from "../services/notification";
import { postsAPI } from "../services/api";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas is empty");
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
};

const CreatePostDialog = ({
  open,
  onOpenChange,
  onPostCreated,
  // Backward-compatible props used in some call sites.
  isOpen,
  onClose,
}) => {
  const isDialogOpen = typeof open === "boolean" ? open : !!isOpen;
  const handleDialogOpenChange =
    onOpenChange || ((nextOpen) => (nextOpen ? null : onClose?.()));
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // The final blob
  const [preview, setPreview] = useState(null); // For display (object URL)

  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);

      setCroppedImage(croppedBlob);
      setPreview(croppedUrl);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      notify.error("Something went wrong cropping the image");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setCroppedImage(null);
    setIsCropping(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!croppedImage) return;

    setLoading(true);
    const formData = new FormData();
    // Re-create a File object from Blob
    const file = new File([croppedImage], "post.jpg", { type: "image/jpeg" });

    formData.append("image", file);
    formData.append("caption", caption);

    try {
      await postsAPI.createPost(formData);
      notify.success("Post created successfully!");
      onPostCreated?.();
      handleDialogOpenChange(false);
      // Reset state
      handleRemoveImage();
      setCaption("");
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Failed to create post";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showClose={false}
        className="bg-[#111] border border-[#222] text-white sm:max-w-[500px] gap-0 p-0 overflow-hidden rounded-xl"
      >
        <DialogHeader className="h-11 px-4 border-b border-[#1e1e1e] flex flex-row items-center justify-between space-y-0">
          {isCropping ? (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 text-white"
              onClick={() => handleRemoveImage()}
            >
              <ArrowLeft size={20} />
            </Button>
          ) : (
            <div />
          )}
          <DialogTitle className="text-center font-semibold text-base">
            {isCropping ? "Crop" : "Create New Post"}
          </DialogTitle>
          {isCropping ? (
            <Button
              variant="ghost"
              className="text-white font-semibold hover:bg-[#1c1c1c] px-3 text-xs"
              onClick={handleCreateCroppedImage}
            >
              Next
            </Button>
          ) : (
            <div className="w-8" />
          )}
        </DialogHeader>

        <div className="flex flex-col">
          {isCropping ? (
            <div className="relative w-full h-[500px] bg-black">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          ) : !preview ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <ImagePlus className="w-20 h-20 text-white/50" />
              <p className="text-xl font-light">Drag photos and videos here</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-[#0a0a0a] hover:bg-neutral-200 font-semibold px-6 text-sm"
              >
                Select from computer
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="bg-black w-full h-[300px] relative flex items-center justify-center shrink-0">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 border-t border-[#1e1e1e]">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 overflow-hidden">
                    {/* User Avatar Placeholder */}
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full bg-transparent border-none text-sm text-white placeholder-zinc-500 resize-none focus:outline-none min-h-[100px]"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-[#1e1e1e] flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-white text-[#0a0a0a] hover:bg-neutral-200 font-semibold px-8 text-sm"
                >
                  {loading ? "Sharing..." : "Share"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
