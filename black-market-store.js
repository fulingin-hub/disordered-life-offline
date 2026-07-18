(function (LG) {
  const meta = LG.BLACK_MARKET_DATA;
  let data;
  let saveQueue = Promise.resolve();

  function emptyData() {
    return {
      version: 13,
      kneels: { japan: 0, usa: 0 },
      recordedRuns: { japan: [], usa: [] },
      conversations: { japanOfficial: [], usaOfficial: [] },
      daily: { japan: null, usa: null },
      equipment: [],
      potions: [],
      uses: {},
      bonusPotionUses: {},
      potionRuns: [],
      usageTotals: {
        holyWater: 0, goldenSacrament: 0, usaDrugs: 0, healthZeroFromSpecials: 0,
      },
      roomUsage: {},
      galleryUnlocked: { japan: false, usa: false },
    };
  }

  function cleanArray(value, limit) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object").slice(-limit) : [];
  }

  function normalizeStockItem(item, country) {
    const normalized = LG.blackMarketPotions.normalize(item, country);
    return normalized.type === "equipment"
      ? { ...normalized, slot: normalized.slot || "any" }
      : normalized;
  }

  function normalizeEquipmentItem(item) {
    const normalized = LG.blackMarketUSAEquipment.normalizeOwned(item);
    return normalized.source === "blackMarket"
      ? { ...normalized, slot: "any" } : normalized;
  }

  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    ["japan", "usa"].forEach((country) => {
      next.kneels[country] = Math.max(0, Math.floor(Number(saved.kneels?.[country]) || 0));
      next.recordedRuns[country] = Array.isArray(saved.recordedRuns?.[country])
        ? saved.recordedRuns[country].filter((id) => typeof id === "string").slice(-200) : [];
      next.galleryUnlocked[country] = Boolean(saved.galleryUnlocked?.[country]);
      const daily = saved.daily?.[country];
      if (daily && typeof daily.date === "string" && Array.isArray(daily.stock)) {
        next.daily[country] = {
          date: daily.date,
          stock: cleanArray(daily.stock, 24)
            .map((item) => normalizeStockItem(item, country)),
          sold: Array.isArray(daily.sold) ? daily.sold.filter((id) => typeof id === "string") : [],
          refreshes: Math.max(0, Math.min(3,
            Math.floor(Number(daily.refreshes) || 0))),
        };
      }
    });
    Object.keys(next.conversations).forEach((id) => { next.conversations[id] = []; });
    next.equipment = cleanArray(saved.equipment, 300).map(normalizeEquipmentItem);
    next.potions = cleanArray(saved.potions, 100).map((savedItem) => ({
      ...LG.blackMarketPotions.normalize(savedItem, savedItem.country),
      quantity: Math.max(0, Math.floor(Number(savedItem.quantity) || 0)),
    }));
    next.uses = saved.uses && typeof saved.uses === "object" ? saved.uses : {};
    Object.entries(saved.bonusPotionUses || {}).slice(-2500).forEach(([runId, uses]) => {
      if (typeof runId !== "string" || !uses || typeof uses !== "object"
        || Array.isArray(uses)) return;
      const byPotion = {};
      Object.entries(uses).slice(-100).forEach(([effectKey, count]) => {
        if (typeof effectKey !== "string") return;
        byPotion[effectKey] = Math.max(0, Math.min(10,
          Math.floor(Number(count) || 0)));
      });
      if (Object.keys(byPotion).length) next.bonusPotionUses[runId] = byPotion;
    });
    next.potionRuns = [...new Set(Array.isArray(saved.potionRuns)
      ? saved.potionRuns : [])]
      .filter((id) => typeof id === "string").slice(-2500);
    Object.keys(next.usageTotals).forEach((key) => {
      next.usageTotals[key] = Math.max(0, Math.floor(Number(saved.usageTotals?.[key]) || 0));
    });
    Object.entries(saved.roomUsage || {}).slice(0, 100).forEach(([id, usage]) => {
      if (!/^[A-Za-z][A-Za-z0-9-]{0,39}$/.test(id)
        || !usage || typeof usage !== "object") return;
      next.roomUsage[id] = {};
      Object.entries(usage).slice(0, 20).forEach(([kind, count]) => {
        next.roomUsage[id][kind] = Math.max(0,
          Math.floor(Number(count) || 0));
      });
    });
    return next;
  }

  function characterMeta(id) {
    return meta.characters[id] || null;
  }

  LG.blackMarket = {
    async init() {
      const saved = await LG.storage.loadBlackMarket();
      data = normalize(saved);
      const refreshed = this.refreshDaily();
      if (saved?.version !== data.version || refreshed) {
        LG.loader.defer(() => this.save());
      }
    },
    _data() {
      return data;
    },
    characters() {
      return Object.values(meta.characters);
    },
    isCharacter(id) {
      return Boolean(characterMeta(id));
    },
    country(id) {
      return characterMeta(id)?.country || null;
    },
    kneelingCount(id) {
      const country = this.country(id) || id;
      return data?.kneels?.[country] || 0;
    },
    milestones() {
      return meta.milestones;
    },
    currentMedal(id) {
      const count = this.kneelingCount(id);
      return [...meta.milestones].reverse().find((item) => count >= item.count) || null;
    },
    roomUnlocked(id) {
      return this.isCharacter(id)
        && (LG.TEST_MODE?.unlockAllRooms || LG.traits.isAtLeast("foreign", 30));
    },
    galleryUnlocked(id) {
      const country = this.country(id) || id;
      return Boolean(data?.galleryUnlocked?.[country]);
    },
    canChat(id) {
      return this.roomUnlocked(id)
        && (LG.TEST_MODE?.unlockAllRooms || this.kneelingCount(id) >= 30);
    },
    purchaseLimit(id) {
      const count = this.kneelingCount(id);
      return count >= 30 ? 10 : count >= 20 ? 6 : count >= 10 ? 3 : count >= 1 ? 1 : 0;
    },
    recordChoice(event, choice, state) {
      const galleryCountry = event?.id === "japan-official-introduction"
        ? "japan" : event?.id === "usa-official-introduction" ? "usa" : null;
      if (galleryCountry && choice?.tags?.includes(`${galleryCountry}_official_gallery_unlocked`)
        && !data.galleryUnlocked[galleryCountry]) {
        data.galleryUnlocked[galleryCountry] = true;
        return { country: galleryCountry, galleryUnlocked: true };
      }
      if (event?.id !== "foreign-leader-meeting"
        || !choice?.tags?.includes("leader_kneeling_bound")) return null;
      const country = state.route === "japan" || state.route === "usa" ? state.route : null;
      if (!country || data.recordedRuns[country].includes(state.runId)) return null;
      data.kneels[country] += 1;
      data.recordedRuns[country].push(state.runId);
      data.recordedRuns[country] = data.recordedRuns[country].slice(-200);
      this.refreshDaily(country);
      const milestone = meta.milestones.find((item) => item.count === data.kneels[country]);
      return { country, count: data.kneels[country], milestone };
    },
    progressMessage(result) {
      if (!result) return "";
      const place = result.country === "japan" ? "岛国" : "米国";
      if (result.galleryUnlocked) return `${place}女高官角色画廊已永久解锁。`;
      return result.milestone
        ? `勋章激活：${result.milestone.label}（${result.milestone.benefit}）`
        : `向${place}虚构国家领导人下跪累计 ${result.count} 次`;
    },
    conversation(id) {
      return data.conversations[id] || [];
    },
    appendConversation(id, userText, response) {
      const history = data.conversations[id] || [];
      history.push({ role: "user", content: userText }, { role: "assistant", content: response });
      data.conversations[id] = history.length >= 40 ? [] : history;
    },
    aiState(id, gameState) {
      return {
        stats: gameState.stats,
        studyAbroad: gameState.studyAbroad,
        conversations: { [id]: this.conversation(id) },
        chatUsage: {},
      };
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveBlackMarket(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
