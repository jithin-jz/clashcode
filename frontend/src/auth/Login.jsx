import React, { useEffect, useState } from "react";
import useAuthStore from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Github, Chrome, ArrowLeft } from "lucide-react";
import { Skeleton } from "boneyard-js/react";

const Login = () => {
  const navigate = useNavigate();
  const {
    loading,
    isOAuthLoading,
    isOtpLoading,
    otpCooldownUntil,
    email,
    otp,
    showOtpInput,
    setEmail,
    setOtp,
    setShowOtpInput,
    openOAuthPopup,
    requestOtp,
    verifyOtp,
    handleOAuthMessage,
    isAuthenticated,
    isInitialized,
    user,
  } = useAuthStore();
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0);

  const getRedirectPath = (u) => {
    return "/home";
  };

  useEffect(() => {
    const update = () => {
      const rem = Math.max(
        0,
        Math.ceil((otpCooldownUntil - Date.now()) / 1000),
      );
      setOtpCooldownSeconds(rem);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [otpCooldownUntil]);

  useEffect(() => {
    const handler = (e) => handleOAuthMessage(e);
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handleOAuthMessage]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    navigate(getRedirectPath(user), { replace: true });
  }, [isInitialized, isAuthenticated, user, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email required");
    const ok = await requestOtp(email.trim());
    if (ok) {
      setShowOtpInput(true);
      toast.success("Code sent — check your inbox");
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || "Failed to send code");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Enter your verification code");
    const ok = await verifyOtp(email.trim(), otp.trim());
    if (ok) {
      toast.success("Welcome back!");
      navigate(getRedirectPath(useAuthStore.getState().user), {
        replace: true,
      });
    } else {
      const err = useAuthStore.getState().error;
      toast.error(err || "Invalid code — try again");
    }
  };

  return (
    <Skeleton name="login-page">
      <div className="relative flex w-full items-center justify-center px-4 py-10">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 ds-dot-grid opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(108,99,255,0.07),transparent)]" />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Brand */}
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="app-title text-[11px] text-neutral-300">
                CLASHCODE
              </span>
            </div>
            <h1 className="ds-heading text-2xl text-white mb-1.5">
              Sign in to your workspace
            </h1>
          </Motion.div>

          {/* Auth Card */}
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="ds-card rounded-xl p-6 pb-7"
          >
            <AnimatePresence mode="wait">
              {!showOtpInput ? (
                <Motion.form
                  key="email"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="ds-eyebrow block mb-2">Email address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ds-input h-10"
                        required
                        id="login-email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isOtpLoading || otpCooldownSeconds > 0}
                    className="ds-btn ds-btn-primary w-full h-10 rounded-lg disabled:opacity-50"
                    id="login-send-otp"
                  >
                    {isOtpLoading
                      ? "Sending code…"
                      : otpCooldownSeconds > 0
                        ? `Retry in ${otpCooldownSeconds}s`
                        : "Send Verification Code"}
                  </button>
                </Motion.form>
              ) : (
                <Motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOtp("");
                      setShowOtpInput(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-300 transition-colors mb-1"
                  >
                    <ArrowLeft size={12} />
                    Change email
                  </button>

                  <div>
                    <label className="ds-eyebrow block mb-1">
                      Verification code
                    </label>
                    <p className="text-[11px] text-neutral-600 mb-3">
                      Code sent to{" "}
                      <span className="text-neutral-300 font-medium">
                        {email}
                      </span>
                    </p>
                    <input
                      type="text"
                      placeholder="000 000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="ds-input h-12 text-center font-['JetBrains_Mono',monospace] text-xl font-bold tracking-[0.35em] placeholder:tracking-normal"
                      required
                      id="login-otp-input"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isOtpLoading}
                    className="ds-btn ds-btn-primary w-full h-10 rounded-lg disabled:opacity-50"
                    id="login-verify-otp"
                  >
                    {isOtpLoading ? "Verifying…" : "Continue →"}
                  </button>
                </Motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-[#222]" />
              <span className="relative z-10 bg-[#161616] px-3 ds-eyebrow text-neutral-700">
                or continue with
              </span>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => openOAuthPopup("github")}
                disabled={loading || isOAuthLoading}
                className="ds-btn ds-btn-secondary h-10 rounded-lg text-sm gap-2 disabled:opacity-50"
                id="login-github"
              >
                <Github size={15} className="text-neutral-500" />
                GitHub
              </button>
              <button
                type="button"
                onClick={() => openOAuthPopup("google")}
                disabled={loading || isOAuthLoading}
                className="ds-btn ds-btn-secondary h-10 rounded-lg text-sm gap-2 disabled:opacity-50"
                id="login-google"
              >
                <Chrome size={15} className="text-neutral-500" />
                Google
              </button>
            </div>
          </Motion.div>

          {/* Footer */}
          <p className="ds-eyebrow mt-6 text-center text-neutral-800">
            © {new Date().getFullYear()} CLASHCODE · All rights reserved
          </p>
        </div>
      </div>
    </Skeleton>
  );
};

export default Login;
