(function (LG) {
  LG.dailyTasks = {
    async init() {},
    all() {
      const tasks = LG.authority.snapshot()?.economy?.dailyTasks?.tasks;
      return Array.isArray(tasks) ? tasks : [];
    },
  };
})(window.LifeGame);
