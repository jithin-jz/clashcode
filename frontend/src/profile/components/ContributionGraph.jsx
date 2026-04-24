import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Sparkles } from "lucide-react";

const ContributionGraph = ({ data, loading }) => {
  // Generate last 12 months of dates (simplified for heatmap)
  // In a real app, we'd want 365 days. Here we'll do a 52x7 grid.

  const contributionMap = React.useMemo(() => {
    const map = {};
    if (!Array.isArray(data)) return map;
    data.forEach((item) => {
      if (!item.date) return;
      // Normalize any date format to YYYY-MM-DD
      const dateStr = new Date(item.date).toISOString().split("T")[0];
      map[dateStr] = (map[dateStr] || 0) + (item.count || 0);
    });
    return map;
  }, [data]);

  // Simple Level logic (0 to 4)
  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // Calculate grid data for last 52 weeks (364 days)
  const gridData = React.useMemo(() => {
    const weeks = [];
    const today = new Date();
    // Start from 52 weeks ago (Sunday of that week)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    // Align to Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    let currentDate = new Date(startDate);

    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = contributionMap[dateStr] || 0;
        days.push({
          date: dateStr,
          count: count,
          level: getLevel(count),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(days);
      if (currentDate > today) break;
    }
    return weeks;
  }, [contributionMap]);

  // Dynamic Streak Calculation
  const longestStreak = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 0;

    const activeDates = new Set(
      data
        .filter((d) => d.count > 0)
        .map((d) => new Date(d.date).toISOString().split("T")[0]),
    );
    const sortedDates = Array.from(activeDates).sort();

    let longest = 0;
    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const current = new Date(sortedDates[i]);
        const prev = new Date(sortedDates[i - 1]);
        const diffTime = Math.abs(current - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longest = Math.max(longest, tempStreak);
    }
    return longest;
  }, [data]);

  const colors = [
    "bg-[#1a1a1a]", // Level 0 (Empty)
    "bg-[#004d40]", // Level 1 (Low) - Dark Teal
    "bg-[#007a68]", // Level 2 (Medium) - Medium Teal
    "bg-[#00af9b]", // Level 3 (High) - Bright Teal
    "bg-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]", // Level 4 (Ultimate) - Neon Teal
  ];

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-white/5 p-4 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
        <div className="flex gap-1 overflow-hidden h-[80px]">
          {[...Array(24)].map((_, w) => (
            <div key={w} className="flex flex-col gap-1 shrink-0">
              {[...Array(7)].map((_, d) => (
                <div
                  key={d}
                  className="w-[11px] h-[11px] rounded-[1px] bg-white/5"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 mt-2 border-t border-white/5">
          <div className="h-3 w-40 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-[#00af9b]" /> Clash Activity
        </CardTitle>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
          Last 12 Months
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Heatmap Grid */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    title={`${day.date}: ${day.count} contributions`}
                    className={`w-2.5 h-2.5 rounded-[1px] transition-all duration-500 ${colors[day.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 text-[10px] text-zinc-500 font-medium">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 w-full sm:w-auto">
              <span>
                Total Contributions:{" "}
                <span className="text-white">
                  {data.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
              </span>
              <span>
                Longest Streak:{" "}
                <span className="text-white">{longestStreak} Days</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono ml-auto sm:ml-0">
              <span>Less</span>
              {colors.map((c, i) => (
                <div key={i} className={`w-2 h-2 rounded-[1px] ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionGraph;
