(function () {
  if (window.AndroidOffline || !("serviceWorker" in navigator)
    || location.protocol === "file:") return;
  let status;
  let refreshing = false;
  const COPY = {
    "zh-CN": {
      updateReload: "发现新版本，正在重新载入",
      reset: "正在清除旧版离线缓存",
      progress: "正在准备离线资源 {done}/{total}",
      ready: "离线资源准备完成",
      partial: "离线资源已就绪，{failed}项将在使用时重试",
      updating: "正在更新离线版本",
    },
    ja: {
      updateReload: "新しいバージョンを再読み込みしています",
      reset: "古いオフラインキャッシュを削除しています",
      progress: "オフラインデータを準備中 {done}/{total}",
      ready: "オフラインデータの準備が完了しました",
      partial: "{failed}件は使用時に再取得します",
      updating: "オフライン版を更新しています",
    },
    en: {
      updateReload: "Reloading the new version",
      reset: "Clearing the old offline cache",
      progress: "Preparing offline files {done}/{total}",
      ready: "Offline files are ready",
      partial: "{failed} files will retry when needed",
      updating: "Updating the offline version",
    },
  };

  function text(key, values = {}) {
    const locale = window.OfflineI18n?.locale?.() || "zh-CN";
    let value = (COPY[locale] || COPY["zh-CN"])[key];
    Object.entries(values).forEach(([name, replacement]) => {
      value = value.replace(`{${name}}`, replacement);
    });
    return value;
  }

  function show(text) {
    if (!status) {
      status = document.createElement("div");
      status.className = "offline-cache-status";
      document.body.append(status);
    }
    status.textContent = text;
  }

  function reloadForUpdate() {
    if (refreshing) return;
    refreshing = true;
    show(text("updateReload"));
    window.setTimeout(() => window.location.reload(), 250);
  }

  async function resetOfflineCache() {
    show(text("reset"));
    const registration = await navigator.serviceWorker.getRegistration();
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("disordered-life-offline-"))
      .map((key) => caches.delete(key)));
    await registration?.unregister();
    const url = new URL(window.location.href);
    url.searchParams.set("reload", Date.now().toString());
    window.location.replace(url.href);
  }

  document.getElementById("offlineCacheResetButton")
    ?.addEventListener("click", () => {
      resetOfflineCache().catch((error) => {
        console.warn("清除离线缓存失败:", error.message, error.stack);
        window.location.reload();
      });
    });

  navigator.serviceWorker.addEventListener("controllerchange", reloadForUpdate);
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data?.type === "CACHE_PROGRESS") {
      show(text("progress", { done: data.done, total: data.total }));
    }
    if (data?.type === "CACHE_READY") {
      show(data.failed
        ? text("partial", { failed: data.failed })
        : text("ready"));
      window.setTimeout(() => status?.remove(), 2200);
    }
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js", { updateViaCache: "none" });
      registration.addEventListener("updatefound", () => show(text("updating")));
      await registration.update();
      const ready = await navigator.serviceWorker.ready;
      const worker = ready.active || registration.waiting;
      worker?.postMessage({ type: "CACHE_ALL" });
    } catch (error) {
      console.warn("离线缓存初始化失败:", error.message, error.stack);
    }
  }, { once: true });
})();
