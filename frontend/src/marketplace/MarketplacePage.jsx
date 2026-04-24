import { useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Check,
  Sparkles,
  Type,
  Palette,
  Package,
  PartyPopper,
  Gem,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "boneyard-js/react";
import { useMarketplace } from "../hooks/useMarketplace";

const CATEGORIES = [
  { id: "THEME", label: "Themes", icon: Palette },
  { id: "FONT", label: "Fonts", icon: Type },
  { id: "EFFECT", label: "Effects", icon: Sparkles },
  { id: "VICTORY", label: "Victory", icon: PartyPopper },
];

const MarketplacePage = memo(() => {
  const navigate = useNavigate();
  const {
    user,
    items,
    isLoading,
    isMutating,
    activeMutationItemId,
    activeCategory,
    setActiveCategory,
    handleBuy,
    handleEquip,
    handleStickyUnequip,
  } = useMarketplace();

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const isItemActive = useCallback(
    (item) => {
      if (!user?.profile) return false;
      if (item.category === "THEME")
        return user.profile.active_theme === item.item_data?.theme_key;
      if (item.category === "FONT")
        return user.profile.active_font === item.item_data?.font_family;
      if (item.category === "EFFECT")
        return (
          user.profile.active_effect === item.item_data?.effect_key ||
          user.profile.active_effect === item.item_data?.effect_type
        );
      if (item.category === "VICTORY")
        return (
          user.profile.active_victory === item.item_data?.victory_key ||
          user.profile.active_victory === item.item_data?.animation_type
        );
      return false;
    },
    [user],
  );

  const renderIcon = useCallback((iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.Package;
    return <Icon className="w-8 h-8" />;
  }, []);

  /* filteredItems removed - now handled by hook-level orchestration or correctly placed memo */

  return (
    <Skeleton name="marketplace-page" loading={isLoading && items.length === 0}>
      <div className="relative w-full pb-20 sm:pb-0 text-white flex flex-col pt-0 mt-0">
        {/* Controls & Category Tabs (Unified Row) */}
        <div className="sticky top-14 z-20 border-b border-[#1e1e1e] bg-[#0a0a0a]/92 backdrop-blur-xl">
          <div className="w-full px-4 sm:px-6 lg:px-8 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8 text-neutral-600 hover:text-white hover:bg-[#1c1c1c] shrink-0 -ml-1"
              >
                <ArrowLeft size={16} />
              </Button>

              <div className="w-px h-4 bg-[#222] shrink-0 hidden sm:block" />

              {/* Scrollable Tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-1 overflow-x-auto">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      title={cat.label}
                      className={`
                      flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border font-mono flex-1 sm:flex-none sm:whitespace-nowrap
                      ${
                        isActive
                          ? "bg-[#161616] text-white border-[#333] shadow-sm"
                          : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-[#111] hover:border-[#1a1a1a]"
                      }
                    `}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Get Credits Button */}
              <div className="shrink-0 ml-1">
                <button
                  onClick={() => navigate("/buy-xp")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0d] rounded-md border border-white/10 hover:bg-[#141414] hover:border-white/20 transition-colors"
                >
                  <Gem size={13} className="text-red-500 fill-red-500/20" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 min-w-0">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <Package size={32} className="opacity-30" />
              <p className="text-sm">No items in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const isActive = isItemActive(item);
                  const canAfford = user?.profile?.xp >= item.cost;
                  const isOwned = item.is_owned;

                  return (
                    <Motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`
                          rounded-lg overflow-hidden transition-all duration-300 group flex flex-col h-full bg-[#0d0d0d] border border-[#1a1a1a]
                          ${
                            isActive
                              ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                              : "hover:border-[#333] hover:bg-[#111]"
                          }
                        `}
                      >
                        {/* Icon/Preview */}
                        <div
                          className={`h-28 flex items-center justify-center border-b transition-colors relative shrink-0 ${isActive ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-black border-[#1a1a1a] group-hover:bg-[#080808]"}`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div
                              className={`${isActive ? "text-emerald-500" : "text-neutral-600 group-hover:text-neutral-400"}`}
                            >
                              {renderIcon(item.icon_name)}
                            </div>
                          )}

                          {/* Status Badges */}
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            {isOwned && (
                              <Badge
                                className={`text-[8px] px-1.5 py-0.5 rounded-sm border font-bold uppercase tracking-[0.1em] font-mono ${isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#1a1a1a] text-neutral-500 border-[#222]"}`}
                              >
                                {isActive ? "Equipped" : "Owned"}
                              </Badge>
                            )}
                          </div>

                          {/* Category Badge */}
                          <Badge
                            className={`absolute top-2 left-2 text-[7px] px-1 py-0.5 rounded-sm border font-bold uppercase tracking-[0.2em] font-mono ${isActive ? "bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20" : "bg-black/40 text-neutral-700 border-[#222]/20"}`}
                          >
                            {item.category}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-3">
                          <h3
                            className={`text-[11px] uppercase tracking-wider font-bold truncate font-mono ${isActive ? "text-emerald-400" : "text-neutral-300"}`}
                          >
                            {item.name}
                          </h3>
                          <p className="text-[9px] mt-1 line-clamp-2 leading-snug text-neutral-600 font-bold uppercase tracking-tight">
                            {item.description}
                          </p>
                        </div>

                        <div className="p-3.5 pt-0 mt-auto">
                          {isOwned ? (
                            <Button
                              className={`
                                w-full h-8 text-[9px] font-bold uppercase tracking-widest transition-all rounded-md font-mono
                                ${
                                  isActive
                                    ? "bg-transparent border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 shadow-none"
                                    : "bg-[#111] border border-[#222] text-neutral-500 hover:bg-[#161616] hover:text-neutral-200"
                                }
                              `}
                              onClick={() =>
                                isActive
                                  ? handleStickyUnequip(item.category)
                                  : handleEquip(item)
                              }
                            >
                              {isActive ? "Offline" : "Connect"}
                            </Button>
                          ) : (
                            <Button
                              className={`
                                  w-full h-8 text-[10px] font-bold tracking-widest transition-all border rounded-md font-mono
                                  ${
                                    canAfford
                                      ? "bg-white text-black border-[#1a1a1a] hover:bg-neutral-200"
                                      : "bg-black text-[#222] border-[#111] cursor-not-allowed shadow-none"
                                  }
                                `}
                              disabled={
                                !canAfford ||
                                (isMutating &&
                                  activeMutationItemId === item.id)
                              }
                              onClick={() => handleBuy(item)}
                            >
                              {isMutating &&
                              activeMutationItemId === item.id ? (
                                <span className="text-[8px] uppercase">
                                  Processing
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  {canAfford ? (
                                    <Gem
                                      size={12}
                                      className="text-red-500 fill-red-500/20"
                                    />
                                  ) : (
                                    <Lock size={10} className="opacity-20" />
                                  )}
                                  {item.cost.toLocaleString()}
                                </span>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card>
                    </Motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </Skeleton>
  );
});

MarketplacePage.displayName = "MarketplacePage";

export default MarketplacePage;
