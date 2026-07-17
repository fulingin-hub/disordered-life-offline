(function (LG) {
  let snapshot = null;
  let latestRequestId = 0;
  let applying = Promise.resolve();
  const listeners = new Set();
  const SYNC_TIMEOUT = 15000;

  function withTimeout(task) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => {
        const error = new Error("读取权威存档超时。");
        error.code = "TIMEOUT";
        reject(error);
      }, SYNC_TIMEOUT);
    });
    return Promise.race([task, timeout]).finally(() => window.clearTimeout(timer));
  }

  function operationId(method) {
    if (window.crypto?.randomUUID) return `${method}:${window.crypto.randomUUID()}`;
    return `${method}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  function knownEndings(next) {
    const items = [...(next.archiveView?.male || []), ...(next.archiveView?.female || [])]
      .filter((item) => item && !item.locked);
    if (next.life?.currentEnding) items.push(next.life.currentEnding);
    return [...new Map(items.map((item) => [item.id, item])).values()];
  }

  async function rehydrate(next) {
    snapshot = next;
    LG.ENDINGS = knownEndings(next);
    LG.storage.seedAuthority(next);
    await Promise.all([
      LG.achievements.init(),
      LG.traits.init(),
      LG.collectibles.init(),
      LG.tribute.init(),
      LG.dailyTasks.init(),
      LG.blackMarket.init(),
      LG.casino.init(),
    ]);
    listeners.forEach((listener) => listener(next));
    return next;
  }

  function apply(next) {
    applying = applying.then(() => rehydrate(next));
    return applying;
  }

  async function invoke(method, args, mutating) {
    if (!window.dzmm?.fn?.invoke) {
      const error = new Error("权威游戏服务不可用。");
      error.code = "FUNCTION_UNAVAILABLE";
      throw error;
    }
    const requestId = ++latestRequestId;
    const body = { method, ...(args || {}) };
    if (mutating) body.operationId = body.operationId || operationId(method);
    const task = window.dzmm.fn.invoke("game-state", body);
    const result = method === "sync" ? await withTimeout(task) : await task;
    if (requestId !== latestRequestId && method === "sync") return snapshot;
    await apply(result);
    return result;
  }

  LG.authority = {
    sync() {
      return invoke("sync", {}, false);
    },
    mutate(method, args) {
      return invoke(method, args, true);
    },
    snapshot() {
      return snapshot;
    },
    state() {
      return snapshot?.life || null;
    },
    archive() {
      return snapshot?.archive || { male: [], female: [] };
    },
    archiveView(gender) {
      return snapshot?.archiveView?.[gender] || [];
    },
    cinemaAchievements() {
      return Array.isArray(snapshot?.cinemaAchievements)
        ? snapshot.cinemaAchievements : [];
    },
    endingCount() {
      return Number(snapshot?.endingCount) || 0;
    },
    endingTotal() {
      return Number(snapshot?.endingTotal) || 0;
    },
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      if (snapshot) listener(snapshot);
      return () => listeners.delete(listener);
    },
  };
})(window.LifeGame);
