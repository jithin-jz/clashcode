import React from "react";
import { P } from "../SkeletonPrimitives";

export const AchievementsSkeleton = () => (
  <div className="min-h-screen bg-black pb-24">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2">
        <P className="h-8 w-56" />
        <P className="h-3 w-80 opacity-40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#141414] border border-white/5 rounded-xl p-4 space-y-2">
            <P className="h-2.5 w-16 opacity-40" />
            <P className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...Array(5)].map((_, i) => (
          <P key={i} className={`h-9 rounded-xl shrink-0 ${i === 0 ? "w-28" : "w-24"}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <P className="w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <P className="h-3.5 w-28" />
                <P className="h-2.5 w-full opacity-40" />
                <P className="h-2 w-3/4 opacity-30" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-white/[0.08] rounded-full animate-pulse" style={{ width: `${20 + i * 8}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
