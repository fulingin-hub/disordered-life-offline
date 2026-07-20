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
  };
})(window.LifeGame);
