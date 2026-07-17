(function (LG) {
  const el = {};
  let busy = false;

  function data() {
    return LG.authority.snapshot()?.economy?.penitentiary || {};
  }

  function render(message) {
    const prison = data();
    el.lifetime.textContent = String(prison.lifetimeCoupons || 0);
    el.coupons.textContent = String(prison.coupons || 0);
    el.acceptances.textContent = `${prison.controlAcceptances || 0}/10`;
    el.message.textContent = message
      || "累计赎罪卷达到新的500点里程碑，必须决定是否离开管制人生。";
    el.leave.disabled = busy || Number(prison.coupons) < 500;
    el.continue.disabled = busy;
  }

  async function choose(choice) {
    if (busy) return;
    busy = true;
    render("影狱账本正在确认选择...");
    try {
      const result = await LG.authority.mutate("penitentiaryControlChoice", { choice });
      render(result.message);
      LG.penitentiaryUI.refresh(result.message);
      window.dzmm?.toast?.success?.(result.message);
      el.dialog.close();
      if (result.life.endingId) {
        document.getElementById("penitentiaryDialog")?.close();
        LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
        LG.ui.render(result.life);
      }
    } catch (err) {
      console.error("影狱管制选择失败:", err?.code, err?.message, err?.stack);
      render(err?.message || "选择未能保存，请稍后重试。");
    } finally {
      busy = false;
      render();
    }
  }

  LG.penitentiaryControlUI = {
    init() {
      [["dialog", "penitentiaryControlDialog"],
        ["lifetime", "penitentiaryControlLifetime"],
        ["coupons", "penitentiaryControlCoupons"],
        ["acceptances", "penitentiaryControlAcceptances"],
        ["message", "penitentiaryControlMessage"],
        ["leave", "penitentiaryControlLeave"],
        ["continue", "penitentiaryControlContinue"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.dialog.addEventListener("cancel", (event) => event.preventDefault());
      el.leave.addEventListener("click", () => choose("leave"));
      el.continue.addEventListener("click", () => choose("continue"));
    },
    open(message) {
      if (!LG.penitentiary.controlPending()) return false;
      render(message);
      if (!el.dialog.open) el.dialog.showModal();
      return true;
    },
  };
})(window.LifeGame);
