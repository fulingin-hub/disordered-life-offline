(function (LG) {
  function data() {
    return LG.authority?.snapshot?.()?.economy?.vehicleShop || {
      unlocked: false, spent: 0, owned: [], equipped: null,
    };
  }

  function balances() {
    const economy = LG.authority?.snapshot?.()?.economy || {};
    return {
      points: Math.max(0, Number(economy.traits?.points) || 0),
      achievement: Math.max(0, Number(economy.achievementPoints?.balance) || 0),
      coupons: Math.max(0, Number(economy.penitentiary?.coupons) || 0),
      personality: Math.max(0, Number(economy.penitentiary?.personality) || 0),
    };
  }

  function tier() {
    const spent = Math.max(0, Number(data().spent) || 0);
    const unlocked = LG.VEHICLE_DATA.vipTiers.filter((item) =>
      spent >= item.threshold);
    return unlocked[unlocked.length - 1] || null;
  }

  function nextTier() {
    const spent = Math.max(0, Number(data().spent) || 0);
    return LG.VEHICLE_DATA.vipTiers.find((item) => spent < item.threshold) || null;
  }

  LG.vehicleStore = {
    data,
    balances,
    access() {
      const current = balances();
      return {
        allowed: data().unlocked === true,
        values: current,
        best: Math.max(...Object.values(current)),
      };
    },
    spent() {
      return Math.max(0, Number(data().spent) || 0);
    },
    tier,
    nextTier,
    discount() {
      return tier()?.discount || 0;
    },
    price(item) {
      return Math.ceil(item.price * (100 - this.discount()) / 100);
    },
    owns(id) {
      return data().owned.includes(id);
    },
    equipped() {
      return LG.VEHICLE_DATA.byId[data().equipped] || null;
    },
    riderAsset(store, gender) {
      const meta = LG.VEHICLE_DATA.stores[store];
      const key = meta?.rider?.[gender === "female" ? "female" : "male"];
      return key ? LG.CONFIG.assets[key] : "";
    },
    mountedAsset(item, gender) {
      if (!item) return "";
      if (item.store === "reputation") {
        return this.riderAsset(item.store, gender);
      }
      let family = item.family;
      if (item.id === "points-otherworld-male") family = "otherworld-male";
      if (item.id === "points-otherworld-female") family = "otherworld-female";
      if (item.id === "achievement-lost-griffin") family = "lost-griffin";
      if (item.id === "achievement-reborn-phoenix") family = "reborn-phoenix";
      const key = `mounted-${item.store}-${family}-${
        gender === "female" ? "female" : "male"}`;
      return LG.CONFIG.assets[key] || "";
    },
  };
})(window.LifeGame);
