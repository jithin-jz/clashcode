import { useState, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import useAuthStore from "../stores/useAuthStore";
import useMarketplaceStore from "../stores/useMarketplaceStore";

/**
 * Custom hook to encapsulate Marketplace logic.
 *
 * Performance: useShallow selectors on both stores prevent re-renders
 * when unrelated store slices change. All handlers are memoised with
 * useCallback for stable references to downstream components.
 */
export const useMarketplace = () => {
  const { user, setUser } = useAuthStore(
    useShallow((s) => ({ user: s.user, setUser: s.setUser })),
  );
  const {
    items,
    isLoading,
    isMutating,
    activeMutationItemId,
    fetchItems,
    purchaseItem,
    equipItem,
    unequipCategory,
  } = useMarketplaceStore(
    useShallow((s) => ({
      items: s.items,
      isLoading: s.isLoading,
      isMutating: s.isMutating,
      activeMutationItemId: s.activeMutationItemId,
      fetchItems: s.fetchItems,
      purchaseItem: s.purchaseItem,
      equipItem: s.equipItem,
      unequipCategory: s.unequipCategory,
    })),
  );

  const [activeCategory, setActiveCategory] = useState("THEME");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBuy = useCallback(
    async (item) => {
      if (!user || user.profile.xp < item.cost) return;

      const result = await purchaseItem(item.id);
      if (result.success) {
        const remainingXp = result.data?.remaining_xp;
        const latestUser = useAuthStore.getState().user;
        if (latestUser?.profile && typeof remainingXp === "number") {
          setUser({
            ...latestUser,
            profile: {
              ...latestUser.profile,
              xp: remainingXp,
            },
          });
        }
        toast.success(result.data.message || "Purchase successful.");
      } else {
        toast.error(result.error || "Purchase failed.");
      }
    },
    [user, purchaseItem, setUser],
  );

  const handleEquip = useCallback(
    async (item) => {
      const result = await equipItem(item.id);
      if (result.success) {
        const data = result.data || {};
        const latestUser = useAuthStore.getState().user;
        if (latestUser?.profile) {
          setUser({
            ...latestUser,
            profile: {
              ...latestUser.profile,
              ...(data.active_theme ? { active_theme: data.active_theme } : {}),
              ...(data.active_font ? { active_font: data.active_font } : {}),
              ...(data.active_effect
                ? { active_effect: data.active_effect }
                : {}),
              ...(data.active_victory
                ? { active_victory: data.active_victory }
                : {}),
            },
          });
        }
        toast.success(result.data.message || "Item equipped.");
      } else {
        toast.error(result.error || "Failed to equip item.");
      }
    },
    [equipItem, setUser],
  );

  const handleStickyUnequip = useCallback(
    async (category) => {
      const result = await unequipCategory(category);
      if (result.success) {
        const latestUser = useAuthStore.getState().user;
        if (latestUser?.profile) {
          setUser({
            ...latestUser,
            profile: {
              ...latestUser.profile,
              ...(category === "THEME" ? { active_theme: null } : {}),
              ...(category === "FONT" ? { active_font: null } : {}),
              ...(category === "EFFECT" ? { active_effect: null } : {}),
              ...(category === "VICTORY" ? { active_victory: null } : {}),
            },
          });
        }
        toast.success(result.data.message || "Item unequipped.");
      } else {
        toast.error(result.error || "Failed to unequip item.");
      }
    },
    [unequipCategory, setUser],
  );

  return {
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
  };
};
