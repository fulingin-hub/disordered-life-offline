(function (LG) {
  const el = {};
  let onSelect;
  let reachedBottom = false;
  let pendingMode = null;
  let downgrade = false;
  let busy = false;

  function updateOptions() {
    const enabled = reachedBottom && el.ack.checked && !busy;
    el.buttons.forEach((button) => { button.disabled = !enabled; });
    el.ack.disabled = !reachedBottom || busy;
  }

  function checkScroll() {
    if (reachedBottom) return;
    const atBottom = el.notice.scrollTop + el.notice.clientHeight
      >= el.notice.scrollHeight - 8;
    if (!atBottom) return;
    reachedBottom = true;
    el.status.textContent = "已阅读到声明末尾，请勾选确认后选择内容模式。";
    updateOptions();
  }

  function confirmationCopy(mode, isDowngrade) {
    if (isDowngrade) {
      return "确认永久切换为15+模式？切换后画廊不再开放，成人动画改为文字场景，"
        + "而且当前存档不能恢复为18+模式。";
    }
    if (mode === "15") {
      return "确认选择15+模式？当前存档将永久锁定为15+，画廊不开放，成人动画改为"
        + "文字场景。如需重新选择，只能删除存档；离线版需删除后重新下载。";
    }
    return "确认你已年满18周岁并选择18+模式？此模式包含成人向文字、CG与动画。"
      + "之后可以永久切换为15+，但降级后不能恢复。";
  }

  function request(mode, isDowngrade = false) {
    if (busy) return;
    pendingMode = mode;
    downgrade = isDowngrade;
    el.confirmTitle.textContent = isDowngrade
      ? "永久切换为15+" : `确认选择${mode}+模式`;
    el.confirmText.textContent = confirmationCopy(mode, isDowngrade);
    el.confirm.showModal();
  }

  async function confirmSelection() {
    if (!pendingMode || busy) return;
    busy = true;
    el.confirmButton.disabled = true;
    el.cancelButton.disabled = true;
    el.confirmButton.textContent = "正在保存...";
    try {
      await onSelect(pendingMode, downgrade);
      el.confirm.close();
      el.gate.hidden = true;
    } catch (err) {
      console.error("内容模式保存失败:", err?.code, err?.message, err?.stack);
      el.confirmText.textContent = err?.message || "保存失败，请稍后重试。";
    } finally {
      busy = false;
      el.confirmButton.disabled = false;
      el.cancelButton.disabled = false;
      el.confirmButton.textContent = "确认并保存";
      updateOptions();
    }
  }

  function open() {
    reachedBottom = false;
    el.ack.checked = false;
    el.ack.disabled = true;
    el.notice.scrollTop = 0;
    el.status.textContent = "请将声明滚动至最底部。";
    el.gate.hidden = false;
    updateOptions();
  }

  function sync(snapshot) {
    LG.contentMode.sync(snapshot);
    const mode = snapshot?.contentMode || null;
    el.downgrade.hidden = mode !== "18";
    if (!mode && el.gate) open();
  }

  LG.contentModeUI = {
    init(callback) {
      onSelect = callback;
      el.gate = document.getElementById("contentModeGate");
      el.notice = document.getElementById("contentModeNotice");
      el.ack = document.getElementById("contentModeAck");
      el.status = document.getElementById("contentModeStatus");
      el.buttons = [...el.gate.querySelectorAll("[data-content-mode]")];
      el.downgrade = document.getElementById("contentModeButton");
      el.confirm = document.getElementById("contentModeConfirm");
      el.confirmTitle = document.getElementById("contentModeConfirmTitle");
      el.confirmText = document.getElementById("contentModeConfirmText");
      el.confirmButton = document.getElementById("confirmContentModeButton");
      el.cancelButton = document.getElementById("cancelContentModeButton");
      el.notice.addEventListener("scroll", checkScroll, { passive: true });
      el.ack.addEventListener("change", updateOptions);
      el.buttons.forEach((button) => button.addEventListener("click",
        () => request(button.dataset.contentMode)));
      el.downgrade.addEventListener("click", () => request("15", true));
      el.confirmButton.addEventListener("click", confirmSelection);
      el.cancelButton.addEventListener("click", () => el.confirm.close());
      LG.authority.subscribe(sync);
      window.requestAnimationFrame(checkScroll);
    },
    open,
    sync,
  };
})(window.LifeGame);
