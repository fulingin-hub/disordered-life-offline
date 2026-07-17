(function (LG) {
  const memory = new Map();
  const authoritative = new Map();

  function localPut(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function localGet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        memory.set(key, value);
        return value;
      }
    } catch (_) {
      // Production sandbox frames may reject localStorage.
    }
    return memory.has(key) ? memory.get(key) : null;
  }

  async function put(key, value) {
    const localSaved = localPut(key, value);
    if (authoritative.has(key)) {
      authoritative.set(key, value);
      return { localSaved, remoteSaved: true };
    }
    let remoteSaved = false;
    try {
      remoteSaved = Boolean(await LG.storageChat?.put(key, value));
    } catch (err) {
      console.warn("存档写入降级为当前页面内存:",
        err?.code, err?.message, err?.stack);
    }
    if (!localSaved && !remoteSaved) {
      const error = new Error("存档未写入任何持久化存储");
      error.code = "STORAGE_UNAVAILABLE";
      throw error;
    }
    return { localSaved, remoteSaved };
  }

  async function get(key) {
    if (authoritative.has(key)) return authoritative.get(key);
    try {
      const remote = await LG.storageChat?.get(key);
      if (remote !== null && remote !== undefined) {
        localPut(key, remote);
        return remote;
      }
    } catch (err) {
      console.warn("存档读取降级为当前页面内存:",
        err?.code, err?.message, err?.stack);
    }
    return localGet(key);
  }

  LG.storage = {
    seedAuthority(snapshot) {
      const economy = snapshot?.economy || {};
      [
        [LG.CONFIG.stateKey, snapshot?.life],
        [LG.CONFIG.archiveKey, snapshot?.archive],
        [LG.CONFIG.achievementKey, economy.achievements],
        [LG.CONFIG.traitKey, economy.traits],
        [LG.CONFIG.collectibleKey, economy.collectibles],
        [LG.CONFIG.tributeKey, economy.tribute],
        [LG.CONFIG.dailyTaskKey, economy.dailyTasks],
        [LG.CONFIG.blackMarketKey, economy.blackMarket],
        [LG.CONFIG.casinoKey, economy.casino],
        [LG.CONFIG.blackPrisonKey, economy.blackPrison],
        [LG.CONFIG.penitentiaryKey, economy.penitentiary],
      ].forEach(([key, value]) => {
        if (key && value !== undefined) {
          memory.set(key, value);
          authoritative.set(key, value);
        }
      });
    },
    saveState(state) {
      return put(LG.CONFIG.stateKey, state);
    },
    loadState() {
      return get(LG.CONFIG.stateKey);
    },
    async clearState() {
      memory.delete(LG.CONFIG.stateKey);
      try {
        localStorage.removeItem(LG.CONFIG.stateKey);
      } catch (_) {
        // Ignore unavailable localStorage.
      }
      await LG.storageChat?.remove(LG.CONFIG.stateKey);
    },
    loadArchive() {
      return get(LG.CONFIG.archiveKey);
    },
    saveArchive(ids) {
      return put(LG.CONFIG.archiveKey, ids);
    },
    loadAchievements() {
      return get(LG.CONFIG.achievementKey);
    },
    saveAchievements(data) {
      return put(LG.CONFIG.achievementKey, data);
    },
    loadTraits() {
      return get(LG.CONFIG.traitKey);
    },
    saveTraits(data) {
      return put(LG.CONFIG.traitKey, data);
    },
    loadCollectibles() {
      return get(LG.CONFIG.collectibleKey);
    },
    saveCollectibles(data) {
      return put(LG.CONFIG.collectibleKey, data);
    },
    loadTribute() {
      return get(LG.CONFIG.tributeKey);
    },
    saveTribute(data) {
      return put(LG.CONFIG.tributeKey, data);
    },
    loadDailyTasks() {
      return get(LG.CONFIG.dailyTaskKey);
    },
    saveDailyTasks(data) {
      return put(LG.CONFIG.dailyTaskKey, data);
    },
    loadHiddenEnding() {
      return get(LG.CONFIG.hiddenEndingKey);
    },
    saveHiddenEnding(data) {
      return put(LG.CONFIG.hiddenEndingKey, data);
    },
    loadBlackMarket() {
      return get(LG.CONFIG.blackMarketKey);
    },
    saveBlackMarket(data) {
      return put(LG.CONFIG.blackMarketKey, data);
    },
    loadCasino() {
      return get(LG.CONFIG.casinoKey);
    },
    saveCasino(data) {
      return put(LG.CONFIG.casinoKey, data);
    },
    loadBlackPrison() {
      return get(LG.CONFIG.blackPrisonKey);
    },
    saveBlackPrison(data) {
      return put(LG.CONFIG.blackPrisonKey, data);
    },
    loadPenitentiary() {
      return get(LG.CONFIG.penitentiaryKey);
    },
    savePenitentiary(data) {
      return put(LG.CONFIG.penitentiaryKey, data);
    },
  };
})(window.LifeGame);
