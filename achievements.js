(function (LG) {
  const threshold = 10;
  const specialRooms = new Set(["streetThug", "beggar"]);
  const routeMap = {
    "qin-final": "qin",
    "lin-final": "lin",
    "su-final": "su",
    "shen-final": "shen",
    "reina-final": "reina",
    "miki-final": "miki",
    "cult-final": "mari",
    "evelyn-final": "evelyn",
    "claire-final": "claire",
    "ruth-final": "ruth",
    "qinghe-final": "qinghe",
    "ciyun-final": "ciyun",
    "agnes-final": "agnes",
    "qinghe-normal": "qinghe",
    "ciyun-normal": "ciyun",
    "agnes-normal": "agnes",
    "restaurant-household-contract": "restaurantCouple",
    "agency-household-contract": "agencyCouple",
    "japan-corporate-risk-final": "kaori",
    "japan-corporate-success-final": "kaori",
    "usa-corporate-risk-final": "victoria",
    "usa-corporate-success-final": "victoria",
  };
  let data;

  function emptyData() {
    return {
      version: 1,
      counts: { qin: 0, lin: 0, su: 0, shen: 0, reina: 0, miki: 0, mari: 0, evelyn: 0, claire: 0, ruth: 0, qinghe: 0, ciyun: 0, agnes: 0, restaurantCouple: 0, agencyCouple: 0, kaori: 0, victoria: 0, streetThug: 0, beggar: 0 },
      recordedRuns: [],
      conversations: { qin: [], lin: [], su: [], shen: [], reina: [], miki: [], mari: [], evelyn: [], claire: [], ruth: [], qinghe: [], ciyun: [], agnes: [], restaurantCouple: [], agencyCouple: [], kaori: [], victoria: [], streetThug: [], beggar: [] },
    };
  }

  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    Object.keys(next.counts).forEach((id) => {
      next.counts[id] = Math.max(0, Number(saved.counts?.[id]) || 0);
      next.conversations[id] = [];
    });
    next.recordedRuns = Array.isArray(saved.recordedRuns)
      ? saved.recordedRuns.slice(-100) : [];
    return next;
  }

  LG.achievements = {
    async init() {
      data = normalize(await LG.storage.loadAchievements());
    },
    all() {
      const testing = LG.TEST_MODE?.unlockAllRooms;
      return Object.keys(data.counts).map((id) => ({
        id,
        count: testing ? (specialRooms.has(id) ? 100 : threshold)
          : specialRooms.has(id) ? LG.traits.value("tribute") : data.counts[id],
        unlocked: testing || (specialRooms.has(id)
          ? LG.traits.isAtLeast("tribute", 100) : data.counts[id] >= threshold),
        threshold: specialRooms.has(id) ? 100 : threshold,
        special: specialRooms.has(id),
      }));
    },
    isUnlocked(id) {
      return Boolean(LG.TEST_MODE?.unlockAllRooms) || (specialRooms.has(id)
        ? LG.traits.isAtLeast("tribute", 100) : (data.counts[id] || 0) >= threshold);
    },
    record(state) {
      if (state.routeCompletionRecorded) return null;
      state.routeCompletionRecorded = true;
      const finalEvent = state.history[state.history.length - 1]?.eventId;
      const character = routeMap[finalEvent];
      if (!character || data.recordedRuns.includes(state.runId)) return null;
      const wasUnlocked = this.isUnlocked(character);
      data.counts[character] += 1;
      data.recordedRuns.push(state.runId);
      data.recordedRuns = data.recordedRuns.slice(-100);
      return {
        character,
        count: data.counts[character],
        unlocked: !wasUnlocked && this.isUnlocked(character),
        threshold,
      };
    },
    progressMessage(result) {
      const scene = LG.dialogueScenes.room(result.character);
      return result.unlocked
        ? `成就解锁：${scene.name}的专属房间`
        : `${scene.name}路线完成 ${result.count}/${result.threshold}`;
    },
    conversation(id) {
      return data.conversations[id] || [];
    },
    appendConversation(id, userText, response) {
      const history = data.conversations[id] || [];
      history.push(
        { role: "user", content: userText },
        { role: "assistant", content: response },
      );
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
      return LG.storage.saveAchievements(data);
    },
  };
})(window.LifeGame);
