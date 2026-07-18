(function () {
  if (window.AndroidOffline || !("serviceWorker" in navigator)
    || location.protocol === "file:") return;
  let status;

  function show(text) {
    if (!status) {
      status = document.createElement("div");
      status.className = "offline-cache-status";
      document.body.append(status);
    }
    status.textContent = text;
  }

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
      const registration = await navigator.serviceWorker.register("./service-worker.js");
      await navigator.serviceWorker.ready;
      const worker = registration.active || registration.waiting;
      worker?.postMessage({ type: "CACHE_ALL" });
    } catch (error) {
      console.warn("离线缓存初始化失败:", error.message, error.stack);
    }
  }, { once: true });
})();
