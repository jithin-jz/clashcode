import { useState, useEffect, useMemo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import useChallengesStore from "../stores/useChallengesStore";
import { challengesApi } from "../services/challengesApi";
import { ICONS, generateLevels } from "../constants/levelData.jsx";

const CERTIFICATE_SLUG = "certificate";

/**
 * Custom hook to manage Home page data, levels, and certificates.
 *
 * Performance: useShallow selector on challenges store prevents
 * re-renders from unrelated challenge-store updates that don't affect
 * the home page. Level transformation is fully memoised.
 */
export const useHomeData = (user) => {
  const userId = user?.id;
  const {
    challenges: apiLevels,
    isLoading,
    fetchChallenges,
  } = useChallengesStore(
    useShallow((s) => ({
      challenges: s.challenges,
      isLoading: s.isLoading,
      fetchChallenges: s.fetchChallenges,
    })),
  );
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [userCertificate, setUserCertificate] = useState(null);
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);

  // Initial Fetch
  useEffect(() => {
    let cancelled = false;

    const runInitialFetch = async () => {
      if (!userId) {
        setHasFetchedOnce(true);
        return;
      }

      setHasFetchedOnce(false);
      try {
        await fetchChallenges();
      } finally {
        if (!cancelled) {
          setHasFetchedOnce(true);
        }
      }
    };

    runInitialFetch();
    return () => {
      cancelled = true;
    };
  }, [userId, fetchChallenges]);

  const showHomeSkeleton =
    userId && apiLevels.length === 0 && (!hasFetchedOnce || isLoading);

  const certificateCheckKey = useMemo(() => {
    if (!userId || !apiLevels?.length) return "";
    const completedCount = apiLevels.filter(
      (level) => level.status === "COMPLETED",
    ).length;
    return `${userId}:${completedCount}:${apiLevels.length}`;
  }, [userId, apiLevels]);

  // Certificate Eligibility Logic
  useEffect(() => {
    let cancelled = false;

    const checkCertificate = async () => {
      if (!userId || !certificateCheckKey) return;

      try {
        const eligibility = await challengesApi.checkCertificateEligibility();

        if (cancelled) return;

        if (eligibility.has_certificate || eligibility.eligible) {
          const certData = await challengesApi.getMyCertificate();
          if (cancelled) return;

          if (certData) {
            setUserCertificate(certData);
          }

          const shownKey = `cert_shown_${userId}`;
          if (certData && !localStorage.getItem(shownKey)) {
            setCertificateModalOpen(true);
            localStorage.setItem(shownKey, "true");
          }
        }
      } catch (error) {
        console.error("Failed to check certificate:", error);
      }
    };

    checkCertificate();
    return () => {
      cancelled = true;
    };
  }, [userId, certificateCheckKey]);

  // Level Transformation Logic — fully memoised
  const levels = useMemo(() => {
    if (showHomeSkeleton) {
      return [];
    }

    if (!apiLevels || apiLevels.length === 0) {
      return generateLevels(60).map((l) => ({
        ...l,
        status: l.id === 1 ? "UNLOCKED" : "LOCKED",
        unlocked: l.id === 1,
        completed: false,
        stars: 0,
      }));
    }

    const sortedApiLevels = [...apiLevels].sort((a, b) => a.order - b.order);
    const totalChallengeLevels = sortedApiLevels.length;
    const finalChallenge = sortedApiLevels[totalChallengeLevels - 1];
    const isFinalChallengeCompleted = finalChallenge?.status === "COMPLETED";
    const certificateOrder = totalChallengeLevels + 1;
    const levelsWithCert = [...sortedApiLevels];

    if (
      totalChallengeLevels > 0 &&
      !levelsWithCert.find(
        (l) => l.slug === CERTIFICATE_SLUG || l.type === "CERTIFICATE",
      )
    ) {
      levelsWithCert.push({
        id: CERTIFICATE_SLUG,
        order: certificateOrder,
        slug: CERTIFICATE_SLUG,
        title: "Professional Certificate",
        description: "Proof of your mastery",
        stars: 0,
        status: isFinalChallengeCompleted ? "UNLOCKED" : "LOCKED",
        xp_reward: 0,
        type: "CERTIFICATE",
        required_levels: totalChallengeLevels,
        unlock_message: `Unlock after completing all ${totalChallengeLevels} levels`,
      });
    }

    return levelsWithCert.map((apiData) => {
      const isCertificate =
        apiData.slug === CERTIFICATE_SLUG || apiData.type === "CERTIFICATE";
      return {
        id: isCertificate ? CERTIFICATE_SLUG : apiData.order,
        order: apiData.order,
        name: isCertificate
          ? "Professional Certificate"
          : `Level ${apiData.order}`,
        slug: apiData.slug,
        icon: ICONS[(apiData.order - 1) % ICONS.length],
        stars: apiData.stars || 0,
        status: apiData.status,
        unlocked:
          apiData.status === "UNLOCKED" ||
          apiData.status === "COMPLETED" ||
          (isCertificate && isFinalChallengeCompleted),
        completed: apiData.status === "COMPLETED",
        type: isCertificate ? "CERTIFICATE" : "LEVEL",
        ...apiData,
      };
    });
  }, [apiLevels, showHomeSkeleton]);

  const handleCertificateClick = useCallback(async () => {
    if (userCertificate) {
      setCertificateModalOpen(true);
      return;
    }

    setIsCertificateLoading(true);
    try {
      const certData = await challengesApi.getMyCertificate();
      if (certData) {
        setUserCertificate(certData);
        setCertificateModalOpen(true);
      } else {
        toast.error("Certificate not available yet.");
      }
    } catch (error) {
      console.error("Failed to load certificate:", error);
      toast.error("Failed to load certificate.");
    } finally {
      setIsCertificateLoading(false);
    }
  }, [userCertificate]);

  return {
    levels,
    isLoading: showHomeSkeleton,
    certificateModalOpen,
    setCertificateModalOpen,
    userCertificate,
    isCertificateLoading,
    handleCertificateClick,
    CERTIFICATE_SLUG,
  };
};
