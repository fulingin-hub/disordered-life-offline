(function (LG) {
  LG.career = {
    data() {
      return LG.authority.snapshot()?.economy?.career || {
        lifetimeStats: {}, runStats: {}, allocatedStats: {},
        memberships: [], professions: [], professionDefinitions: [],
        daily: { tasks: [] }, factions: [], achievement: {},
        menuItems: [], menu: { used: [] },
      };
    },
    stat(id, bucket = "lifetimeStats") {
      return Math.max(0, Number(this.data()?.[bucket]?.[id]) || 0);
    },
    taskReadyCount() {
      return (this.data().daily?.tasks || []).filter((task) =>
        !task.claimed && task.progress >= task.target).length;
    },
    medals() {
      const data = this.data();
      const master = LG.CAREER_DATA.roster.filter((item) =>
        data.characterItems?.includes(`${item.id}-normal-5`)).map((item) => ({
        id: `master:${item.id}`, name: `${item.name}的大师勋章`,
      }));
      const job = data.professionDefinitions?.find((item) =>
        item.id === data.equippedProfession);
      const special = LG.CAREER_DATA.roster.filter((item) =>
        item.faction === job?.specialFaction
        && (!job?.branch || item.branch === job.branch)
        && data.characterItems?.includes(`${item.id}-private-5`)).map((item) => ({
        id: `special:${item.id}`, name: `${item.name}的特殊图鉴勋章`,
      }));
      return [...master, ...special];
    },
    privateComplete(characterId) {
      const owned = new Set(this.data().characterItems || []);
      return [1, 2, 3, 4, 5].every((index) =>
        owned.has(`${characterId}-private-${index}`));
    },
    galleryUnlocked(characterId) {
      return this.privateComplete(characterId);
    },
    buttImpactUses(characterId) {
      return Math.max(0,
        Number(this.data().buttImpactUses?.[characterId]) || 0);
    },
    character(characterId) {
      return LG.CAREER_DATA.roster.find((item) => item.id === characterId) || null;
    },
    aiState() {
      return LG.authority.state();
    },
  };
})(window.LifeGame);
