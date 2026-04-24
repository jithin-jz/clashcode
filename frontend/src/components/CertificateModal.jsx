import { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";
import CertificateTemplate from "./CertificateTemplate";

const CertificateModal = ({
  isOpen,
  onClose,
  certificate,
  isLoading = false,
}) => {
  const [downloading, setDownloading] = useState(false);
  const downloadRef = useRef(null);

  const handleDownload = async () => {
    if (!downloadRef.current) return;
    setDownloading(true);

    try {
      // Use html-to-image which is more robust for modern CSS colors
      const dataUrl = await htmlToImage.toPng(downloadRef.current, {
        quality: 1.0,
        pixelRatio: 2.2, // Slightly higher for extra crispness
        skipFonts: false,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Certificate_${certificate.username || "ClashOfCode"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Certificate generation failed:", error);
      toast.error("Failed to generate certificate.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <AnimatePresence>
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#09090b] text-zinc-200 rounded-2xl max-w-[420px] w-full shadow-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-zinc-300">Loading certificate...</p>
          </Motion.div>
        </Motion.div>
      </AnimatePresence>
    );
  }

  if (!certificate) {
    return (
      <AnimatePresence>
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#09090b] text-zinc-200 rounded-2xl max-w-[420px] w-full shadow-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-zinc-300">
              Certificate is not available yet. Complete all required challenges
              first.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      </AnimatePresence>
    );
  }

  // Map Data
  const studentName = certificate.username || "Student";
  const dateObj = new Date(certificate.issued_date || Date.now());
  const completionDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const verificationUrl =
    certificate.verification_url ||
    `${window.location.origin}/verify/${certificate.certificate_id}`;

  return (
    <AnimatePresence>
      {/* Hidden Template for Download (Off-screen) */}
      {isOpen && (
        <div
          key="download-container"
          style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
        >
          <CertificateTemplate
            ref={downloadRef}
            studentName={studentName}
            completionDate={completionDate}
            verificationUrl={verificationUrl}
          />
        </div>
      )}

      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#09090b] text-zinc-200 rounded-2xl max-w-[480px] w-full shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Certificate of Mastery
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Python Mastery Course
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Main Content (Extra Small) */}
            <div className="p-5 flex flex-col gap-5">
              {/* Certificate Preview (Reduced Scale) */}
              <div className="w-full relative aspect-[1.414/1] bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-white/5 group ring-1 ring-white/10">
                <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f]">
                  <div className="transform scale-[0.38] sm:scale-[0.42] origin-center shadow-2xl">
                    <CertificateTemplate
                      studentName={studentName}
                      completionDate={completionDate}
                      verificationUrl={verificationUrl}
                    />
                  </div>
                </div>
                {/* Delicate Highlight Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
              </div>

              {/* Info & Actions Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                {/* Left Column: Metadata */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">
                        Issued Date
                      </p>
                      <p className="text-sm font-medium text-zinc-200 uppercase">
                        {completionDate}
                      </p>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">
                        Completion ID
                      </p>
                      <p
                        className="text-sm font-medium text-zinc-200 font-mono truncate"
                        title={certificate.certificate_id}
                      >
                        #
                        {certificate.certificate_id
                          ?.substring(0, 8)
                          .toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5 group/link">
                    <div className="w-8 h-8 rounded-lg bg-[#00af9b]/10 flex items-center justify-center border border-[#00af9b]/20 text-[#00af9b]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                        Verification Link
                      </p>
                      <p className="text-xs text-[#00af9b]/80 font-mono truncate group-hover/link:text-[#00af9b] transition-colors">
                        {verificationUrl.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(verificationUrl);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Column: Main Actions */}
                <div className="flex gap-3 h-[52px]">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 bg-white text-black font-bold text-sm rounded-xl hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                  >
                    {downloading ? "Generating..." : "Download"}
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Python Mastery Certificate",
                          text: `I just earned my Python Mastery Certificate on CLASHCODE! Verification ID: #${certificate.certificate_id?.substring(0, 8).toUpperCase()}`,
                          url: verificationUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(verificationUrl);
                        alert("Verification Link Copied!");
                      }
                    }}
                    className="w-[52px] bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center p-0"
                    title="Share Certificate"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
