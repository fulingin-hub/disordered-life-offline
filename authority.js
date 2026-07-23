(function (LG) {
  let snapshot = null, applying = Promise.resolve(), requestQueue = Promise.resolve();
  const listeners = new Set();
  const SYNC_TIMEOUT = 30000;
  function withTimeout(task, timeoutMs = SYNC_TIMEOUT) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => {
        const error = new Error("权威结算响应超时。");
        error.code = "TIMEOUT";
        error.localTimeout = true;
        reject(error);
      }, timeoutMs);
    });
    return Promise.race([task, timeout]).finally(() => window.clearTimeout(timer));
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
      LG.achievements.init(), LG.traits.init(), LG.collectibles.init(),
      LG.tribute.init(), LG.dailyTasks.init(), LG.blackMarket.init(),
      LG.casino.init(), LG.blackPrison.init(), LG.penitentiary.init(),
    ]);
    listeners.forEach((listener) => listener(next));
    return next;
  }
  function apply(next) {
    applying = applying.then(() => rehydrate(next));
    return applying;
  }
  function enqueue(task) {
    const next = requestQueue.then(task, task);
    requestQueue = next.then(() => {}, () => {});
    return next;
  }
  function requireRemote() {
    if (LG.playerRuntime?.active?.() || window.dzmm?.fn?.invoke) return;
    const unavailable = Object.assign(new Error("权威结算服务不可用。"),
      { code: "FUNCTION_UNAVAILABLE" });
    if (LG.playerRuntime?.activate?.(unavailable)) return;
    const error = new Error(
      "权威结算服务不可用。当前为只读模式，不会创建本地分叉存档。",
    );
    error.code = "AUTHORITY_READ_ONLY";
    throw error;
  }
  async function remote(body, timeoutMs, options) {
    requireRemote();
    if (LG.playerRuntime?.active?.())
      return withTimeout(LG.playerRuntime.invoke(body), timeoutMs);
    try {
      return await withTimeout(window.dzmm.fn.invoke(
        "game-state", body, options), timeoutMs);
    } catch (error) {
      if (!LG.playerRuntime?.activateFor?.(error)) throw error;
      return withTimeout(LG.playerRuntime.invoke(body), timeoutMs);
    }
  }
  async function confirmOperation(id) {
    const result = await remote(
      { method: "operationStatus", operationId: id }, 15000, { retry: true });
    if (result?.life && result?.economy) await apply(result);
    return result;
  }
  function failedAction(message) {
    return Object.assign(new Error(message), { code: "AUTHORITY_ACTION_FAILED" });
  }
  async function syncNow() {
    try {
      const result = await remote({ method: "sync" });
      await apply(result);
      LG.achievementFeedback?.apply?.(result, "sync");
      return result;
    } catch (err) {
      if (LG.authorityFallback?.isCaptcha?.(err))
        throw LG.authorityFallback.captchaError();
      throw err;
    }
  }
  async function mutateNow(method, args) {
    const tracked = LG.authorityIntents.get(method, args);
    const key = tracked.key;
    const intent = tracked.intent;
    if (intent.unknown) {
      try {
        const status = await LG.authorityRetry.confirm(
          () => confirmOperation(intent.id), (result) =>
            result?.operationProcessed || result?.operationFailed);
        if (status.operationProcessed) {
          LG.authorityIntents.remove(key);
          return status;
        }
        if (status.operationFailed) {
          LG.authorityIntents.remove(key);
          throw failedAction("上一次结算失败，请再次点击以创建新的操作。");
        }
      } catch (err) {
        if (LG.authorityFallback?.isCaptcha?.(err)) {
          throw LG.authorityFallback.captchaError();
        }
        throw err;
      }
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const body = {
        ...(args || {}),
        method,
        operationId: intent.id,
        expectedVersion: Number(snapshot?.authorityVersion) || 0,
      };
      try {
        const result = await remote(body);
        await apply(result);
        if (result.versionConflict && attempt === 0) continue;
        LG.authorityIntents.remove(key);
        LG.achievementFeedback?.apply?.(result, method);
        return result;
      } catch (err) {
        if (LG.authorityFallback?.isCaptcha?.(err)) {
          throw LG.authorityFallback.captchaError();
        }
        if (!LG.authorityIntents.isUncertain(err)) {
          LG.authorityIntents.remove(key);
          throw err;
        }
        intent.unknown = true;
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        try {
          const status = await LG.authorityRetry.confirm(
            () => confirmOperation(intent.id), (result) =>
              result?.operationProcessed || result?.operationFailed);
          if (status.operationProcessed) {
            LG.authorityIntents.remove(key);
            LG.achievementFeedback?.apply?.(status, method);
            return status;
          }
          if (status.operationFailed) {
            LG.authorityIntents.remove(key);
            throw failedAction("本次结算未完成，请再次点击以创建新的操作。");
          }
        } catch (confirmErr) {
          if (LG.authorityFallback?.isCaptcha?.(confirmErr)) {
            throw LG.authorityFallback.captchaError();
          }
          console.warn("未知结算结果确认失败:",
            confirmErr?.code, confirmErr?.message, confirmErr?.stack);
        }
        const retry = new Error(
          "结算结果尚未确认。当前保持只读，请重试同一操作以继续确认。",
        );
        retry.code = "AUTHORITY_RESULT_UNKNOWN";
        throw retry;
      }
    }
    throw new Error("权威存档版本持续冲突，请刷新后重试。");
  }
  LG.authority = {
    sync: (options) => enqueue(() => LG.authorityRetry.run(syncNow, options)),
    mutate: (method, args) => enqueue(() => mutateNow(method, args)),
    inspect(method, args) {
      return enqueue(() => remote({ ...(args || {}), method }));
    },
    exportSave: () => enqueue(() => remote({ method: "exportSave" })),
    snapshot() { return snapshot; },
    state() { return snapshot?.life || null; },
    archive() { return snapshot?.archive || { male: [], female: [] }; },
    archiveView(gender) { return snapshot?.archiveView?.[gender] || []; },
    cinemaAchievements() {
      return Array.isArray(snapshot?.cinemaAchievements)
        ? snapshot.cinemaAchievements : [];
    },
    lifeCinemaProgress() {
      return snapshot?.lifeCinema
        || {
          unlockAllEndings: { available: false, text: "正在同步解锁进度" },
          unlockAllCollections: { available: false, text: "正在同步解锁进度" },
        };
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
