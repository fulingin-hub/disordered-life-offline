(function (LG) {
  const PREFIX = "player-fallback-v1:";
  const memory = new Map();
  let enabled = false;
  let volatile = false;
  let warned = false;
  let queue = Promise.resolve();

  function restriction(error) {
    const code = String(error?.code || "").toLowerCase();
    const detail = `${code} ${error?.message || ""}`.toLowerCase();
    const blocked = ["forbidden", "dev", "mode"].join("_");
    const unavailableCodes = new Set([
      blocked,
      "function_not_published",
      "function_not_found",
      "function_unavailable",
      "sdk_unavailable",
      "unsupported_feature",
    ]);
    const unavailableDetails = [
      blocked,
      "atomic_lock_unavailable",
      "atomic_action_reservation_unavailable",
    ];
    return unavailableCodes.has(code)
      || unavailableDetails.some((token) => detail.includes(token));
  }

  function activate(error) {
    if (!restriction(error) && error) return false;
    enabled = true;
    if (!warned) {
      warned = true;
      window.dzmm?.toast?.warning?.(
        "云端结算当前不可用，已切换到玩家兼容模式。进度将优先保存到当前游戏存档。",
      );
    }
    return true;
  }

  function withTimeout(task, ms = 4000) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(
        Object.assign(new Error("玩家存档访问超时"), { code: "TIMEOUT" })), ms);
    });
    return Promise.race([task, timeout]).finally(() => window.clearTimeout(timer));
  }

  function key(scope, value) {
    return `${PREFIX}${scope}:${value}`;
  }

  function store(scope) {
    return {
      async get(value) {
        const storageKey = key(scope, value);
        if (!volatile && window.dzmm?.kv?.get) {
          try {
            const result = await withTimeout(window.dzmm.kv.get(storageKey));
            if (result?.value !== undefined && result?.value !== null) {
              memory.set(storageKey, result.value);
              return { value: result.value };
            }
          } catch (error) {
            volatile = true;
            console.warn("玩家兼容存档读取降级:",
              error?.code, error?.message, error?.stack);
          }
        }
        return memory.has(storageKey) ? { value: memory.get(storageKey) } : null;
      },
      async put(value, data) {
        const storageKey = key(scope, value);
        memory.set(storageKey, data);
        if (!volatile && window.dzmm?.kv?.put) {
          try {
            await withTimeout(window.dzmm.kv.put(storageKey, data));
            return true;
          } catch (error) {
            volatile = true;
            console.warn("玩家兼容存档写入降级:",
              error?.code, error?.message, error?.stack);
          }
        }
        return true;
      },
      async delete(value) {
        const storageKey = key(scope, value);
        memory.delete(storageKey);
        if (!volatile && window.dzmm?.kv?.delete) {
          try {
            await withTimeout(window.dzmm.kv.delete(storageKey));
          } catch (error) {
            volatile = true;
            console.warn("玩家兼容存档删除降级:",
              error?.code, error?.message, error?.stack);
          }
        }
        return true;
      },
      async putIfAbsent(value, data) {
        if (await this.get(value)) return false;
        await this.put(value, data);
        return true;
      },
    };
  }

  const privateStore = store("private");
  privateStore.global = store("shared");

  function invoke(body) {
    const run = queue.then(() => LG.playerRuntimeData.invoke(body, privateStore));
    queue = run.catch(() => {});
    return run;
  }

  async function* stream(name, body, options, fallbackText) {
    let delivered = false;
    if (!enabled && window.dzmm?.fn?.invokeStream) {
      try {
        for await (const chunk of window.dzmm.fn.invokeStream(name, body, options)) {
          delivered = true;
          yield chunk;
        }
        return;
      } catch (error) {
        if (delivered || !activate(error)) throw error;
      }
    } else if (!enabled) {
      activate(Object.assign(new Error("函数能力不可用"), {
        code: "FUNCTION_UNAVAILABLE",
      }));
    }
    const text = String(typeof fallbackText === "function"
      ? fallbackText() : fallbackText || "对方暂时沉默地点了点头。");
    yield { type: "delta", delta: text };
    yield { type: "done" };
  }

  LG.playerRuntime = {
    active: () => enabled,
    activate,
    activateFor: (error) => enabled || activate(error),
    invoke,
    restriction,
    stream,
    volatile: () => volatile,
  };
})(window.LifeGame);
