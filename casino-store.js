(function (LG) {
  const ids = () => LG.CASINO_DATA.characters.map((item) => item.id);
  let data;
  let saveQueue = Promise.resolve();

  function emptyData() {
    return {
      version: 3,
      completedLives: 0,
      recordedLifeRuns: [],
      wins: 0,
      losses: 0,
      bossesPlayed: 0,
      bossWins: 0,
      unlockedEndings: [],
      owned: [],
      conversations: Object.fromEntries(ids().map((id) => [id, []])),
    };
  }

  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    next.completedLives = Math.max(0, Math.floor(Number(saved.completedLives) || 0));
    next.recordedLifeRuns = Array.isArray(saved.recordedLifeRuns)
      ? saved.recordedLifeRuns.filter((id) => typeof id === "string").slice(-200)
      : [];
    next.wins = Math.max(0, Math.floor(Number(saved.wins) || 0));
    next.losses = Math.max(0, Math.floor(Number(saved.losses) || 0));
    next.bossesPlayed = Math.max(0, Math.floor(Number(saved.bossesPlayed) || 0));
    next.bossWins = Math.min(next.bossesPlayed,
      Math.max(0, Math.floor(Number(saved.bossWins) || 0)));
    next.unlockedEndings = [...new Set(Array.isArray(saved.unlockedEndings)
      ? saved.unlockedEndings.filter((id) => typeof id === "string") : [])];
    const validItems = new Set(LG.CASINO_DATA.characters.flatMap((item) =>
      item.items.map((entry) => entry.id)));
    next.owned = [...new Set(Array.isArray(saved.owned) ? saved.owned : [])]
      .filter((id) => validItems.has(id));
    ids().forEach((id) => { next.conversations[id] = []; });
    return next;
  }

  function meta(id) {
    return LG.CASINO_DATA.byId[id] || null;
  }

  function metric(character) {
    return character.unlockMetric === "wins" ? data.wins : data.losses;
  }

  LG.casino = {
    async init() { data = normalize(await LG.storage.loadCasino()); },
    completedLives() { return data.completedLives; },
    accessUnlocked() { return LG.TEST_MODE?.unlockAllRooms || data.completedLives >= 50; },
    recordLife(state) {
      if (!state?.endingId || !state.runId || data.recordedLifeRuns.includes(state.runId)) {
        return null;
      }
      const unlockedBefore = this.accessUnlocked();
      data.completedLives += 1;
      data.recordedLifeRuns.push(state.runId);
      data.recordedLifeRuns = data.recordedLifeRuns.slice(-200);
      return { count: data.completedLives, unlocked: !unlockedBefore && this.accessUnlocked() };
    },
    ensureCompletedLives(minimum) {
      const value = Math.max(0, Math.floor(Number(minimum) || 0));
      if (value <= data.completedLives) return false;
      data.completedLives = value;
      return true;
    },
    isCharacter(id) { return Boolean(meta(id)); },
    wins() { return data.wins; },
    losses() { return data.losses; },
    characters() {
      return LG.CASINO_DATA.characters.map((character) => ({
        ...character,
        count: metric(character),
        unlocked: LG.TEST_MODE?.unlockAllRooms || metric(character) >= character.unlockAt,
        progress: LG.TEST_MODE?.unlockAllRooms ? 1 : Math.min(1, metric(character) / character.unlockAt),
      }));
    },
    unlocked(id) {
      const character = meta(id);
      return Boolean(character && (LG.TEST_MODE?.unlockAllRooms || metric(character) >= character.unlockAt));
    },
    unlockText(id) {
      const character = meta(id);
      if (!character) return "角色不存在";
      const count = metric(character);
      const label = character.unlockMetric === "wins" ? "累计胜利" : "累计失败";
      return `${label} ${count}/${character.unlockAt}`;
    },
    items(id) { return meta(id)?.items || []; },
    owns(itemId) { return data.owned.includes(itemId); },
    progress(id) {
      const items = this.items(id);
      const count = items.filter((item) => this.owns(item.id)).length;
      const testing = LG.TEST_MODE?.unlockAllRooms;
      return { count: testing ? items.length : count, total: items.length,
        complete: testing || (items.length > 0 && count === items.length) };
    },
    canChat(id) { return this.unlocked(id) && this.progress(id).complete; },
    galleryUnlocked(id) { return this.canChat(id); },
    insiderRound(round) {
      if (round <= 3) return this.owns("casinoBunny-patron-note");
      if (round <= 7) return this.owns("casinoLead-scorn-photo");
      return this.owns("casinoManager-humiliation-card");
    },
    bossTarget() { return (data.bossesPlayed + 1) * 20; },
    bossPending() {
      return this.owns("casinoOwner-private-contact") || data.wins >= this.bossTarget();
    },
    endingUnlocked(id) { return data.unlockedEndings.includes(id); },
    claimEnding(id) {
      if (data.unlockedEndings.includes(id)) return false;
      data.unlockedEndings.push(id);
      return true;
    },
    settle(won, stake, boss) {
      const before = new Set(this.characters()
        .filter((character) => character.unlocked).map((character) => character.id));
      if (won) {
        LG.traits.addPoints(stake);
        data.wins += 1;
      } else if (!LG.traits.spendPoints(stake)) {
        return { ok: false, message: `属性点不足，需要${stake}点。` };
      } else {
        data.losses += 1;
      }
      if (boss) {
        data.bossesPlayed += 1;
        if (won) data.bossWins += 1;
      }
      const unlocked = this.characters()
        .filter((character) => character.unlocked && !before.has(character.id))
        .map((character) => character.name);
      return {
        ok: true,
        won,
        stake,
        boss,
        wins: data.wins,
        losses: data.losses,
        points: LG.traits.points(),
        bossWins: data.bossWins,
        bossLosses: data.bossesPlayed - data.bossWins,
        unlocked,
      };
    },
    buy(characterId, itemId) {
      const character = meta(characterId);
      if (!character || !this.unlocked(characterId)) {
        return { ok: false, message: "需要先达到该角色的累计胜负条件。" };
      }
      const item = character.items.find((entry) => entry.id === itemId);
      if (!item) return { ok: false, message: "商品不存在。" };
      if (this.owns(itemId)) return { ok: false, message: "该商品已经拥有。" };
      if (item.insider && !this.insiderAvailable(characterId)) {
        return { ok: false, message: "购买四件基础商品后才可购买内幕商品。" };
      }
      if (!LG.traits.spendPoints(item.price)) {
        return { ok: false, message: `属性点不足，需要${item.price}点。` };
      }
      data.owned.push(itemId);
      const progress = this.progress(characterId);
      const insiderUnlocked = !item.insider && this.insiderAvailable(characterId);
      return {
        ok: true,
        item,
        progress,
        message: progress.complete
          ? `已买光${character.name}的个人商店，AI对话与画廊已解锁。`
          : insiderUnlocked
            ? "四件基础商品已集齐，内幕商品购买资格已解锁。"
            : `已购买${item.name}（${progress.count}/${progress.total}）。`,
      };
    },
    conversation(id) { return data.conversations[id] || []; },
    appendConversation(id, userText, response) {
      const history = data.conversations[id] || [];
      history.push(
        { role: "user", content: userText },
        { role: "assistant", content: response },
      );
      data.conversations[id] = history.length >= 40 ? [] : history;
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveCasino(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
