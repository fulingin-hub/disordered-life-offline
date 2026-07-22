(function (LG) {
  let visiblePercent = 5;
  const labels = {
    start: "正在启动人生",
    resource_loading: "正在加载画面资源",
    runtime_initializing: "正在读取权威存档",
    first_frame: "人生即将开始",
    ready: "加载完成",
  };

  function targetPercent(payload) {
    if (payload?.phase === "ready") return 100;
    if (payload?.phase === "first_frame") return 96;
    if (payload?.phase === "runtime_initializing") return 78;
    if (payload?.phase === "resource_loading") {
      const total = Number(payload.totalResources) || 0;
      const loaded = Math.max(0, Number(payload.loadedResources) || 0);
      if (total > 0) return 20 + Math.round(50 * Math.min(loaded / total, 1));
      return 20;
    }
    return 8;
  }

  LG.loadingUI = {
    update(payload, message) {
      visiblePercent = Math.max(visiblePercent, targetPercent(payload));
      const status = document.getElementById("bootSplashStatus");
      const percent = document.getElementById("bootSplashPercent");
      const track = document.getElementById("bootSplashTrack");
      const bar = document.getElementById("bootSplashBar");
      if (status) status.textContent = message
        || labels[payload?.phase] || "正在载入人生";
      if (percent) percent.textContent = `${visiblePercent}%`;
      if (track) track.setAttribute("aria-valuenow", String(visiblePercent));
      if (bar) bar.style.width = `${visiblePercent}%`;
    },
  };
})(window.LifeGame);
