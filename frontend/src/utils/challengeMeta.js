export const getDifficultyMeta = (order = 1) => {
  if (order <= 20) {
    return {
      label: "Easy",
      pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm",
    };
  }
  if (order <= 40) {
    return {
      label: "Medium",
      pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-sm",
    };
  }
  return {
    label: "Hard",
    pill: "bg-rose-500/10 text-rose-400 border border-rose-500/20 backdrop-blur-sm",
  };
};

export const getTrackMeta = (order = 1) => {
  if (order <= 10) return { key: "basics", label: "Python Basics" };
  if (order <= 20) return { key: "ds", label: "Data Structures" };
  if (order <= 30) return { key: "flow", label: "Control Flow" };
  if (order <= 40) return { key: "functions", label: "Functions & Patterns" };
  if (order <= 50) return { key: "stdlib", label: "Standard Library" };
  if (order <= 60) return { key: "oop", label: "OOP Mastery" };
  return { key: "special", label: "Special" };
};
