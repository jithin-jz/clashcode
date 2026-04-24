import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameRedirectPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/home");
  }, [navigate]);
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
    </div>
  );
};

export default GameRedirectPage;
