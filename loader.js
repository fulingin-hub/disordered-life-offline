(function (LG) {
  const SDK_WAIT = 8000;
  const IMAGE_TIMEOUT = 8000;
  const CRITICAL_KEYS = new Set(["background"]);
  const loadedSources = new Set();

  function progress(payload) {
    window.LifeGameBoot?.touch?.();
    LG.loadingUI.update(payload);
    try {
      Promise.resolve(window.dzmm?.loading?.progress?.(payload)).catch((err) => {
        console.warn("加载状态上报失败:", err?.message, err?.stack);
      });
    } catch (err) {
      console.warn("加载状态上报失败:", err.message, err.stack);
    }
  }

  function loadImage(src, attempt = 0) {
    if (!src || loadedSources.has(src)) return Promise.resolve(true);
    return new Promise((resolve) => {
      const image = new Image();
      let settled = false;
      const finish = (loaded) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        if (loaded) loadedSources.add(src);
        resolve(loaded);
      };
      const timer = window.setTimeout(() => finish(false), IMAGE_TIMEOUT);
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = attempt ? LG.assetRecovery.retrySource(src, attempt) : src;
    });
  }

  async function loadImageWithRetry(src) {
    for (let attempt = 0; attempt <= 2; attempt += 1) {
      if (await loadImage(src, attempt)) return true;
      if (attempt < 2) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, attempt ? 900 : 300));
      }
    }
    return false;
  }

  async function preloadEntries(entries, message) {
    const unique = [...new Map(entries.filter(([, src]) => src)
      .map(([key, src]) => [src, [key, src]])).values()];
    const failures = [];
    let completed = 0;
    const reportCounts = unique.length > 1;
    progress(reportCounts
      ? { phase: "resource_loading", loadedResources: 0,
        totalResources: unique.length, message }
      : { phase: "resource_loading", message });
    await Promise.all(unique.map(async ([, src]) => {
      if (!await loadImageWithRetry(src)) failures.push(src);
      completed += 1;
      progress(reportCounts
        ? { phase: "resource_loading", loadedResources: completed,
          totalResources: unique.length, currentResource: src, message }
        : { phase: "resource_loading", currentResource: src, message });
    }));
    if (failures.length) {
      console.warn("部分首屏图片加载失败，将在使用时重试:", failures.join(", "));
    }
  }

  function waitForIdle() {
    return new Promise((resolve) => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(resolve, { timeout: 1200 });
      } else {
        window.setTimeout(resolve, 300);
      }
    });
  }

  LG.loader = {
    start() {
      LG.assetRecovery.install();
      progress({ phase: "start", message: "Preparing life simulation" });
    },
    waitForSdk() {
      if (window.dzmm) return Promise.resolve();
      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (ready) => {
          if (settled) return;
          settled = true;
          window.removeEventListener("dzmm:ready", onReady);
          window.clearTimeout(timer);
          if (ready || window.dzmm) {
            resolve();
            return;
          }
          const error = new Error("平台 SDK 连接超时。");
          error.code = "SDK_UNAVAILABLE";
          reject(error);
        };
        const onReady = () => finish(true);
        const timer = window.setTimeout(() => finish(false), SDK_WAIT);
        window.addEventListener("dzmm:ready", onReady);
      });
    },
    async preload() {
      const entries = Object.entries(LG.CONFIG.assets)
        .filter(([key]) => CRITICAL_KEYS.has(key));
      await preloadEntries(entries, "Loading background");
    },
    async preloadState(state) {
      const event = LG.engine.current(state);
      await preloadEntries([
        ["event", LG.CONFIG.assets[event?.portrait]],
        ["protagonist", LG.protagonistPortrait.source(state)],
      ], "Loading current scene");
      progress({
        phase: "runtime_initializing",
        message: "Loading save data",
      });
    },
    stage(message) {
      progress({ phase: "runtime_initializing", message });
    },
    async warm() {
      await waitForIdle();
      const entries = Object.entries(LG.CONFIG.assets)
        .filter(([key]) => !key.endsWith("Set"));
      let next = 0;
      async function worker() {
        while (next < entries.length) {
          const index = next;
          next += 1;
          await loadImage(entries[index][1]);
        }
      }
      await Promise.all(Array.from({ length: 2 }, worker));
    },
    syncRetry(attempt, retries, delay) {
      const text = `权威存档连接繁忙，${Math.round(delay / 100) / 10}秒后重试`
        + `（${attempt}/${retries}）`;
      progress({
        phase: "runtime_initializing",
        message: text,
      });
      LG.loadingUI.update({ phase: "runtime_initializing" }, text);
    },
    ready(onVisible) {
      progress({ phase: "first_frame", message: "Life begins" });
      let notified = false;
      const notify = () => {
        if (notified) return;
        notified = true;
        document.getElementById("bootSplash")?.remove();
        window.LifeGameBoot?.ready?.();
        requestAnimationFrame(() => onVisible?.());
        try {
          Promise.resolve(window.dzmm?.loading?.ready?.()).catch((err) => {
            console.warn("首帧状态上报失败:", err?.message, err?.stack);
          });
        } catch (err) {
          console.warn("首帧状态上报失败:", err.message, err.stack);
        }
      };
      window.setTimeout(notify, 0);
      requestAnimationFrame(notify);
    },
    defer(task) {
      window.setTimeout(() => Promise.resolve().then(task).catch((err) => {
        console.warn("启动后延迟任务失败:", err?.code, err?.message, err?.stack);
      }), 0);
    },
    error(err) {
      console.error("游戏启动失败:", err.message, err.stack);
      try {
        Promise.resolve(window.dzmm?.loading?.error?.(
          "BOOT_FAILED", err.message || "Boot failed",
        )).catch(() => {});
      } catch (_) {
        // Keep the in-game error visible even if SDK reporting fails.
      }
    },
  };
})(window.LifeGame);
