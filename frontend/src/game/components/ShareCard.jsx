import React, { useRef, useState } from "react";
import { Share2, Copy, X, Trophy, Zap, Star } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const ShareCard = ({
  isOpen,
  onClose,
  challengeTitle,
  stars = 0,
  timeSeconds = 0,
  xpEarned = 0,
  username,
}) => {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}m ${secs}s`;
  };

  const shareText = `🏆 I just solved "${challengeTitle}" on CLASHCODE!\n⭐ ${stars}/3 stars | ⏱ ${formatTime(timeSeconds)} | 💎 +${xpEarned} XP\n\nThink you can beat my time? 👉 https://clashcode.jithin.site`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CLASHCODE — ${challengeTitle}`,
          text: shareText,
        });
      } catch {
        handleCopyShare();
      }
    } else {
      handleCopyShare();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            {/* The Share Card */}
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-[#0a0a0a] via-[#0f1a15] to-[#0a0a0a] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,175,155,0.15)]"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Trophy size={12} />
                  Challenge Complete
                </div>
                <h3 className="text-lg font-bold text-white">
                  {challengeTitle}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">by @{username}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-neutral-700"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                    Stars
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-lg font-bold text-white mb-0.5">
                    {formatTime(timeSeconds)}
                  </p>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                    Time
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-lg font-bold text-emerald-400 mb-0.5">
                    +{xpEarned}
                  </p>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                    XP
                  </p>
                </div>
              </div>

              {/* Branding Footer */}
              <div className="flex items-center justify-center gap-2 text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
                <Zap size={10} />
                clashcode.jithin.site
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleCopyShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm border border-white/10 hover:bg-[#222] transition-colors"
              >
                <Copy size={16} />
                {copied ? "Copied!" : "Copy Text"}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareCard;
