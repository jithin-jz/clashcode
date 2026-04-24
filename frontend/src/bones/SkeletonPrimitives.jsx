import React from "react";

/**
 * Shared primitive components for high-fidelity skeleton screens.
 * These are the building blocks for layout-accurate loaders.
 */

export const P = ({ className = "" }) => (
  <div className={`bg-white/[0.06] animate-pulse rounded-lg ${className}`} />
);

export const Circle = ({ className = "" }) => (
  <div className={`bg-white/[0.06] animate-pulse rounded-full ${className}`} />
);
