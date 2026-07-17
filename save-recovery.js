(function (LG) {
  const Data = LG.saveRecoveryData;
  let busy = false;
  let recovered = null;
  let warnings = [];
  const el = {};

  function renderSummary(values) {
    el.summary.replaceChildren();
    Data.summaryItems(values, warnings).forEach(([label, value]) => {
      const item = document.createElement("div");
      const caption = document.createElement("span");
      const strong = document.createElement("strong");
      caption.textContent = label;
      strong.textContent = value;
      item.append(caption, strong);
      el.summary.append(item);
    });
    el.summary.hidden = false;
  }

  function setProgress(percent, label, state = "active") {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    el.progress.hidden = false;
    el.progress.dataset.state = state;
    el.progressBar.value = value;
    el.progressPercent.textContent = `${value}%`;
    el.progressLabel.textContent = label;
  }

  function setBusy(next, label) {
    busy = next;
    el.scan.disabled = next;
    el.apply.disabled = next;
    if (label) el.scan.textContent = label;
    if (!next) el.scan.textContent = "重新检测";
  }

  async function scan() {
    if (busy) return;
    if (!window.dzmm?.kv?.get) {
      el.status.textContent = "当前环境不支持旧版云存档读取，请从原游戏会话进入。";
      return;
    }
    recovered = {};
    warnings = [];
    el.apply.hidden = true;
    el.summary.hidden = true;
    setBusy(true, "正在检测...");
    setProgress(0, "正在读取旧版云存档");
    try {
      const scanned = await Data.scan((completed, total, label) => {
        setProgress(completed / total * 80, `已检测：${label}`);
      });
      setProgress(85, "正在执行兼容性预检");
      const prepared = Data.prepare(scanned);
      recovered = prepared.values;
      warnings = prepared.warnings;
    } catch (err) {
      recovered = null;
      console.error("旧存档检测失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.code === "EMPTY_LEGACY_DATA"
        ? "当前会话没有找到可恢复的旧版云存档。"
        : `${err?.message || "旧存档检测失败"}，尚未覆盖当前进度。`;
      setProgress(100, "检测未通过，当前存档未改变", "error");
      setBusy(false);
      return;
    }
    setBusy(false);
    setProgress(100, "检测与兼容性预检完成", "success");
    renderSummary(recovered);
    el.status.textContent = warnings.length
      ? `已找到旧存档；${warnings.length}项异常的可选数据将安全跳过。`
      : "已找到旧存档，兼容性预检通过。请确认摘要后继续。";
    el.apply.hidden = false;
  }

  async function applyRecovery() {
    if (busy || !recovered) return;
    if (!window.confirm("恢复旧存档会覆盖当前人生及跨周目数据，确定继续？")) return;
    setBusy(true, "恢复处理中...");
    let backup = null;
    let wroteSnapshot = false;
    try {
      setProgress(5, "正在再次校验旧存档");
      recovered = Data.prepare(recovered).values;
      setProgress(20, "正在备份当前存档");
      backup = await Data.current();
      const transaction = Data.transaction(recovered, backup);
      setProgress(45, "正在写入恢复快照");
      const receipt = await LG.storageChat.replace(transaction);
      wroteSnapshot = true;
      setProgress(75, "正在回读并核对恢复快照");
      await Data.verifySnapshot(receipt, transaction);
      setProgress(95, "正在同步本地安全副本");
      Data.updateLocalFallback(recovered);
      setProgress(100, "恢复完成，准备重新载入", "success");
      el.status.textContent = "旧存档已通过写入校验。若启动异常，系统会自动回滚原存档。";
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      console.error("旧存档恢复失败:", err?.code, err?.message, err?.stack);
      if (wroteSnapshot && backup) {
        setProgress(90, "校验失败，正在自动回滚");
        try {
          await LG.storageChat.replace(backup);
          Data.updateLocalFallback(backup);
          el.status.textContent = "恢复校验失败，已自动恢复原存档，可稍后重试。";
          setProgress(100, "已回滚到恢复前存档", "error");
        } catch (rollbackErr) {
          console.error("恢复回滚失败:", rollbackErr?.code,
            rollbackErr?.message, rollbackErr?.stack);
          el.status.textContent = "恢复状态未能确认，请勿刷新并稍后重新进入游戏。";
          setProgress(100, "恢复与回滚均未确认", "error");
        }
      } else {
        el.status.textContent = `${err?.message || "恢复写入失败"}，当前存档未改变。`;
        setProgress(100, "恢复未执行", "error");
      }
      setBusy(false);
    }
  }

  function open() {
    if (!el.dialog.open) el.dialog.showModal();
  }

  function init() {
    el.dialog = document.getElementById("recoveryDialog");
    el.summary = document.getElementById("recoverySummary");
    el.status = document.getElementById("recoveryStatus");
    el.progress = document.getElementById("recoveryProgress");
    el.progressBar = document.getElementById("recoveryProgressBar");
    el.progressLabel = document.getElementById("recoveryProgressLabel");
    el.progressPercent = document.getElementById("recoveryProgressPercent");
    el.scan = document.getElementById("scanRecoveryButton");
    el.apply = document.getElementById("applyRecoveryButton");
    document.getElementById("recoveryButton").addEventListener("click", open);
    document.getElementById("recoveryGateButton").addEventListener("click", open);
    document.getElementById("closeRecoveryButton")
      .addEventListener("click", () => el.dialog.close());
    el.scan.addEventListener("click", scan);
    el.apply.addEventListener("click", applyRecovery);
  }

  init();
})(window.LifeGame);
