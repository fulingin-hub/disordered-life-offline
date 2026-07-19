(function (LG) {
  const threshold = 100;
  const definitions = LG.TRAIT_DEFINITIONS;
  const tiers = LG.TRAIT_TIERS;
  const baseIds = ["feet", "humiliation", "control", "tribute", "foreign"];
  let data;
  let saveQueue = Promise.resolve();

  function emptyData() {
    return {
      version: 3,
      points: 0,
      lifetimePoints: 0,
      values: Object.fromEntries(Object.keys(definitions).map((id) => [id, 0])),
      equipped: null,
      rewardedRuns: [],
    };
  }
  function highestUnlocked(id, value) {
    if (!definitions[id]) return null;
    const unlocked = traitTiers(id).filter((tier) => value >= tier.value);
    return unlocked[unlocked.length - 1] || null;
  }
  function traitTiers(id) {
    const allowed = definitions[id]?.titleTiers;
    return tiers.filter((tier) => !allowed || allowed.includes(tier.value));
  }
  function despairAvailable(values = data?.values) {
    return Boolean(values && (values.despair > 0
      || baseIds.every((id) => values[id] >= threshold)));
  }
  function normalizeEquipped(saved, values) {
    const raw = saved?.equipped;
    if (typeof raw === "string") {
      const tier = highestUnlocked(raw, values[raw]);
      return tier ? { id: raw, tier: tier.value } : null;
    }
    if (!raw || typeof raw !== "object") return null;
    const tier = tiers.find((item) => item.value === Number(raw.tier));
    return definitions[raw.id] && tier && values[raw.id] >= tier.value
      ? { id: raw.id, tier: tier.value } : null;
  }
  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    next.points = Math.max(0, Math.floor(Number(saved.points) || 0));
    next.lifetimePoints = Math.max(next.points,
      Math.floor(Number(saved.lifetimePoints) || 0));
    Object.keys(definitions).forEach((id) => {
      next.values[id] = Math.max(0, Math.min(threshold,
        Math.floor(Number(saved.values?.[id]) || 0)));
    });
    next.rewardedRuns = Array.isArray(saved.rewardedRuns)
      ? saved.rewardedRuns.filter((id) => typeof id === "string").slice(-200) : [];
    next.equipped = normalizeEquipped(saved, next.values);
    return next;
  }

  function unlockedTitles() {
    return Object.entries(definitions).flatMap(([id, meta]) =>
      traitTiers(id).filter((tier) => data.values[id] >= tier.value).map((tier) => ({
        id,
        tier: tier.value,
        title: meta.titles[tier.value],
        attitude: tier.label,
      })));
  }

  function unlockedEquipment() {
    return (LG.EQUIPMENT_ITEMS || []).filter((item) =>
      data.values[item.unlockTrait] >= item.unlockAt);
  }

  function isTierUnlocked(id, tier) {
    return Boolean(definitions[id] && traitTiers(id).some((item) => item.value === tier)
      && data.values[id] >= tier);
  }

  LG.traits = {
    definitions,
    tiers,
    async init() {
      data = normalize(await LG.storage.loadTraits());
    },
    all() {
      return Object.entries(definitions).map(([id, meta]) => ({
        id,
        ...meta,
        value: data.values[id],
        threshold,
        available: id !== "despair" || despairAvailable(),
        unlockHint: id === "despair" && !despairAvailable()
          ? "需要先将前五项属性全部提升至100。" : "",
        unlocked: data.values[id] >= traitTiers(id)[0].value,
        tiers: traitTiers(id).map((tier) => ({
          ...tier,
          title: meta.titles[tier.value],
          unlocked: data.values[id] >= tier.value,
          equipped: data.equipped?.id === id && data.equipped?.tier === tier.value,
        })),
      }));
    },
    points() {
      return data.points;
    },
    lifetimePoints() {
      return data.lifetimePoints;
    },
    value(id) {
      return data.values[id] || 0;
    },
    isAtLeast(id, minimum) {
      return this.value(id) >= minimum;
    },
    active() {
      const equipped = data.equipped;
      if (!equipped || !isTierUnlocked(equipped.id, equipped.tier)) return null;
      const meta = definitions[equipped.id];
      const tier = tiers.find((item) => item.value === equipped.tier);
      return {
        id: equipped.id,
        tier: tier.value,
        title: meta.titles[tier.value],
        label: meta.label,
        attitude: tier.label,
        fallback: meta.fallback || tier.fallback,
      };
    },
    recordEnding(state) {
      if (!state?.endingId || !state.runId || state.traitRewardRecorded
        || data.rewardedRuns.includes(state.runId)) return null;
      state.traitRewardRecorded = true;
      data.points += 10;
      data.lifetimePoints += 10;
      data.rewardedRuns.push(state.runId);
      data.rewardedRuns = data.rewardedRuns.slice(-200);
      return { points: 10, total: data.points };
    },
    rewardText(result) {
      return result ? `人生结算：获得 ${result.points} 点性癖属性点` : "";
    },
    addPoints(amount) {
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      data.points += value;
      data.lifetimePoints += value;
      return data.points;
    },
    spendPoints(amount) {
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (!value || data.points < value) return false;
      data.points -= value;
      return true;
    },
    allocate(changes) {
      const entries = Object.entries(changes || {});
      const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
      const nextValues = { ...data.values };
      entries.forEach(([id, amount]) => {
        if (definitions[id] && Number.isInteger(amount)) nextValues[id] += amount;
      });
      const valid = entries.length > 0 && total <= data.points
        && entries.every(([id, amount]) => definitions[id]
          && Number.isInteger(amount) && amount !== 0
          && nextValues[id] >= 0 && nextValues[id] <= threshold)
        && (nextValues.despair <= 0 || despairAvailable(nextValues));
      if (!valid) return { ok: false, message: "分配方案无效，请重新调整。" };
      const before = new Set(unlockedTitles().map((item) => `${item.id}:${item.tier}`));
      const beforeEquipment = new Set(unlockedEquipment().map((item) => item.id));
      entries.forEach(([id, amount]) => { data.values[id] += amount; });
      data.points -= total;
      if (data.equipped && !isTierUnlocked(data.equipped.id, data.equipped.tier)) {
        data.equipped = null;
      }
      const unlocked = unlockedTitles().filter((item) => !before.has(`${item.id}:${item.tier}`));
      const equipmentUnlocked = unlockedEquipment()
        .filter((item) => !beforeEquipment.has(item.id));
      return { ok: true, spent: total, unlocked, equipmentUnlocked };
    },
    equip(id, tier) {
      if (id === null) {
        data.equipped = null;
        return true;
      }
      const selected = tier || highestUnlocked(id, data.values[id])?.value;
      if (!isTierUnlocked(id, selected)) return false;
      data.equipped = { id, tier: selected };
      return true;
    },
    fallbackLead() {
      return this.active()?.fallback || "";
    },
    isDespairComplete() {
      return data.values.despair >= threshold && despairAvailable();
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveTraits(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
