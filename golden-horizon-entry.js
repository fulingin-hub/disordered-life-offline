(function (LG) {
  function isOffline() {
    return Boolean(window.OfflineDialogueRuntime || window.OfflineDB);
  }

  function isPrimary() {
    return Boolean(window.dzmm) && !isOffline()
      && !LG.playerRuntime?.active?.();
  }

  function init() {
    if (!isPrimary()) return;
    LG.guildOnboarding?.init?.();
    document.documentElement.dataset.primaryGame = "guild-onboarding";
  }

  function queue(state) {
    if (!isPrimary() || !state?.gender || state.gameMode !== "endgame") return;
    window.setTimeout(() => {
      const contentGate = document.getElementById("contentModeGate");
      const genderGate = document.getElementById("genderGate");
      if (!contentGate?.hidden || !genderGate?.hidden) return;
      LG.guildOnboarding?.offer?.(state);
    }, 0);
  }

  LG.goldenHorizonEntry = { init, isOffline, isPrimary, queue };
})(window.LifeGame);
