import React from "react";
import { P } from "../SkeletonPrimitives";

export const GenericSkeleton = () => (
  <div className="min-h-screen bg-black p-8 space-y-8 max-w-5xl mx-auto">
    <div className="space-y-3">
      <P className="h-8 w-64" />
      <P className="h-3 w-80 opacity-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <P key={i} className="h-48 rounded-2xl" />
      ))}
    </div>
    <P className="h-72 rounded-2xl" />
  </div>
);
