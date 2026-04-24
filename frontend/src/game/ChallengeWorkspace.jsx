import React, { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Terminal, Bot, Sparkles, Gem, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import useAuthStore from "../stores/useAuthStore";
import useChallengesStore from "../stores/useChallengesStore";
import { motion as Motion } from "framer-motion";
import CursorEffects from "./CursorEffects";
import VictoryAnimation from "./VictoryAnimation";
import ChallengeWorkspaceSkeleton from "./ChallengeWorkspaceSkeleton";
import ShareCard from "./components/ShareCard";
import { generateLocalCodeReview } from "../utils/localCodeReview";

// Subcomponents
import HeaderBar from "./components/HeaderBar";
import EditorPane from "./components/EditorPane";
import ProblemPane from "./components/ProblemPane";
import ConsolePane from "./components/ConsolePane";
import AIAssistantPane from "./components/AIAssistantPane";

const MOBILE_TABS = [
  { id: "problem", label: "Problem", Icon: BookOpen },
  { id: "code", label: "Code", Icon: Terminal },
  { id: "ai", label: "AI", Icon: Bot },
];

const ChallengeWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRunPassed, setLastRunPassed] = useState(false);
  const { user } = useAuthStore();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Initial code template
  const [code, setCode] = useState("");
  const [completionData, setCompletionData] = useState(null);
  const [mobileTab, setMobileTab] = useState("problem");
  const [showShareCard, setShowShareCard] = useState(false);

  // AI Hint State
  const [hint, setHint] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [review, setReview] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const getAiErrorMessage = (err, fallbackMessage) => {
    if (err?.response?.status === 504) {
      return "AI processing is taking longer than expected. Please try again.";
    }
    return err?.response?.data?.error || fallbackMessage;
  };

  const handleGetHint = async () => {
    if (!challenge || !code) return;
    setIsHintLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.getAIHint(challenge.slug, {
        user_code: code,
        hint_level: hintLevel,
      });
      setHint(data.hint);
      setHintLevel((prev) => Math.min(prev + 1, 3));
    } catch (err) {
      console.error("Hint Error:", err);
      const errorMsg = getAiErrorMessage(
        err,
        "AI Assistant is currently unavailable.",
      );
      setOutput((prev) => [
        ...prev,
        { type: "error", content: `🤖 AI Assistant: ${errorMsg}` },
      ]);
    } finally {
      setIsHintLoading(false);
    }
  };
  const handlePurchaseAIAssist = async () => {
    if (!challenge) return;
    setIsHintLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.purchaseAIHint(challenge.slug);

      // Update User Points locally
      if (data.remaining_xp !== undefined) {
        const { setUser } = useAuthStore.getState();
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({
            ...currentUser,
            profile: {
              ...currentUser.profile,
              xp: data.remaining_xp,
            },
          });
        }
      }

      // Sync global challenge cache
      useChallengesStore
        .getState()
        .setChallengeHintsPurchased(challenge.slug, data.hints_purchased);

      setChallenge((prev) => ({
        ...prev,
        ai_hints_purchased: data.hints_purchased,
      }));

      setOutput((prev) => [
        ...prev,
        {
          type: "success",
          content:
            data.message ||
            `🔓 AI Hint Level ${data.hints_purchased} Unlocked!`,
        },
      ]);

      toast.success("AI Hint Unlocked", {
        description: `Hint Level ${data.hints_purchased} is now available.`,
      });

      // Automatically fetch the hint after successful purchase
      if (code) {
        try {
          const hintData = await challengesApi.getAIHint(challenge.slug, {
            user_code: code,
            hint_level: data.hints_purchased,
          });
          setHint(hintData.hint);
          setHintLevel(Math.min(data.hints_purchased + 1, 3));
          setOutput((prev) => [
            ...prev,
            { type: "success", content: "🤖 AI Hint Generated!" },
          ]);
        } catch (hintErr) {
          console.error("Hint generation error:", hintErr);
          setOutput((prev) => [
            ...prev,
            {
              type: "error",
              content: "⚠️ Hint unlocked but generation failed. Try again.",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Purchase Error:", err);
      const errorResponse = err.response?.data;

      if (err.response?.status === 402 && errorResponse) {
        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: `❌ ${errorResponse.error}: ${errorResponse.detail || "Insufficient Balance"}`,
          },
          {
            type: "log",
            content: `💰 Balance: ${errorResponse.current_xp} | Required: ${errorResponse.required_xp} | Short by: ${errorResponse.shortage}`,
          },
        ]);
        toast.error("Insufficient Balance", {
          description: `You need ${errorResponse.shortage} more points.`,
        });
      } else if (
        err.response?.status === 400 &&
        errorResponse?.error === "Maximum AI hints reached"
      ) {
        toast.warning("Maximum Hints Reached");
      } else {
        const errorMsg =
          errorResponse?.error || "Failed to purchase assistance.";
        toast.error("Error", { description: errorMsg });
      }
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!challenge || !code?.trim()) return;
    setIsReviewLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.aiAnalyze(challenge.slug, code);
      const reviewText =
        data?.review ||
        data?.analysis ||
        data?.feedback ||
        data?.result ||
        data?.message ||
        (typeof data === "string" ? data : "");

      if (!reviewText) {
        setReview("AI review generated, but response was empty.");
        return;
      }
      setReview(reviewText);
      toast.success("AI Review Ready");
    } catch (err) {
      const statusCode = err?.response?.status;
      if (statusCode === 404) {
        const fallbackReview = generateLocalCodeReview({ code, challenge });
        setReview(fallbackReview);
        toast.info("Using Local Review", {
          description: "Backend review endpoint is unavailable.",
        });
      } else {
        console.error("AI Review Error:", err);
        const errorMsg = getAiErrorMessage(
          err,
          "AI review is currently unavailable.",
        );
        toast.error("AI Review Failed", { description: errorMsg });
        setOutput((prev) => [
          ...prev,
          { type: "error", content: `🤖 AI Review: ${errorMsg}` },
        ]);
      }
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Fetch Challenge Data
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoadingChallenge(true);
      try {
        // Reset state on challenge change
        setHint("");
        setHintLevel(1);
        setReview("");
        setOutput([]);
        setLastRunPassed(false);
        setCompletionData(null);

        // Dynamic Import
        const { challengesApi } = await import("../services/challengesApi");
        const data = await challengesApi.getBySlug(id);
        setChallenge(data);
        setCode(data.initial_code || "");
        useChallengesStore.getState().upsertChallenge(data);
      } catch (error) {
        console.error("Failed to load challenge:", error);
        setChallenge(null);
        setCode("");
        // Check if it's a 404 error
        if (error.response?.status === 404 || error.message?.includes("404")) {
          setOutput([
            {
              type: "error",
              content:
                "Challenge not found. It may still be generating or doesn't exist.",
            },
            { type: "log", content: "Redirecting to dashboard..." },
          ]);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        } else {
          setOutput([
            {
              type: "error",
              content: "Failed to load challenge. Please try again.",
            },
          ]);
        }
      } finally {
        setIsLoadingChallenge(false);
      }
    };
    fetchChallenge();
  }, [id, navigate]);

  const submitCode = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLastRunPassed(false);
    setOutput([{ type: "log", content: "🚀 Initiating server-side validation..." }]);

    try {
      const { challengesApi } = await import("../services/challengesApi");
      const result = await challengesApi.submit(id, code);

      if (result.xp_earned && result.xp_earned > 0) {
        const { setUser } = useAuthStore.getState();
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({
            ...currentUser,
            profile: {
              ...currentUser.profile,
              xp: (currentUser.profile.xp || 0) + result.xp_earned,
            },
          });
        }
      }

      if (result.status === "completed" || result.status === "already_completed") {
        useChallengesStore.getState().applySubmissionResult(id, result);
        void useChallengesStore.getState().ensureFreshChallenges(0);
        setChallenge((prev) =>
          prev
            ? { ...prev, status: "COMPLETED", stars: result.stars || prev.stars }
            : prev,
        );

        const starText = "⭐".repeat(result.stars || 0);
        setOutput([
          {
            type: "success",
            content: `🎉 Challenge Completed! ${starText}`,
          },
        ]);
        if (result.xp_earned > 0) {
          setOutput((prev) => [
            ...prev,
            {
              type: "success",
              content: `💪 Earned: +${result.xp_earned}`,
            },
          ]);
        }
        setCompletionData(result);
      }
    } catch (err) {
      console.error("Submission error:", err);
      const errorData = err.response?.data;
      const errorMsg = errorData?.error || "Submission failed. Please try again.";
      
      setOutput((prev) => [
        ...prev,
        { type: "error", content: `❌ ${errorMsg}` },
      ]);

      if (errorData?.stderr) {
        setOutput((prev) => [
          ...prev,
          { type: "error", content: errorData.stderr },
        ]);
      }
      if (errorData?.stdout) {
        setOutput((prev) => [
          ...prev,
          { type: "log", content: errorData.stdout },
        ]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [id, code, isSubmitting]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLastRunPassed(false);
    setOutput([{ type: "log", content: "⚙️ Executing code on Piston server..." }]);

    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.execute(id, code);

      if (data.stdout) {
        setOutput((prev) => [...prev, { type: "log", content: data.stdout }]);
      }
      if (data.stderr) {
        setOutput((prev) => [...prev, { type: "error", content: data.stderr }]);
      }
      if (!data.stdout && !data.stderr) {
        setOutput((prev) => [...prev, { type: "log", content: "Execution finished with no output." }]);
      }

      if (data.passed) {
        setLastRunPassed(true);
        setOutput((prev) => [...prev, { type: "success", content: "✅ Local tests passed! Ready for submission." }]);
      } else {
        setLastRunPassed(false);
        setOutput((prev) => [...prev, { type: "error", content: "⚠️ Local tests failed." }]);
      }
    } catch (err) {
      console.error("Execution error:", err);
      const errorMsg = err.response?.data?.error || "Execution failed. Server might be down.";
      setOutput((prev) => [...prev, { type: "error", content: `❌ ${errorMsg}` }]);
    } finally {
      setIsRunning(false);
    }
  }, [id, code, isRunning]);


  const applyEditorPreferences = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const themeNameMap = {
      solarized_dark: "solarized-dark",
    };

    const activeTheme = user?.profile?.active_theme;
    const validThemes = [
      "dracula",
      "nord",
      "monokai",
      "solarized_dark",
      "solarized-dark",
      "cyberpunk",
    ];

    if (activeTheme && validThemes.includes(activeTheme)) {
      const monacoThemeName = themeNameMap[activeTheme] || activeTheme;
      monaco.editor.setTheme(monacoThemeName);
    } else {
      monaco.editor.setTheme("industrial");
    }

    const fontAliasMap = {
      // Store item name may differ from actual webfont family.
      "Comic Code": "Comic Neue",
    };

    const selectedFont = user?.profile?.active_font || "Fira Code";
    const resolvedFont = fontAliasMap[selectedFont] || selectedFont;
    const fontFamily = resolvedFont
      ? `"${resolvedFont}", 'Fira Code', 'JetBrains Mono', Consolas, monospace`
      : "'Fira Code', 'JetBrains Mono', Consolas, monospace";

    const applyFont = () => {
      editor.updateOptions({ fontFamily });
      // Ensure Monaco recalculates glyph metrics when font changes dynamically.
      monaco.editor.remeasureFonts();
      editor.layout();
    };

    // Wait for the selected font to be available before applying.
    if (document.fonts?.load && resolvedFont) {
      document.fonts.load(`14px "${resolvedFont}"`).finally(applyFont);
    } else {
      applyFont();
    }
  }, [user?.profile?.active_theme, user?.profile?.active_font]);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // --- THEME DEFINITIONS ---

      // Industrial Elite
      monaco.editor.defineTheme("industrial", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "444444" },
          { token: "keyword", foreground: "ffffff", fontStyle: "bold" },
          { token: "string", foreground: "a3a3a3" },
          { token: "number", foreground: "e8e8e8" },
          { token: "type", foreground: "ffffff" },
        ],
        colors: {
          "editor.background": "#000000",
          "editor.foreground": "#e8e8e8",
          "editorCursor.foreground": "#ffffff",
          "editor.lineHighlightBackground": "#0a0a0a",
          "editor.selectionBackground": "#141414",
          "editorLineNumber.foreground": "#333333",
          "editorLineNumber.activeForeground": "#666666",
        },
      });

      // Dracula
      monaco.editor.defineTheme("dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6272a4" },
          { token: "keyword", foreground: "ff79c6" },
          { token: "string", foreground: "f1fa8c" },
          { token: "number", foreground: "bd93f9" },
          { token: "type", foreground: "8be9fd" },
        ],
        colors: {
          "editor.background": "#282a36",
          "editor.foreground": "#f8f8f2",
          "editorCursor.foreground": "#f8f8f0",
          "editor.lineHighlightBackground": "#44475a",
          "editor.selectionBackground": "#44475a",
        },
      });

      // Nord
      monaco.editor.defineTheme("nord", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "616e88" },
          { token: "keyword", foreground: "81a1c1" },
          { token: "string", foreground: "a3be8c" },
          { token: "number", foreground: "b48ead" },
          { token: "type", foreground: "8fbcbb" },
        ],
        colors: {
          "editor.background": "#2e3440",
          "editor.foreground": "#d8dee9",
          "editorCursor.foreground": "#d8dee9",
          "editor.lineHighlightBackground": "#3b4252",
          "editor.selectionBackground": "#434c5e",
        },
      });

      // Monokai
      monaco.editor.defineTheme("monokai", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "75715e" },
          { token: "keyword", foreground: "f92672" },
          { token: "string", foreground: "e6db74" },
          { token: "number", foreground: "ae81ff" },
          { token: "type", foreground: "66d9ef" },
        ],
        colors: {
          "editor.background": "#272822",
          "editor.foreground": "#f8f8f2",
          "editorCursor.foreground": "#f8f8f0",
          "editor.lineHighlightBackground": "#3e3d32",
          "editor.selectionBackground": "#49483e",
        },
      });

      // Solarized Dark
      monaco.editor.defineTheme("solarized-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "586e75" },
          { token: "keyword", foreground: "859900" },
          { token: "string", foreground: "2aa198" },
          { token: "number", foreground: "d33682" },
          { token: "type", foreground: "b58900" },
        ],
        colors: {
          "editor.background": "#002b36",
          "editor.foreground": "#839496",
          "editorCursor.foreground": "#839496",
          "editor.lineHighlightBackground": "#073642",
          "editor.selectionBackground": "#073642",
        },
      });

      // Cyberpunk
      monaco.editor.defineTheme("cyberpunk", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "323232" },
          { token: "keyword", foreground: "ff007f" },
          { token: "string", foreground: "00ffff" },
          { token: "number", foreground: "9d00ff" },
          { token: "type", foreground: "ff7700" },
        ],
        colors: {
          "editor.background": "#0d0d0d",
          "editor.foreground": "#f0f0f0",
          "editorCursor.foreground": "#ff007f",
          "editor.lineHighlightBackground": "#1a1a1a",
          "editor.selectionBackground": "#333333",
        },
      });

      // Cursor Effect Hook
      editor.onDidChangeCursorPosition((e) => {
        if (user?.profile?.active_effect && window.spawnCursorEffect) {
          const scrolledVisiblePosition = editor.getScrolledVisiblePosition(
            e.position,
          );
          if (scrolledVisiblePosition) {
            const domNode = editor.getDomNode();
            const rect = domNode.getBoundingClientRect();
            const x = rect.left + scrolledVisiblePosition.left;
            const y = rect.top + scrolledVisiblePosition.top;
            window.spawnCursorEffect(x, y + 10); // Offset slightly
          }
        }
      });

      // Apply profile theme/font immediately on mount.
      applyEditorPreferences();
    },
    [user?.profile?.active_effect, applyEditorPreferences],
  );

  // Apply active theme/font reactively when profile settings change.
  useEffect(() => {
    applyEditorPreferences();
  }, [applyEditorPreferences]);



  const stopCode = useCallback(() => {
    setIsRunning(false);
    setIsSubmitting(false);
    setOutput((prev) => [
      ...prev,
      { type: "error", content: "⛔ Connection Interrupted by User" },
    ]);
  }, []);

  // Show skeleton while loading challenge data
  if (isLoadingChallenge) {
    return <ChallengeWorkspaceSkeleton />;
  }

  return (
    <div className="h-dvh flex flex-col bg-[#0a0a0a] text-white overflow-hidden relative font-sans selection:bg-white/10">
      <div className="absolute inset-0 pointer-events-none bg-[#0a0a0a]" />
      <CursorEffects effectType={user?.profile?.active_effect} />

      {/* Completion Modal */}
      {completionData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <VictoryAnimation type={user?.profile?.active_victory} />
          <Motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111]/95 backdrop-blur-md border border-[#222] rounded-2xl p-6 sm:p-10 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 bg-green-500/10 border border-green-500/20">
                <Sparkles size={32} className="text-green-500" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Challenge Complete
                </h2>
                <p className="text-gray-500 text-xs text-balance">
                  Validation successful. You've beaten the challenge.
                </p>
              </div>

              <div className="flex gap-2 my-1">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`w-6 h-6 flex items-center justify-center ${star <= completionData.stars ? "text-[#ffa116]" : "text-gray-800"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-5.82 3.25L7.38 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                ))}
              </div>

              {completionData.xp_earned > 0 && (
                <div className="text-white text-sm font-mono tracking-tighter flex items-center gap-1.5">
                  <Gem size={14} className="text-red-500 fill-red-500/10" />+
                  {completionData.xp_earned} EARNED
                </div>
              )}

              <div className="flex flex-col w-full gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowShareCard(true)}
                  className="w-full h-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold uppercase text-xs transition-colors"
                >
                  Share Result
                </button>
                {completionData.next_level_slug ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const slug = completionData.next_level_slug;
                      setCompletionData(null);
                      setTimeout(() => {
                        navigate(`/level/${slug}`);
                      }, 100);
                    }}
                    className="w-full h-10 rounded-xl bg-[#ffa116] text-black hover:bg-[#ff8f00] font-bold uppercase text-xs transition-colors"
                  >
                    Next Challenge
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 font-bold uppercase text-xs transition-colors"
                >
                  Dashboard
                </button>
              </div>

              <ShareCard
                isOpen={showShareCard}
                onClose={() => setShowShareCard(false)}
                challengeTitle={challenge?.title || "Challenge"}
                stars={completionData.stars || 0}
                timeSeconds={completionData.time_seconds || 0}
                xpEarned={completionData.xp_earned || 0}
                username={user?.username || "player"}
              />
            </div>
          </Motion.div>
        </div>
      )}

      <div className="shrink-0 relative z-10">
        <HeaderBar
          title={challenge?.title || "Loading..."}
          navigate={navigate}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          stopCode={stopCode}
        />
      </div>

      {/* Main Content - Minimalist Boxy Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 p-0 sm:p-3 gap-0 sm:gap-3">
        {/* LEFT CARD: Problem — desktop always visible, mobile only when tab=problem */}
        <div
          className={`lg:flex flex-1 lg:flex-none w-full lg:w-[24rem] min-h-0 flex-col bg-black border-y sm:border border-white/5 sm:rounded-xl shadow-2xl overflow-y-auto ${mobileTab === "problem" ? "flex" : "hidden"}`}
        >
          <div className="flex-1 min-h-0 relative">
            <ProblemPane challenge={challenge} loading={!challenge} />
          </div>
        </div>

        {/* MIDDLE COLUMN: Editor & Console Cards — desktop always visible, mobile only when tab=code */}
        <div
          className={`lg:flex flex-1 flex-col min-w-0 sm:rounded-xl sm:border border-white/5 shadow-2xl overflow-hidden bg-black ${mobileTab === "code" ? "flex" : "hidden"}`}
        >
          <div className="flex-1 flex flex-col bg-black overflow-hidden relative group">
            <div className="flex-1 relative">
              <EditorPane
                code={code}
                setCode={setCode}
                user={user}
                handleEditorDidMount={handleEditorDidMount}
                loading={!challenge}
                editorFontFamily={
                  user?.profile?.active_font
                    ? `"${user.profile.active_font}", 'Fira Code', 'JetBrains Mono', Consolas, monospace`
                    : "'Fira Code', 'JetBrains Mono', Consolas, monospace"
                }
              />
            </div>
            
            {/* Action Bar - Fixed between editor and console */}
            <div className="shrink-0 h-11 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-4">
              <div className="flex items-center gap-4 text-zinc-500">
                <div className="flex items-center gap-1.5 opacity-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Piston-v2 Active</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runCode}
                  disabled={isRunning || isSubmitting || !challenge}
                  className={`
                    h-7 px-4 rounded border border-white/10 transition-all flex items-center gap-2
                    ${isRunning || isSubmitting || !challenge 
                      ? "opacity-50 cursor-not-allowed text-zinc-600" 
                      : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white active:scale-95"}
                  `}
                >
                  {isRunning ? (
                    <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play size={10} fill="currentColor" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Run</span>
                </button>

                <button
                  type="button"
                  onClick={submitCode}
                  disabled={isRunning || isSubmitting || !challenge}
                  className={`
                    h-7 px-5 rounded relative overflow-hidden transition-all flex items-center gap-2
                    ${isRunning || isSubmitting || !challenge 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                      : lastRunPassed
                        ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.05)]"}
                    active:scale-95
                  `}
                >
                  {isSubmitting ? (
                    <div className="w-2.5 h-2.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={10} fill="currentColor" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Submit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Console Card */}
          <div className="h-[35%] sm:h-[32%] min-h-[180px] flex flex-col bg-black border-t border-white/5">
            <div className="px-3 py-2 border-b border-white/5 bg-black flex justify-between items-center h-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-sans">
                  Terminal
                </span>
                {output.length > 0 && (
                   <button 
                    onClick={() => setOutput([])}
                    className="p-1 hover:bg-white/5 rounded transition-colors text-zinc-600 hover:text-zinc-400"
                    title="Clear Console"
                   >
                     <Terminal size={10} />
                   </button>
                )}
              </div>
              {output.some((l) => l.type === "error") && (
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400" /> Error
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ConsolePane output={output} loading={!challenge} />
            </div>
          </div>
        </div>

        {/* RIGHT CARD: AI Assistant — desktop always visible, mobile only when tab=ai */}
        <div
          className={`lg:flex flex-1 lg:flex-none w-full lg:w-[24rem] xl:w-[26rem] flex-col bg-black border-y sm:border border-white/5 sm:rounded-xl shadow-2xl overflow-hidden ${mobileTab === "ai" ? "flex" : "hidden"}`}
        >
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AIAssistantPane
              onGetHint={handleGetHint}
              onPurchase={handlePurchaseAIAssist}
              onAnalyze={handleAnalyzeCode}
              hint={hint}
              review={review}
              isHintLoading={isHintLoading}
              isReviewLoading={isReviewLoading}
              hintLevel={hintLevel}
              ai_hints_purchased={challenge?.ai_hints_purchased || 0}
              userXp={user?.profile?.xp}
            />
          </div>
        </div>
      </div>

      {/* MOBILE TAB BAR — only shown on mobile */}
      <div className="lg:hidden shrink-0 relative z-20 bg-black/95 border-t border-white/5 pb-safe">
        <div className="flex items-stretch h-14">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                mobileTab === tab.id
                  ? "text-white bg-white/5 relative"
                  : "text-neutral-700 hover:text-neutral-400"
              }`}
            >
              <tab.Icon
                size={mobileTab === tab.id ? 19 : 18}
                strokeWidth={mobileTab === tab.id ? 2.5 : 2}
                className="transition-transform duration-200"
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${mobileTab === tab.id ? "opacity-100" : "opacity-70"}`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ChallengeWorkspace;
