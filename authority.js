(function (LG) {
  let snapshot = null;
  let latestRequestId = 0;
  let applying = Promise.resolve();
  const listeners = new Set(), SYNC_TIMEOUT = 30000;
  const FALLBACK_URL = `./offline-game-state.js?v=${encodeURIComponent(LG.CONFIG.buildId)}`;
  const fallbackMemory = new Map();
  let fallbackActive = false, fallbackLoader = null, fallbackQueue = Promise.resolve();

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

  function loadFallbackEngine() {
    if (window.OfflineGameState?.default) return Promise.resolve();
    if (fallbackLoader) return fallbackLoader;
    fallbackLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timer = window.setTimeout(() => reject(
        Object.assign(new Error("本地结算引擎加载超时。"), { code: "FALLBACK_TIMEOUT" }),
      ), 12000);
      script.src = FALLBACK_URL;
      script.onload = () => {
        window.clearTimeout(timer);
        if (window.OfflineGameState?.default) resolve();
        else reject(Object.assign(
          new Error("本地结算引擎不可用。"), { code: "FALLBACK_UNAVAILABLE" }));
      };
      script.onerror = () => {
        window.clearTimeout(timer);
        reject(Object.assign(
          new Error("本地结算引擎加载失败。"), { code: "FALLBACK_LOAD_FAILED" }));
      };
      document.head.append(script);
    });
    return fallbackLoader;
  }

  const fallbackKv = {
    async get(key) {
      if (fallbackMemory.has(key)) return { value: fallbackMemory.get(key) };
      if (!LG.authorityFallback.remoteAllowed()) return null;
      try {
        const stored = await window.dzmm?.kv?.get?.(key);
        if (stored?.value !== undefined) {
          fallbackMemory.set(key, stored.value);
          return stored;
        }
      } catch (err) {
        console.warn("本地结算存档读取降级:", err?.code, err?.message);
      }
      return null;
    },
    async put(key, value) {
      fallbackMemory.set(key, value);
      if (!LG.authorityFallback.remoteAllowed()) return true;
      try {
        await window.dzmm?.kv?.put?.(key, value, { flush: true });
      } catch (err) {
        console.warn("本地结算存档暂存于当前会话:", err?.code, err?.message);
      }
      return true;
    },
  };
  async function invokeFallback(body) {
    await loadFallbackEngine();
    const run = () => window.OfflineGameState.default({ body }, {
      kv: fallbackKv,
      lifeCinemaTestMode: LG.TEST_MODE?.lifeCinemaCheats === true || window.__LIFE_GAME_TEST_MODE__ === true,
    });
    const task = fallbackQueue.then(run, run);
    fallbackQueue = task.then(() => {}, () => {});
    return task;
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
      LG.blackPrison.init(),
      LG.penitentiary.init(),
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
      fallbackActive = true;
      console.warn("权威游戏服务不可用，使用本地结算。");
    }
    const requestId = ++latestRequestId;
    const body = { method, ...(args || {}) };
    if (mutating) body.operationId = body.operationId || operationId(method);
    let result;
    if (fallbackActive) {
      result = await invokeFallback(body);
    } else {
      try {
        const task = window.dzmm.fn.invoke("game-state", body);
        result = method === "sync" ? await withTimeout(task) : await task;
      } catch (err) {
        if (LG.authorityFallback.isCaptcha(err)) {
          LG.authorityFallback.blockRemote(err); throw LG.authorityFallback.captchaError();
        }
        LG.authorityFallback.blockRemote(err);
        const mode = LG.authorityFallback.mode(err);
        if (!mode) throw err;
        if (LG.authorityFallback.shouldRetry(err, Boolean(snapshot))) {
          throw LG.authorityFallback.retryError(err);
        }
        fallbackActive = mode !== "transient";
        console.warn("权威服务不可用，本次切换本地结算:", err?.code, err?.message);
        try {
          result = await invokeFallback(body);
        } catch (fallbackErr) {
          if (mode === "transient") fallbackActive = false;
          throw fallbackErr;
        }
      }
    }
    if (requestId !== latestRequestId && method === "sync") return snapshot;
    await apply(result);
    LG.achievementFeedback?.apply?.(result, method);
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
    lifeCinemaProgress() {
      return snapshot?.lifeCinema
        || { restartCount: 0, tasteRequired: 800, powerRequired: 1000 };
    },
    achievementPoints() {
      return snapshot?.economy?.achievementPoints || { balance: 0, lifetime: 0 };
    },
    endingCount() { return Number(snapshot?.endingCount) || 0; },
    endingTotal() { return Number(snapshot?.endingTotal) || 0; },
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      if (snapshot) listener(snapshot);
      return () => listeners.delete(listener);
    },
  };
})(window.LifeGame);
