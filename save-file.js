(function (LG) {
  const el = {};
  let busy = false;

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function filename() {
    const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    return `disordered-life-save-${stamp}.json`;
  }

  function createFile(payload) {
    if (payload?.format !== "disordered-life-save"
      || payload?.schemaVersion !== 2
      || typeof payload?.backupId !== "string") {
      throw Object.assign(
        new Error("权威存档备份尚未准备完成，请稍后重试。"),
        { code: "SAVE_EXPORT_INVALID" },
      );
    }
    const filePayload = {
      ...copy(payload),
      clientGameVersion: Number(LG.CONFIG?.version) || 1,
      buildId: String(LG.CONFIG?.buildId || ""),
    };
    return new File(
      [JSON.stringify(filePayload, null, 2)],
      filename(),
      { type: "text/plain" },
    );
  }

  function canShare(file) {
    if (typeof navigator.share !== "function") return false;
    if (typeof navigator.canShare !== "function") return true;
    try {
      return navigator.canShare({ files: [file] });
    } catch (_) {
      return false;
    }
  }

  async function share(file) {
    if (!canShare(file)) return false;
    try {
      await navigator.share({
        files: [file],
        title: "失序人生存档",
        text: "失序人生存档备份",
      });
      return true;
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      console.warn("系统文件分享不可用，切换下载:",
        err?.name, err?.message, err?.stack);
      return false;
    }
  }

  async function pickFile(file) {
    if (typeof window.showSaveFilePicker !== "function") return false;
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: file.name,
        types: [{
          description: "Disordered Life save",
          accept: { "application/json": [".json"] },
        }],
      });
      const stream = await handle.createWritable();
      await stream.write(file);
      await stream.close();
      return true;
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      console.warn("文件选择器不可用，切换下载:",
        err?.name, err?.message, err?.stack);
      return false;
    }
  }

  function download(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function save() {
    if (busy) return;
    busy = true;
    el.button.disabled = true;
    if (el.importButton) el.importButton.disabled = true;
    el.status.textContent = "正在整理当前存档...";
    try {
      if (typeof LG.authority?.exportSave !== "function") {
        throw new Error("权威存档服务不可用，无法创建可恢复备份。");
      }
      const payload = await LG.authority.exportSave();
      const file = createFile(payload);
      const shared = await share(file);
      const picked = shared ? false : await pickFile(file);
      if (!shared && !picked) download(file);
      el.status.textContent = shared
        ? "存档文件已交给系统保存菜单。"
        : "存档文件已保存或下载。";
    } catch (err) {
      if (err?.name === "AbortError") {
        el.status.textContent = "已取消保存，当前存档未改变。";
      } else {
        console.error("保存存档文件失败:",
          err?.code, err?.message, err?.stack);
        el.status.textContent = err?.message || "保存存档文件失败，请稍后重试。";
      }
    } finally {
      busy = false;
      el.button.disabled = false;
      if (el.importButton) el.importButton.disabled = false;
    }
  }

  function init() {
    el.button = document.getElementById("saveFileButton");
    el.importButton = document.getElementById("importSaveFileButton");
    el.status = document.getElementById("recoveryStatus");
    if (!el.button || !el.status) return;
    el.button.addEventListener("click", save);
  }

  LG.saveFile = { createFile, save };
  init();
})(window.LifeGame);
