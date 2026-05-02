import React from "react";
import { Link } from "react-router-dom";

/**
 * RenderMessage component
 * Processes text for @mentions and renders them as clickable profile links.
 */
const RenderMessage = ({ text }) => {
  if (!text) return null;

  // 1. Handle explicit Image Sharing format: IMAGE:url|username
  if (text.startsWith("IMAGE:")) {
    const [url, username] = text.slice(6).split("|");
    return (
      <div className="flex flex-col gap-1.5 my-1.5 max-w-full">
        <img
          src={url}
          alt="Shared content"
          className="max-w-full rounded-xl border border-white/10 shadow-2xl cursor-pointer hover:brightness-110 transition-all"
          loading="lazy"
          onClick={() => window.open(url, "_blank")}
        />
        {username && (
          <span className="text-[10px] text-neutral-500 font-medium italic px-1">
            Shared from <span className="text-emerald-400">@{username}</span>
          </span>
        )}
      </div>
    );
  }

  // 2. Fallback: Detect raw image URLs (e.g., Cloudinary links with metadata pipes)
  // This handles the exact format seen in your screenshot: https://...|username
  const isImageUrl =
    text.includes("cloudinary.com") ||
    /\.(jpg|jpeg|png|webp|gif|svg)/i.test(text);

  if (isImageUrl && text.startsWith("http")) {
    const [url, username] = text.split("|");
    return (
      <div className="flex flex-col gap-1.5 my-1.5 max-w-full">
        <img
          src={url}
          alt="Shared image"
          className="max-w-full rounded-xl border border-white/10 shadow-2xl"
          loading="lazy"
        />
        {username && (
          <span className="text-[10px] text-neutral-500 font-medium italic px-1">
            @{username}
          </span>
        )}
      </div>
    );
  }

  const parts = text.split(/(@\w+)/g);
  return (
    <p className="break-words font-medium">
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <Link
            key={i}
            to={`/profile/${part.slice(1)}`}
            className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            {part}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
};

export default RenderMessage;
