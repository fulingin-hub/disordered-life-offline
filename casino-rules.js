(function (LG) {
  const casino = LG.casino;

  casino.regularItems = function (id) {
    return this.items(id).filter((item) => !item.insider);
  };
  casino.regularProgress = function (id) {
    const items = this.regularItems(id);
    const count = items.filter((item) => this.owns(item.id)).length;
    const testing = LG.TEST_MODE?.unlockAllRooms;
    return {
      count: testing ? items.length : count,
      total: items.length,
      complete: testing || (items.length > 0 && count === items.length),
    };
  };
  casino.insiderAvailable = function (id) {
    return this.regularProgress(id).complete;
  };
  casino.visibleItems = function (id) {
    return this.items(id).filter((item) => !item.insider || this.insiderAvailable(id));
  };
  casino.dominanceTier = function () {
    if (this.losses() >= 60) return 4;
    if (this.losses() >= 30) return 3;
    if (this.losses() >= 10) return 2;
    return 1;
  };
  casino.aiState = function (id, gameState) {
    return {
      runId: gameState.runId,
      stats: gameState.stats,
      studyAbroad: gameState.studyAbroad,
      conversations: { [id]: this.conversation(id) },
      casinoStats: { wins: this.wins(), losses: this.losses() },
      chatUsage: {},
    };
  };
})(window.LifeGame);
