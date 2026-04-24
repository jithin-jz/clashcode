import React from "react";

const AppBackdrop = ({ variant = "default" }) => {
  if (variant === "admin") {
    return (
      <>
        <div className="admin-shell absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%)]" />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,#060b13_0%,#070d17_100%)]" />
      <div className="app-noise-overlay absolute inset-0 z-0 pointer-events-none opacity-[0.018] mix-blend-overlay" />
      <div className="app-grid-overlay absolute inset-0 pointer-events-none opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[8%] top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[10%] h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
    </>
  );
};

export default AppBackdrop;
