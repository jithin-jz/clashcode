import React from "react";
import { ArrowLeft, Play } from "lucide-react";

const HeaderBar = ({
  title,
  navigate,
  isPyodideReady,
  isRunning,
  runCode,
  stopCode,
}) => {
  return (
    <div className="h-12 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center justify-between px-3 sm:px-4 shrink-0 z-20 relative">
      {/* Left: Navigation & Title */}
      <div className="flex items-center gap-2 sm:gap-3 relative z-10 min-w-0">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="h-7 w-7 rounded-md border border-[#242424] bg-[#161616] text-neutral-600 hover:text-neutral-200 hover:bg-[#1c1c1c] transition-colors flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={13} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col min-w-0">
            <h1 className="text-[12px] font-semibold text-neutral-200 flex items-center gap-1.5 min-w-0 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
              <span className="truncate uppercase">{title}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2 relative z-10 shrink-0">
        {/* Status Indicator */}
        <div className="flex items-center p-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isPyodideReady
                ? "bg-emerald-500/80"
                : "bg-amber-400 animate-pulse"
            }`}
          />
        </div>

        <div className="w-px h-3 bg-[#242424] mx-0.5" />

        {isRunning ? (
          <button
            type="button"
            onClick={stopCode}
            className="h-8 px-3 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 text-[11px] font-semibold uppercase tracking-wide rounded-md transition-all flex items-center gap-1.5"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={runCode}
            disabled={!isPyodideReady}
            className={`
                h-8 px-4 relative overflow-hidden group rounded-md
                ${
                  isPyodideReady
                    ? "bg-white text-[#0a0a0a] hover:bg-neutral-200 border border-transparent"
                    : "bg-[#1a1a1a] text-neutral-700 cursor-not-allowed border border-[#242424]"
                }
                text-[11px] font-semibold uppercase tracking-wide transition-all flex items-center
              `}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Play
                size={8}
                className="group-hover:scale-110 transition-transform"
                fill="currentColor"
                strokeWidth={3}
              />
              <span>Run</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(HeaderBar);
