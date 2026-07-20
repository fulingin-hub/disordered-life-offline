(function (LG) {
  let busy = false;

  function setButtonsBusy(value) {
    document.querySelectorAll(".collection-use-button").forEach((button) => {
      button.disabled = value;
      button.textContent = value ? "使用中..." : "使用";
    });
  }

  async function use(options) {
    if (busy) return;
    busy = true;
    setButtonsBusy(true);
    options.onStatus?.("正在保存道具使用记录...");
    const statusTimer = window.setTimeout(() => {
      options.onStatus?.("正在确认结算结果，请勿重复操作...");
    }, 800);
    let feedback = "";
    try {
      const result = await LG.authority.mutate("useGalleryItem", {
        source: options.source,
        roomId: options.roomId,
        itemId: options.itemId,
      });
      feedback = result.message;
      LG.traitsUI?.refresh?.();
      LG.roomsUI?.refresh?.();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("图鉴道具使用失败:", err?.code, err?.message, err?.stack);
      feedback = err?.message || "使用失败，请稍后重试。";
      window.dzmm?.toast?.error?.(feedback);
    } finally {
      window.clearTimeout(statusTimer);
      busy = false;
      setButtonsBusy(false);
      options.onRefresh?.();
      options.onStatus?.(feedback);
    }
  }

  LG.collectionUseUI = {
    button(options) {
      if (!options.owned) return null;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiet-button collection-use-button";
      button.textContent = busy ? "使用中..." : "使用";
      button.disabled = busy;
      button.addEventListener("click", () => use(options));
      return button;
    },
  };
})(window.LifeGame);
