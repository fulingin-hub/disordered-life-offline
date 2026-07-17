(function (LG) {
  let getState = () => null;

  function currentAge() {
    const state = getState?.();
    const current = state && LG.engine?.current?.(state);
    const age = Number(current?.age ?? state?.lastEventAge);
    return Number.isFinite(age) ? age : 0;
  }

  LG.casinoAccess = {
    init(stateProvider) {
      getState = typeof stateProvider === "function" ? stateProvider : getState;
    },
    status() {
      if (LG.TEST_MODE?.unlockAllRooms) {
        return {
          allowed: true,
          progress: 100,
          detail: "测试模式 · 赌场与全部角色房间已解锁",
          button: "进入赌场",
        };
      }
      const lives = LG.casino.completedLives();
      const age = currentAge();
      const lifeReady = LG.casino.accessUnlocked();
      const ageReady = age >= 18;
      if (!lifeReady) {
        return {
          allowed: false,
          progress: Math.min(100, lives / 50 * 100),
          detail: `累计完成人生 ${lives}/50 · 当前年龄 ${age}岁`,
          button: `还需 ${50 - lives} 次人生`,
        };
      }
      if (!ageReady) {
        return {
          allowed: false,
          progress: Math.min(100, age / 18 * 100),
          detail: `赌场已永久解锁 · 当前年龄 ${age}/18岁`,
          button: `年满18岁后进入`,
        };
      }
      return {
        allowed: true,
        progress: 100,
        detail: `${age}岁 · 累计 ${LG.casino.wins()}胜 / ${LG.casino.losses()}负`,
        button: "进入赌场",
      };
    },
  };
})(window.LifeGame);
