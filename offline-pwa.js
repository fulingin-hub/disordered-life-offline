(function () {
  if (window.AndroidOffline || !("serviceWorker" in navigator)
    || location.protocol === "file:") return;
  let status;
  let refreshing = false;

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
    show("发现新版本，正在重新载入");
    window.setTimeout(() => window.location.reload(), 250);
  }

  async function resetOfflineCache() {
    show("正在清除旧版离线缓存");
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
      show(`正在准备离线资源 ${data.done}/${data.total}`);
    }
    if (data?.type === "CACHE_READY") {
      show("离线资源准备完成");
      window.setTimeout(() => status?.remove(), 2200);
    }
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js", { updateViaCache: "none" });
      registration.addEventListener("updatefound", () => show("正在更新离线版本"));
      await registration.update();
      const ready = await navigator.serviceWorker.ready;
      const worker = ready.active || registration.waiting;
      worker?.postMessage({ type: "CACHE_ALL" });
    } catch (error) {
      console.warn("离线缓存初始化失败:", error.message, error.stack);
    }
  }, { once: true });
})();
