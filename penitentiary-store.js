(function (LG) {
  let data;
  const empty = () => ({
    zeroedPoints: 0, edenPurchases: 0, coupons: 0, lifetimeCoupons: 0,
    spentByRole: {}, specialCompletions: {}, personality: 0, owned: [], boards: {},
    personalityRuns: [], potionFreeRuns: [], temptationFreeRuns: [],
    trueRedemptionEarned: false, healthyLifeEarned: false,
    rejectTemptationEarned: false,
    equippedOutfit: false,
    outfitEndingTriggered: false,
    controlMilestonesResolved: 0, controlAcceptances: 0,
    controlChoicePending: false,
  });
  function normalize(saved) {
    const next = { ...empty(), ...(saved || {}) };
    const legacy = Math.floor(Number(saved?.version) || 0) < 5;
    const legacyControl = Math.floor(Number(saved?.version) || 0) < 6;
    next.version = 7;
    next.owned = Array.isArray(next.owned) ? next.owned : [];
    next.spentByRole = next.spentByRole || {};
    next.specialCompletions = next.specialCompletions || {};
    next.personality = Math.max(0, Number(next.personality) || 0);
    ["personalityRuns", "potionFreeRuns", "temptationFreeRuns"].forEach((key) => {
      next[key] = [...new Set(Array.isArray(next[key]) ? next[key] : [])]
        .filter((id) => typeof id === "string").slice(-2500);
    });
    next.trueRedemptionEarned = saved?.trueRedemptionEarned === true;
    next.healthyLifeEarned = saved?.healthyLifeEarned === true;
    next.rejectTemptationEarned = saved?.rejectTemptationEarned === true;
    next.controlMilestonesResolved = legacyControl
      ? Math.floor(Math.max(0, Number(next.lifetimeCoupons) || 0) / 500)
      : Math.max(0, Math.floor(Number(next.controlMilestonesResolved) || 0));
    next.controlAcceptances =
      Math.max(0, Math.floor(Number(next.controlAcceptances) || 0));
    next.controlChoicePending =
      !legacyControl && saved?.controlChoicePending === true;
    next.boards = next.boards || {};
    next.equippedOutfit = next.equippedOutfit === true
      && LG.PENITENTIARY_DATA.roles.every((role) =>
        next.owned.includes(role.outfit.id));
    next.outfitEndingTriggered = saved?.outfitEndingTriggered === true
      || (legacy && LG.PENITENTIARY_DATA.roles.every((role) =>
        next.owned.includes(role.outfit.id)));
    return next;
  }
  function hidden(id) {
    return LG.authority.archiveView("male").some((item) => !item.locked && item.id === id)
      || LG.authority.archiveView("female").some((item) => !item.locked && item.id === id);
  }
  LG.penitentiary = {
    async init() { data = normalize(await LG.storage.loadPenitentiary()); },
    access() {
      const paradise = LG.blackPrison.access().allowed;
      const apex = hidden("black-prison-apex");
      const infernal = hidden("black-prison-infernal");
      const testing = LG.TEST_MODE?.unlockAllRooms;
      const cinemaAccess = LG.authority.snapshot()?.life?.gameMode === "simulation"
        && LG.authority.snapshot()?.lifeCinema?.simulationMaps?.allUnlocked === true;
      return {
        allowed: testing || cinemaAccess || (paradise && data.zeroedPoints >= 50
          && data.edenPurchases >= 10 && apex && infernal),
        paradise, apex, infernal,
        zeroedPoints: data.zeroedPoints, edenPurchases: data.edenPurchases,
      };
    },
    coupons() { return data.coupons; },
    lifetime() { return data.lifetimeCoupons; },
    spentTotal() {
      return Object.values(data.spentByRole)
        .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    },
    personality() { return data.personality; },
    specialProgress() {
      const ids = ["clean-street", "serve-feeding", "serve-chef",
        "night-watch", "owner-assistant"];
      return Math.min(...ids.map((id) =>
        Math.max(0, Number(data.specialCompletions[id]) || 0)));
    },
    ownedIds() {
      const authoritative = LG.authority.snapshot()?.economy?.penitentiary?.owned;
      return Array.isArray(authoritative) ? authoritative : data.owned;
    },
    owns(id) { return this.ownedIds().includes(id); },
    spent(role) { return Number(data.spentByRole[role]) || 0; },
    stageUnlocked(stage) {
      if (!this.access().allowed) return false;
      if (stage === 1 || LG.TEST_MODE?.unlockAllRooms) return true;
      const role = LG.PENITENTIARY_DATA.roles[stage - 2];
      return data.lifetimeCoupons >= role.lifetime && this.spent(role.id) >= role.spend;
    },
    board(stage) { return data.boards[stage] || { round: 0, tasks: [] }; },
    certificate(stage) {
      return this.owns(LG.PENITENTIARY_DATA.roles[stage - 1].certificate);
    },
    galleryUnlocked(id) {
      const role = LG.PENITENTIARY_DATA.byId[id];
      return Boolean(role && this.owns(role.certificate));
    },
    collectionComplete(id) {
      const role = LG.PENITENTIARY_DATA.byId[id];
      return Boolean(role && role.items.every((item) => this.owns(item.id)));
    },
    equipmentItems() {
      return LG.PENITENTIARY_DATA.roles.flatMap((role, index) =>
        !this.owns(role.certificate) ? [] : [{
          id: role.certificate,
          source: "penitentiaryCertificate",
          setId: "penitentiaryPolice",
          prefix: "影狱",
          slot: LG.EQUIPMENT_SLOTS[index].id,
          name: `被${role.name}认可的奖状`,
          shame: 20,
          adult: true,
        }]);
    },
    policeSetEquipped(state = LG.authority.state()) {
      return LG.PENITENTIARY_DATA.roles.every((role, index) =>
        state?.equipment?.[LG.EQUIPMENT_SLOTS[index].id] === role.certificate);
    },
    itemPrice(id, item) {
      if (item?.type !== "consumable") {
        return LG.infernalChurch.price(item?.price || 0);
      }
      if (this.policeSetEquipped()) return 0;
      const price = this.collectionComplete(id)
        ? LG.PENITENTIARY_DATA.prices.premium : LG.PENITENTIARY_DATA.prices.item;
      return LG.infernalChurch.price(price);
    },
    consumableQuantity(id, itemId) {
      const key = `penitentiary-${id}-${itemId.split("-").slice(-2).join("-")}`;
      const item = LG.blackMarket._data()?.potions.find((entry) => entry.effectKey === key);
      return Math.max(0, Number(item?.quantity) || 0);
    },
    consumableUsage(id, itemId) {
      const kind = itemId.endsWith("holy-water") ? "water"
        : itemId.endsWith("golden-sacrament") ? "gold"
          : itemId.endsWith("despair-drug") ? "despair" : null;
      return kind ? Math.max(0, Math.floor(Number(
        LG.blackMarket._data()?.roomUsage?.[id]?.[kind],
      ) || 0)) : 0;
    },
    consumableAllowance(id, itemId) {
      const suffix = itemId.slice(id.length + 1);
      return LG.blackMarket.potionAllowance(
        `penitentiary-potion-${id}-${suffix}`,
        LG.authority.state(),
      );
    },
    controlPending() { return data.controlChoicePending === true; },
    controlAcceptances() { return data.controlAcceptances; },
    canChat(id) {
      const role = LG.PENITENTIARY_DATA.byId[id];
      return Boolean(role && this.stageUnlocked(role.stage)
        && this.galleryUnlocked(id));
    },
    chatCost(id) {
      return this.collectionComplete(id)
        ? LG.PENITENTIARY_DATA.prices.chatPremium : LG.PENITENTIARY_DATA.prices.chat;
    },
    chatPass(id) {
      const pass = LG.authority.snapshot()?.economy?.dialoguePasses?.[id];
      return Math.max(0, Math.min(20, Math.floor(Number(pass?.remaining) || 0)));
    },
    chatStatus(id) {
      const remaining = this.chatPass(id);
      return remaining
        ? `赎罪卷对话周期剩余 ${remaining}/20 轮。`
        : `消耗 ${this.chatCost(id)} 点赎罪卷可开启 20 轮 AI 对话。`;
    },
    outfitComplete() {
      return LG.PENITENTIARY_DATA.roles.every((role) => this.owns(role.outfit.id));
    },
    outfitEquipped() { return data.equippedOutfit === true && this.outfitComplete(); },
    aiState(id, state) {
      const role = LG.PENITENTIARY_DATA.byId[id];
      return {
        ...state,
        penitentiaryStats: {
          coupons: data.coupons, lifetime: data.lifetimeCoupons,
          stage: role?.stage || 1, spent: this.spent(id),
        },
      };
    },
  };
})(window.LifeGame);
