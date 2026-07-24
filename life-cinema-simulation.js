(function (LG) {
  const ids = ["golden", "casino", "paradise", "penitentiary", "infernal"];
  let busy = false;
  const el = {};

  function refresh() {
    if (!el.start) return;
    const progress = LG.authority.lifeCinemaProgress();
    const simulation = progress.simulation || {};
    const maps = progress.simulationMaps || {};
    const modes = LG.authority.snapshot()?.gameModes || {};
    const endgameUnlocked = modes.endgameUnlocked === true;
    el.start.hidden = simulation.active === true;
    el.leave.hidden = simulation.active !== true;
    el.start.disabled = busy;
    el.leave.disabled = busy || !endgameUnlocked;
    el.leave.querySelector("span").textContent = endgameUnlocked
      ? "保存当前放映进度，进入已解锁的世界征途"
      : `完成${Number(modes.endgameTarget) || 2}个模拟人生结局后开放`;
    el.copy.textContent = simulation.resumable
      ? `继续上次IF轮回 · 已完成${simulation.completions || 0}场`
      : `从0岁开始独立轮回 · 已完成${simulation.completions || 0}场`;
    const career = Object.values(simulation.careerStats || {})
      .reduce((sum, value) => sum + Number(value || 0), 0);
    const unlocked = ids.filter((id) =>
      Number(maps[id]) >= Number(maps.target || 100)).length;
    el.progress.textContent = `待带回属性点${simulation.points || 0}`
      + ` · 待折算职业成长${career} · 已累计带回${
        simulation.transferredPoints || 0} · IF线门槛${unlocked}/5`;
  }

  async function switchMode(leave) {
    if (busy) return;
    if (leave && LG.authority.snapshot()?.gameModes?.endgameUnlocked !== true) {
      el.status.textContent = "完成2个模拟人生结局后才能进入世界征途。";
      return;
    }
    busy = true;
    refresh();
    el.status.textContent = leave
      ? "正在结算奖励并恢复世界征途..." : "人生电影院正在准备独立IF轮回...";
    try {
      const simulation = LG.authority.lifeCinemaProgress().simulation || {};
      const result = await LG.authority.mutate(
        leave ? "leaveSimulation" : "startSimulation",
        leave ? {} : { resume: simulation.resumable === true },
      );
      el.dialog.close();
      LG.ui.render(result.life);
      LG.roomsUI?.refresh?.();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("模拟人生切换失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "模拟人生暂时无法切换。";
    } finally {
      busy = false;
      refresh();
    }
  }

  function init() {
    el.dialog = document.getElementById("recoveryDialog");
    el.start = document.getElementById("cinemaSimulationButton");
    el.leave = document.getElementById("cinemaLeaveSimulationButton");
    el.copy = document.getElementById("cinemaSimulationText");
    el.progress = document.getElementById("cinemaSimulationProgress");
    el.status = document.getElementById("cinemaStatus");
    el.start.addEventListener("click", () => switchMode(false));
    el.leave.addEventListener("click", () => switchMode(true));
    LG.authority.subscribe(refresh);
    refresh();
  }

  init();
})(window.LifeGame);
