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
    el.deleteSave.disabled = next;
    el.apply.disabled = next;
    if (label) el.scan.textContent = label;
    if (!next) el.scan.textContent = "重新选择前世";
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
    try {
      setProgress(5, "正在再次校验旧存档");
      recovered = Data.prepare(recovered).values;
      setProgress(35, "正在提交权威迁移请求");
      const result = await LG.authority.mutate("migrateLegacySave", {
        legacyData: recovered,
      });
      setProgress(85, "正在确认权威档案");
      if (!result?.life || !Number.isFinite(Number(result.authorityVersion))) {
        throw new Error("权威迁移结果无法确认");
      }
      Data.updateLocalFallback(recovered);
      setProgress(100, "恢复完成，准备重新载入", "success");
      el.status.textContent = result.message || "旧存档已迁移到权威档案。";
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      console.error("旧存档恢复失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = `${err?.message || "恢复写入失败"}，当前存档未改变。`;
      setProgress(100, "权威迁移未完成", "error");
      setBusy(false);
    }
  }

  async function deleteSave() {
    if (busy || !window.confirm(
      "放弃今生会永久删除当前人生及全部跨周目进度，确定一切重新开始？",
    )) return;
    setBusy(true);
    el.deleteSave.textContent = "正在删除...";
    setProgress(10, "正在删除当前权威存档");
    try {
      const result = await LG.authority.mutate("deleteSave");
      Data.updateLocalFallback({});
      setProgress(100, "当前存档已删除，准备重新载入", "success");
      el.status.textContent = result.message || "当前存档已删除，一切将重新开始。";
      window.setTimeout(() => window.location.reload(), 700);
    } catch (err) {
      console.error("当前存档删除失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "当前存档删除失败，请稍后重试。";
      setProgress(100, "删除未完成，当前存档未改变", "error");
      el.deleteSave.textContent = "放弃今生";
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
    el.deleteSave = document.getElementById("deleteSaveButton");
    el.apply = document.getElementById("applyRecoveryButton");
    document.getElementById("recoveryButton").addEventListener("click", open);
    document.getElementById("recoveryGateButton").addEventListener("click", open);
    document.getElementById("closeRecoveryButton")
      .addEventListener("click", () => el.dialog.close());
    el.scan.addEventListener("click", scan);
    el.deleteSave.addEventListener("click", deleteSave);
    el.apply.addEventListener("click", applyRecovery);
  }

  init();
})(window.LifeGame);
