import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "../../lib/utils";
import { getDifficultyMeta } from "../../utils/challengeMeta";
import { Gem } from "lucide-react";

const ProblemPane = ({ challenge, loading }) => {
  const derived = useMemo(() => {
    if (!challenge) return null;

    const difficulty = getDifficultyMeta(challenge.order);

    return {
      difficulty,
      targetMinutes: Math.max(1, Math.ceil((challenge.time_limit || 300) / 60)),
    };
  }, [challenge]);

  if (loading || !challenge || !derived) {
    return (
      <div className="flex-1 bg-black flex flex-col animate-pulse">
        <div className="p-5 border-b border-white/5 bg-black space-y-2">
          <div className="h-4 w-40 bg-white/10 rounded-md" />
          <div className="h-3 w-56 bg-white/5 rounded-md" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 w-36 bg-white/10 rounded-md" />
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-5/6 bg-white/5 rounded-md" />
          <div className="h-3 w-4/6 bg-white/5 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 min-h-0 flex flex-col bg-black">
      <div className="p-4 border-b border-white/5 bg-black">
        <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.15em] font-mono leading-none">
          {challenge.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 uppercase tracking-widest font-mono">
            Python
          </span>
          <span
            className={cn(
              "text-[9px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest font-mono",
              derived.difficulty.pill,
            )}
          >
            {derived.difficulty.label}
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-neutral-500 uppercase tracking-widest font-mono">
            {challenge.xp_reward}
            <Gem size={10} className="text-red-500 fill-red-500/10" />
          </span>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-neutral-500 uppercase tracking-widest font-mono">
            Target: {derived.targetMinutes}M
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 pb-8 space-y-4">
        <div className="rounded-xl border border-white/5 bg-black p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] font-mono leading-none">
              Problem Statement
            </h3>
            <div className="h-px flex-1 bg-white/[0.03]" />
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-neutral-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-[10px] prose-headings:font-bold prose-code:text-emerald-400 prose-code:bg-emerald-500/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-emerald-500/10">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProblemPane);
