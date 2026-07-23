(function (LG) {
  const el = {};
  let busy = false;
  let shownKey = "";

  function blockers() {
    return ["achievementDialog", "cgDialog"].map((id) =>
      document.getElementById(id)).filter((dialog) => dialog?.open);
  }

  function present() {
    const blocker = blockers()[0];
    if (blocker) {
      blocker.addEventListener("close", () =>
        window.setTimeout(present, 120), { once: true });
      return;
    }
    if (!el.dialog.open) el.dialog.showModal();
  }

  async function proceed() {
    if (busy) return;
    const modes = LG.authority.snapshot()?.gameModes || {};
    const unlocked = modes.endgameUnlocked === true;
    busy = true;
    el.primary.disabled = true;
    el.secondary.disabled = true;
    el.status.textContent = unlocked
      ? "正在保存人生记忆并进入终局..."
      : "正在开始第二段人生...";
    try {
      if (!unlocked) {
        el.dialog.close();
        document.querySelector("[data-restart-life]")?.click();
        return;
      }
      const result = await LG.authority.mutate("leaveSimulation");
      el.dialog.close();
      LG.ui.render(result.life);
      LG.roomsUI?.refresh?.();
      LG.goldenHorizonEntry?.queue?.(result.life);
      window.dzmm?.toast?.success?.("终局玩法已开启：欢迎来到冒险者公会");
    } catch (err) {
      console.error("终局引导操作失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "暂时无法继续，请稍后重试。";
    } finally {
      busy = false;
      el.primary.disabled = false;
      el.secondary.disabled = false;
    }
  }

  function show(state) {
    if (!state?.endingId || state.gameMode !== "simulation") return;
    const modes = LG.authority.snapshot()?.gameModes || {};
    const count = Math.max(0, Number(modes.simulationCompletions) || 0);
    const target = Math.max(1, Number(modes.endgameTarget) || 2);
    const key = `${state.runId}:${state.endingId}:${count}`;
    if (!count || key === shownKey) return;
    shownKey = key;
    const unlocked = modes.endgameUnlocked === true;
    el.eyebrow.textContent = unlocked ? "终局来信" : "人生回响";
    el.title.textContent = unlocked
      ? "冒险者公会的大门开了" : "第一段人生已被记住";
    el.copy.textContent = unlocked
      ? "两段人生的记忆在这里汇合。门后是冒险者公会、五界终局，以及尚未有人走完的深渊。"
      : "这不是结束。还有一种活法正在等你，而第二段人生的尽头，会有人为你打开一扇门。";
    el.progress.textContent = `${Math.min(count, target)}/${target}`;
    el.bar.style.width = `${Math.min(100, count / target * 100)}%`;
    el.primaryText.textContent = unlocked ? "推门进入" : "再活一次";
    el.primaryHint.textContent = unlocked
      ? "前往冒险者公会" : "看看另一条路通向哪里";
    el.secondary.textContent = unlocked ? "再看一会儿" : "留在这个结局";
    el.status.textContent = "";
    LG.audio?.achievement?.();
    navigator.vibrate?.(unlocked ? [45, 45, 90] : 45);
    window.setTimeout(present, 720);
  }

  LG.endgameUnlockUI = {
    init() {
      [
        "dialog", "eyebrow", "title", "copy", "progress", "bar", "primary",
        "primaryText", "primaryHint", "secondary", "status",
      ].forEach((key) => {
        el[key] = document.getElementById(`endgameUnlock${
          key[0].toUpperCase()}${key.slice(1)}`);
      });
      el.primary.addEventListener("click", proceed);
      el.secondary.addEventListener("click", () => el.dialog.close());
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        el.dialog.close();
      });
    },
    show,
  };
})(window.LifeGame);
