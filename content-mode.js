(function (LG) {
  let fallbackMode = null;
  let textDialog;
  let textTitle;
  let textBody;

  function mode() {
    return LG.authority?.snapshot?.()?.contentMode || fallbackMode;
  }

  function adultSimulation() {
    return mode() === "18"
      && LG.authority?.state?.()?.gameMode === "simulation";
  }

  function buildTextDialog() {
    textDialog = document.createElement("dialog");
    textDialog.className = "content-mode-text-scene";
    textDialog.innerHTML = `
      <span class="event-type">15+ 文字场景</span>
      <h2></h2>
      <p></p>
      <div class="content-mode-confirm-actions">
        <button type="button">继续</button>
      </div>`;
    textTitle = textDialog.querySelector("h2");
    textBody = textDialog.querySelector("p");
    const close = () => textDialog.close();
    textDialog.querySelector("button").addEventListener("click", close);
    textDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(textDialog);
  }

  function showTextScene(title, description) {
    if (!textDialog) buildTextDialog();
    textTitle.textContent = title;
    textBody.textContent = description;
    if (!textDialog.open) textDialog.showModal();
    return true;
  }

  function guardAnimation(title, description) {
    if (adultSimulation()) return false;
    return showTextScene(title, description
      || "当前时间线使用15+表现，该段动态画面已替换为文字叙述，游戏结算与累计效果保持不变。");
  }

  function guardGallery() {
    if (adultSimulation()) return false;
    showTextScene("画廊未开放",
      "画廊只在选择18+内容模式后，于模拟人生时间线开放。幸福人生始终使用15+表现。");
    window.dzmm?.toast?.info?.("画廊仅在18+模拟人生开放");
    return true;
  }

  function sync(snapshot) {
    fallbackMode = snapshot?.contentMode || null;
    document.documentElement.dataset.contentMode = fallbackMode
      ? adultSimulation() ? "18" : "15" : "unselected";
    if (adultSimulation()) return;
    ["galleryDialog", "playerRoomDialog", "cgDialog", "archiveDialog"]
      .forEach((id) => {
        const dialog = document.getElementById(id);
        if (dialog?.open) dialog.close();
      });
    LG.characterFootImpactPopup?.close?.();
    LG.buttImpactPopup?.close?.();
    LG.contributionRitual?.close?.();
    LG.infernalStompPopup?.close?.();
  }

  LG.contentMode = {
    mode,
    adultSimulation,
    isTeen: () => !adultSimulation(),
    allowsGallery: adultSimulation,
    guardAnimation,
    guardGallery,
    showTextScene,
    sync,
  };
})(window.LifeGame);
