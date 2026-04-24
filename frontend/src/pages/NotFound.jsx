import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { motion as Motion } from "framer-motion";

const NotFound = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
    <div className="pointer-events-none absolute inset-0 ds-dot-grid opacity-50" />

    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="ds-card relative z-10 w-full max-w-lg p-8 text-center sm:p-10"
    >
      {/* 404 number */}
      <p className="font-['Geist_Mono',monospace] text-[80px] font-bold leading-none text-[#1c1c1c] sm:text-[100px] select-none mb-4">
        404
      </p>

      <h1 className="ds-heading text-2xl text-white mb-3">Page not found</h1>

      <p className="ds-body text-center max-w-sm mx-auto mb-8">
        The page you're looking for doesn't exist or has been moved to a
        different URL.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/home"
          className="ds-btn ds-btn-primary h-10 px-6 rounded-lg w-full sm:w-auto"
        >
          <Home size={15} />
          Back to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="ds-btn ds-btn-ghost h-10 px-6 rounded-lg w-full sm:w-auto"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>
      </div>
    </Motion.div>
  </div>
);

export default NotFound;
