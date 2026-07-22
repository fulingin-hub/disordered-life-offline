(function () {
  let installPrompt = null;
  const languageKey = "disordered-life-language-v1";

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function download(name, value) {
    const text = JSON.stringify(value, null, 2);
    if (window.AndroidOffline?.saveJson) {
      window.AndroidOffline.saveJson(name, text);
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(
      [text], { type: "application/json" }));
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function exportSave(status) {
    const storage = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key) storage[key] = localStorage.getItem(key);
    }
    download(`disordered-life-${new Date().toISOString().slice(0, 10)}.json`, {
      product: "disordered-life-offline",
      exportedAt: new Date().toISOString(),
      database: await OfflineDB.dump(),
      localStorage: storage,
    });
    status.textContent = "离线存档已经导出。";
  }

  async function importSave(file, status) {
    const language = localStorage.getItem(languageKey);
    const payload = JSON.parse(await file.text());
    if (payload?.product !== "disordered-life-offline" || !payload.database) {
      throw new Error("这不是有效的失序人生离线存档。");
    }
    await OfflineDB.restore(payload.database);
    localStorage.clear();
    Object.entries(payload.localStorage || {}).forEach(([key, value]) => {
      localStorage.setItem(key, String(value));
    });
    if (language) localStorage.setItem(languageKey, language);
    status.textContent = "存档导入完成，正在重新载入。";
    window.setTimeout(() => location.reload(), 400);
  }

  async function reset(status) {
    if (!window.confirm("确定删除本机全部离线存档？此操作无法撤销。")) return;
    const language = localStorage.getItem(languageKey);
    await OfflineDB.clear();
    localStorage.clear();
    if (language) localStorage.setItem(languageKey, language);
    status.textContent = "离线存档已经清除。";
    window.setTimeout(() => location.reload(), 400);
  }

  function languageSelect() {
    const select = node("select", "offline-language-select");
    select.setAttribute("aria-label", "语言");
    [
      ["zh-CN", "简体中文"],
      ["ja", "日本語"],
      ["en", "English"],
    ].forEach(([value, label]) => {
      const option = node("option", "", label);
      option.value = value;
      select.append(option);
    });
    select.value = window.OfflineI18n?.locale?.() || "zh-CN";
    select.addEventListener("change", () => {
      window.OfflineI18n?.setLocale?.(select.value);
    });
    return select;
  }

  function buildDialog() {
    const dialog = node("dialog", "offline-dialog");
    const title = node("h2", "", "离线管理");
    const status = node("p", "offline-status", "存档只保存在当前设备。");
    const languageRow = node("label", "offline-language-row", "语言");
    languageRow.append(languageSelect());
    const actions = node("div", "offline-actions");
    const exportButton = node("button", "", "导出存档");
    const importButton = node("button", "", "导入存档");
    const installButton = node("button", "", "安装到主屏幕");
    const resetButton = node("button", "danger", "清除本机存档");
    const closeButton = node("button", "quiet-button", "关闭");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.hidden = true;

    exportButton.addEventListener("click", () => {
      exportSave(status).catch((error) => { status.textContent = error.message; });
    });
    importButton.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) importSave(file, status)
        .catch((error) => { status.textContent = error.message; });
    });
    installButton.addEventListener("click", async () => {
      if (!installPrompt) {
        status.textContent = "请使用浏览器菜单中的“添加到主屏幕”。";
        return;
      }
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.disabled = true;
    });
    resetButton.addEventListener("click", () => {
      reset(status).catch((error) => { status.textContent = error.message; });
    });
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dialog.close();
    });
    actions.append(exportButton, importButton, installButton, resetButton);
    dialog.append(title, languageRow, status, actions, closeButton, input);
    document.body.append(dialog);
    return dialog;
  }

  function init() {
    const dialog = buildDialog();
    const button = node("button", "quiet-button", "离线管理");
    button.type = "button";
    button.addEventListener("click", () => dialog.showModal());
    const topActions = document.querySelector(".top-actions");
    topActions?.prepend(languageSelect());
    topActions?.append(button);
    const contentPanel = document.querySelector(".content-mode-panel");
    const contentNotice = contentPanel?.querySelector(".content-mode-notice");
    const contentLanguageRow = node("label",
      "offline-language-row content-language-row", "语言");
    const contentLanguage = languageSelect();
    contentLanguage.classList.add("offline-language-gate");
    contentLanguageRow.append(contentLanguage);
    contentNotice?.before(contentLanguageRow);
    const genderPanel = document.querySelector(".gender-panel");
    const genderOptions = genderPanel?.querySelector(".gender-options");
    const gateLanguageRow = node("label",
      "offline-language-row gender-language-row", "语言");
    const gateLanguage = languageSelect();
    gateLanguage.classList.add("offline-language-gate");
    gateLanguageRow.append(gateLanguage);
    genderOptions?.before(gateLanguageRow);
    genderPanel?.append(button.cloneNode(true));
    const gateButton = document.querySelector(".gender-panel .quiet-button:last-child");
    gateButton?.addEventListener("click", () => dialog.showModal());
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });
  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
