(function (LG) {
  const slotIds = () => LG.EQUIPMENT_SLOTS.map((slot) => slot.id);
  const allItems = () => [
    ...LG.EQUIPMENT_ITEMS,
    ...(LG.saintItems?.equipmentItems?.() || []),
    ...(LG.blackMarket?.equipmentItems?.() || []),
    ...(LG.collectibles?.equipmentItems?.() || []),
    ...(LG.edenCharacters?.equipmentItems?.() || []),
    ...(LG.infernalClub?.equipmentItems?.() || []),
    ...(LG.penitentiary?.equipmentItems?.() || []),
  ];
  const itemMap = () => new Map(allItems().map((item) => [item.id, item]));
  const acquired = (item) => {
    if (item?.unlockReputation) {
      const reputation = Number(LG.authority?.snapshot?.()
        ?.economy?.infernalRealm?.reputation) || 0;
      return reputation >= item.unlockReputation;
    }
    return !item?.unlockTrait
      || Boolean(LG.traits?.isAtLeast?.(item.unlockTrait, item.unlockAt));
  };

  function emptyLoadout() {
    return Object.fromEntries(slotIds().map((id) => [id, null]));
  }

  function summary(state) {
    const items = itemMap();
    const equipped = slotIds().map((slot) => items.get(state.equipment?.[slot])).filter(Boolean);
    const setPrefix = equipped.length === slotIds().length
      && equipped.every((item) => item.prefix === equipped[0].prefix)
      ? equipped[0].prefix : null;
    const set = setPrefix
      ? LG.EQUIPMENT_SETS.find((entry) => entry.prefix === setPrefix) || { prefix: setPrefix }
      : null;
    const itemShame = equipped.reduce((total, item) => total + item.shame, 0);
    const saintSet = setPrefix === "圣徒礼赞";
    const edenSet = setPrefix === "伊甸园";
    const penitentiarySet = setPrefix === "影狱";
    const realmHunterSet = set?.id === "realm-hunter";
    const realmBlackKnightSet = set?.id === "realm-black-knight";
    const setBonus = set && !saintSet ? 100 : 0;
    return {
      count: equipped.length,
      itemShame,
      setBonus,
      saintSet,
      edenSet,
      penitentiarySet,
      realmHunterSet,
      realmBlackKnightSet,
      total: itemShame + setBonus,
      set,
      reduction: Math.floor((itemShame + setBonus) / 20) * 5,
    };
  }

  function recalculate(state) {
    state.stats = state.stats || {};
    const result = summary(state);
    const current = Math.max(0, Number(state.stats.shame) || 0);
    const stored = Number(state.equipmentShameApplied);
    const previous = Number.isFinite(stored) && stored >= 0
      ? stored : Math.min(current, result.total);
    state.stats.shame = Math.max(0, current - previous + result.total);
    state.equipmentShameApplied = result.total;
    return result;
  }

  LG.equipment = {
    emptyLoadout,
    normalizeState(state) {
      const validItems = itemMap();
      const saved = state.equipment && typeof state.equipment === "object"
        ? state.equipment : {};
      const equipped = new Set();
      state.equipment = Object.fromEntries(slotIds().map((slot) => {
        const item = validItems.get(saved[slot]);
        const valid = item && acquired(item) && (item.slot === slot || item.slot === "any")
          && !equipped.has(item.id);
        if (valid) equipped.add(item.id);
        return [slot, valid ? item.id : null];
      }));
      return recalculate(state);
    },
    items(slot, state) {
      const current = state?.equipment?.[slot];
      const usedElsewhere = new Set(slotIds()
        .filter((id) => id !== slot)
        .map((id) => state?.equipment?.[id])
        .filter(Boolean));
      return allItems().filter((item) =>
        (item.slot === slot || item.slot === "any")
        && acquired(item)
        && (item.id === current || !usedElsewhere.has(item.id)));
    },
    item(id) {
      return itemMap().get(id) || null;
    },
    canEquip(state, item) {
      return acquired(item)
        && (!item?.adult || (LG.blackMarket?.currentAge?.(state) || 0) >= 18);
    },
    equip(state, slot, itemId) {
      if (!slotIds().includes(slot)) return false;
      const item = itemId ? itemMap().get(itemId) : null;
      if (itemId && (!item || (item.slot !== slot && item.slot !== "any")
        || !this.canEquip(state, item))) return false;
      if (itemId && slotIds().some((id) => id !== slot && state.equipment[id] === itemId)) {
        return false;
      }
      state.equipment[slot] = item?.id || null;
      recalculate(state);
      return true;
    },
    summary,
    recalculate,
    requirementReduction(state) {
      return Math.floor(Math.max(0, Number(state?.stats?.shame) || 0) / 20) * 5;
    },
  };
})(window.LifeGame);
