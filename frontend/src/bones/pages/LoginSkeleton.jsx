import React from "react";
import { P } from "../SkeletonPrimitives";

export const LoginSkeleton = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
    <div className="text-center mb-8 space-y-4">
      <P className="h-3 w-20 mx-auto opacity-40" />
      <P className="h-10 w-64 sm:w-80 mx-auto" />
    </div>

    <div className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-8 space-y-6">
      <div className="space-y-3">
        <P className="h-2.5 w-24 opacity-40 uppercase tracking-widest" />
        <P className="h-12 w-full rounded-xl" />
      </div>

      <P className="h-12 w-full rounded-xl" />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <P className="h-2 w-24 opacity-20" />
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* OAuth buttons grid */}
      <div className="grid grid-cols-2 gap-3">
        <P className="h-12 rounded-xl" />
        <P className="h-12 rounded-xl" />
      </div>
    </div>

    <P className="h-2 w-48 mx-auto mt-10 opacity-20" />
  </div>
);
