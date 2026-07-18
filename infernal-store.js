(function (LG) {
  const empty = () => ({
    unlocked: false, defeat: 0, reputation: 0, clears: 0, bossVictories: 0,
    bossDesireCompletions: 0, bossChallenges: 0, bountyCompletions: 0,
    personalityEarned: 0,
    board: { round: 0, tasks: [] }, run: null, abyssAttempts: 0,
    abyssBossVictories: 0, abyssHighest: 0, abyssClears: 0,
    abyssRewardedMilestones: [], abyssBoard: { round: 0, tasks: [] },
    abyssRun: null,
  });

  function economy() {
    return LG.authority.snapshot()?.economy || {};
  }

  function data() {
    return economy().infernalRealm || empty();
  }

  LG.infernalRealm = {
    access() {
      const personality = Math.max(0, Number(economy().penitentiary?.personality) || 0);
      const saint = economy().saint?.endingTriggered === true;
      const unlocked = data().unlocked === true;
      const testing = LG.TEST_MODE?.unlockAllRooms === true;
      return {
        allowed: testing || unlocked
          || (saint && personality >= LG.INFERNAL_DATA.access.personality),
        saint: testing || saint,
        personality,
        required: LG.INFERNAL_DATA.access.personality,
      };
    },
    stats() {
      const realm = data();
      return {
        defeat: Math.max(0, Number(realm.defeat) || 0),
        reputation: Math.max(0, Number(realm.reputation) || 0),
        personality: Math.max(0, Number(economy().penitentiary?.personality) || 0),
        clears: Math.max(0, Number(realm.clears) || 0),
        bossVictories: Math.max(0, Number(realm.bossVictories) || 0),
        bossDesireCompletions: Math.max(0,
          Number(realm.bossDesireCompletions) || 0),
        bossChallenges: Math.max(0, Number(realm.bossChallenges) || 0),
        bountyCompletions: Math.max(0, Number(realm.bountyCompletions) || 0),
        abyssHighest: Math.max(0, Number(realm.abyssHighest) || 0),
        abyssClears: Math.max(0, Number(realm.abyssClears) || 0),
        abyssBossVictories: Math.max(0, Number(realm.abyssBossVictories) || 0),
      };
    },
    board() {
      const board = data().board || { round: 0, tasks: [] };
      return {
        round: Math.max(0, Number(board.round) || 0),
        tasks: Array.isArray(board.tasks) ? board.tasks : [],
      };
    },
    run() {
      const run = data().run;
      return run && Array.isArray(run.order) ? run : null;
    },
    canSkipMobs() {
      const stats = this.stats();
      const economyState = economy();
      return Boolean(economyState.infernalRealm?.club?.equippedSet)
        && stats.defeat >= 1000
        || economyState.saint?.active === true && stats.reputation >= 1000;
    },
    abyssAccess() {
      const clears = Math.max(0, Number(data().clears) || 0);
      const testing = LG.TEST_MODE?.unlockAllRooms === true;
      return { allowed: testing || clears >= LG.ABYSS_DATA.unlockClears,
        clears, required: LG.ABYSS_DATA.unlockClears };
    },
    abyssBoard() {
      const board = data().abyssBoard || { round: 0, tasks: [] };
      return { round: Math.max(0, Number(board.round) || 0),
        tasks: Array.isArray(board.tasks) ? board.tasks : [] };
    },
    abyssRun() {
      const run = data().abyssRun;
      return run && Number.isFinite(Number(run.floor)) ? run : null;
    },
    achievements() {
      return LG.authority.cinemaAchievements()
        .filter((item) => item.id?.startsWith("infernal-clear-")
          || item.id?.startsWith("abyss-floor-"));
    },
  };
})(window.LifeGame);
