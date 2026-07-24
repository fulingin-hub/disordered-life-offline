(function (LG) {
  const fallback = () => ({
    week: "", weekFailed: false, clearedDays: [], gifts: 0, currency: 0,
    setPieces: [], collectibles: [], mysteries: [],
    arenas: { date: "", completed: [] },
    arenaVictories: {},
    trialClears: 0, entryDays: 0, cityUnlocked: false,
    guideClears: { si: 0, ka: 0 },
    professions: { unlocked: [], equipped: null, guardWeek: "" },
    professionProgress: {},
    mischief: { date: "", stage: 0, claimed: false },
    sockCount: 0,
    social: { date: "", choice: null, board: null },
    tavern: { residents: {}, letters: [] },
    today: { date: "", gate: "moon", mapId: "desolate-snowfield" },
    bonuses: {},
  });
  LG.goldenHorizon = {
    data() {
      return LG.authority.snapshot()?.economy?.goldenHorizon || fallback();
    },
    owns(id) {
      const data = this.data();
      return data.setPieces?.includes(id)
        || data.collectibles?.includes(id) || data.mysteries?.includes(id);
    },
  };
})(window.LifeGame);
