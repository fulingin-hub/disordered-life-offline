(function (LG) {
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const el = {};
  let busy = false;
  let requestId = 0;

  function parsePayload(file, text) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error("存档文件过大，无法安全导入。");
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (_) {
      throw new Error("存档文件不是有效的 JSON。");
    }
    if (payload?.format !== "disordered-life-save"
      || payload?.schemaVersion !== 2
      || !/^[a-zA-Z0-9-]{16,80}$/.test(payload?.backupId || "")) {
      throw new Error("这不是可恢复的失序人生权威存档文件。");
    }
    return payload;
  }

  function setBusy(next) {
    busy = next;
    el.button.disabled = next;
    el.exportButton.disabled = next;
    el.input.disabled = next;
  }

  function errorMessage(err) {
    if (err?.code === "function_not_published") {
      return "权威恢复服务尚未发布，请先保存游戏。";
    }
    if (err?.code === "AUTHORITY_RESULT_UNKNOWN") return err.message;
    if (err?.code === "function_error") {
      return err.message || "服务端拒绝了这份存档。";
    }
    return err?.message || "存档导入失败，请稍后重试。";
  }

  async function importFile(file) {
    if (busy || !file) return;
    const id = ++requestId;
    setBusy(true);
    el.status.textContent = "正在读取并校验存档文件...";
    try {
      const payload = parsePayload(file, await file.text());
      if (id !== requestId) return;
      if (!window.confirm(
        "从文件恢复会覆盖当前权威进度，确定继续？",
      )) {
        el.status.textContent = "已取消恢复，当前存档未改变。";
        return;
      }
      el.status.textContent = "正在由服务器校验并恢复权威进度...";
      const result = await LG.authority.mutate("importSave", {
        backupId: payload.backupId,
      });
      if (id !== requestId) return;
      el.status.textContent = result.message || "权威存档已恢复，正在重新载入。";
      window.setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      console.error("存档文件恢复失败:",
        err?.code, err?.message, err?.stack);
      el.status.textContent = errorMessage(err);
    } finally {
      if (id === requestId) {
        setBusy(false);
        el.input.value = "";
      }
    }
  }

  function init() {
    el.button = document.getElementById("importSaveFileButton");
    el.exportButton = document.getElementById("saveFileButton");
    el.input = document.getElementById("saveFileInput");
    el.status = document.getElementById("recoveryStatus");
    if (!el.button || !el.exportButton || !el.input || !el.status) return;
    el.button.addEventListener("click", () => {
      if (!busy) el.input.click();
    });
    el.input.addEventListener("change", () => {
      importFile(el.input.files?.[0]);
    });
  }

  LG.saveFileImport = { parsePayload, importFile };
  init();
})(window.LifeGame);
