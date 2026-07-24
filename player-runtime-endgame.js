(function (LG) {
  const target = 2;

  function unlocked(item) {
    return Number(item?.simulationCompletions) >= target;
  }

  function requireUnlocked(item) {
    if (!unlocked(item)) {
      throw new Error(`世界征途需要先完成${target}次模拟人生结局`);
    }
  }

  LG.playerRuntimeEndgame = {
    target,
    unlocked,
    requireUnlocked,
    selectMode(body, item) {
      const mode = body?.gameMode === "endgame" ? "endgame" : "simulation";
      if (mode === "endgame") requireUnlocked(item);
      return mode;
    },
    endingId(choiceIndex) {
      return Number(choiceIndex) === 0
        ? "self-directed-life" : "drifting-life";
    },
  };
})(window.LifeGame);
