import React, { useMemo } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Lock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import LevelButton from "../../game/LevelButton";
import { getTrackMeta } from "../../utils/challengeMeta";

const TRACK_ORDER = [
  "Python Basics",
  "Data Structures",
  "Control Flow",
  "Functions & Patterns",
  "Standard Library",
  "OOP Mastery",
];

const TRACK_DESCRIPTION = {
  "Python Basics": "Core syntax, variables, and fundamental concepts",
  "Data Structures": "Lists, dicts, sets, and complex data types",
  "Control Flow": "Conditionals, loops, and program logic",
  "Functions & Patterns": "Functions, closures, decorators, and design",
  "Standard Library": "Built-in modules, itertools, collections, and more",
  "OOP Mastery": "Classes, inheritance, polymorphism, and design",
};

const ChallengeMap = ({ levels, handleLevelClick }) => {
  const {
    certificateLevel,
    completedChallenges,
    totalChallenges,
    certificateProgressPercent,
    grouped,
    trackProgress,
  } = useMemo(() => {
    const sorted = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));
    const cert =
      sorted.find(
        (l) => l.slug === "certificate" || l.type === "CERTIFICATE",
      ) || null;
    const normal = sorted.filter(
      (l) => l.slug !== "certificate" && l.type !== "CERTIFICATE",
    );

    const groupsMap = {};
    normal.forEach((level) => {
      const track = getTrackMeta(level.order).label;
      if (!groupsMap[track]) groupsMap[track] = [];
      groupsMap[track].push(level);
    });

    const progress = {};
    Object.entries(groupsMap).forEach(([name, tLevels]) => {
      const solved = tLevels.filter((l) => l.completed).length;
      progress[name] = {
        solved,
        total: tLevels.length,
        percent: tLevels.length
          ? Math.round((solved / tLevels.length) * 100)
          : 0,
      };
    });

    const completed = normal.filter((l) => l.completed).length;

    return {
      certificateLevel: cert,
      completedChallenges: completed,
      totalChallenges: normal.length,
      certificateProgressPercent: normal.length
        ? Math.round((completed / normal.length) * 100)
        : 0,
      grouped: groupsMap,
      trackProgress: progress,
    };
  }, [levels]);

  return (
    <div className="w-full relative flex flex-col items-center">
      <div className="w-full px-3 sm:px-5">
        <div className="space-y-0.5 pb-4">
          {/* Overall progress card — Styled like LevelButton */}
          <div className="px-4 pt-4 pb-4">
            <div className="ds-card p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 bg-black border-white/60 shadow-sm">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-white/30 bg-white/5 flex items-center justify-center shrink-0 text-white">
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[9px] font-mono text-white uppercase tracking-widest mb-0.5 font-bold">
                    Platform Status
                  </p>
                  <p className="text-[12px] font-semibold leading-snug text-white">
                    Overall Progress
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 sm:max-w-[300px]">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold text-white font-mono">
                    {completedChallenges}
                    <span className="text-white/60 font-medium text-xs">
                      {" "}
                      / {totalChallenges} challenges
                    </span>
                  </p>
                  <span className="text-[10px] font-mono font-bold text-white tracking-tighter">
                    {certificateProgressPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${certificateProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TRACK SECTIONS */}
          {TRACK_ORDER.map((track, trackIdx) => {
            const trackLevels = grouped[track] || [];
            if (!trackLevels.length) return null;
            const prog = trackProgress[track] || {};
            const isComplete = prog.solved === prog.total && prog.total > 0;

            return (
              <Motion.section
                key={track}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  delay: trackIdx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="px-4 py-4 sm:px-4"
              >
                {/* Track header */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">
                        {track}
                      </h3>
                      {isComplete && (
                        <span className="ds-pill ds-pill-success">Done</span>
                      )}
                    </div>
                    <p className="text-[12px] text-white/90">
                      {TRACK_DESCRIPTION[track] || ""}
                    </p>
                  </div>

                  {/* Mini progress */}
                  <div className="shrink-0 text-right">
                    <p className="ds-eyebrow text-white/80 mb-1">
                      {prog.solved}/{prog.total}
                    </p>
                    <div className="w-20 ds-progress">
                      <div
                        className="ds-progress-fill bg-neutral-400 transition-width"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {trackLevels.map((level, index) => {
                    const next = trackLevels[index + 1];
                    const isCurrentLevel = level.unlocked && !next?.unlocked;
                    return (
                      <LevelButton
                        key={level.id}
                        level={level}
                        isCurrentLevel={isCurrentLevel}
                        motionIndex={index}
                        onClick={() => handleLevelClick(level)}
                      />
                    );
                  })}
                </div>
              </Motion.section>
            );
          })}

          {/* CERTIFICATE SECTION */}
          {certificateLevel && (
            <section className="px-4 pt-4 pb-12 sm:px-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">
                    Final Achievement
                  </h3>
                  <p className="text-[12px] text-white/90">
                    Your path to mastery ends here.
                  </p>
                </div>
                <span className="ds-pill ds-pill-warning bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Certification
                </span>
              </div>

              <button
                onClick={() => handleLevelClick(certificateLevel)}
                className={`
                  w-full text-left rounded-xl border p-4
                  transition-all duration-150 group relative overflow-hidden
                  ${
                    certificateLevel.completed
                      ? "bg-[#0a0a0a] border-l-2 border-l-amber-500 border-white/20 shadow-sm"
                      : certificateLevel.unlocked
                        ? "bg-black border-[#333] hover:border-[#666] hover:bg-[#0a0a0a] shadow-md"
                        : "bg-black border-white/60 shadow-inner opacity-60"
                  }
                  ${certificateLevel.unlocked ? "cursor-pointer hover:-translate-y-px active:scale-[0.995]" : "cursor-not-allowed"}
                `}
              >
                {/* Top content: Icon + Title + Status */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                        certificateLevel.unlocked
                          ? "bg-amber-400/10 border-amber-500/30 text-amber-400"
                          : "bg-[#050505] border-white/20 text-neutral-600"
                      }`}
                    >
                      {certificateLevel.unlocked ? (
                        <Crown size={18} strokeWidth={2} />
                      ) : (
                        <Lock size={15} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[10px] font-mono text-white uppercase tracking-widest mb-1 font-bold">
                        Certification
                      </p>
                      <h4 className="text-[14px] font-bold leading-snug text-white">
                        Python Mastery Certificate
                      </h4>
                      <p className="mt-1 text-[11.5px] text-white/50 leading-tight">
                        {certificateLevel.unlocked
                          ? "View and share your verified achievement."
                          : "Complete all challenges to unlock."}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 mt-0.5">
                    {certificateLevel.completed ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <ArrowRight size={14} className="text-amber-500" />
                      </div>
                    ) : certificateLevel.unlocked ? (
                      <ArrowRight
                        size={16}
                        className="text-neutral-400 group-hover:text-white transition-all transform group-hover:translate-x-1"
                      />
                    ) : (
                      <Lock size={14} className="text-neutral-700" />
                    )}
                  </div>
                </div>

                {/* Bottom: Progress Bar Integration */}
                <div className="mt-6 relative z-10">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
                        Progress: {completedChallenges} / {totalChallenges}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
                      {certificateProgressPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 transition-width duration-700 ease-out"
                      style={{ width: `${certificateProgressPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeMap;
