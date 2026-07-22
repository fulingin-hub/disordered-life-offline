(function (LG) {
  let fallbackMode = null;
  let textDialog;
  let textTitle;
  let textBody;

  function mode() {
    return LG.authority?.snapshot?.()?.contentMode || fallbackMode;
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
    if (mode() !== "15") return false;
    return showTextScene(title, description
      || "该段动态画面已由15+模式替换为文字叙述，游戏结算与累计效果保持不变。");
  }

  function guardGallery() {
    if (mode() !== "15") return false;
    showTextScene("画廊未开放",
      "15+模式不会解锁或显示任何画廊与CG内容。当前存档仍可正常游玩其他系统。");
    window.dzmm?.toast?.info?.("15+模式不开放画廊");
    return true;
  }

  function sync(snapshot) {
    fallbackMode = snapshot?.contentMode || null;
    document.documentElement.dataset.contentMode = fallbackMode || "unselected";
    if (fallbackMode !== "15") return;
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
    isTeen: () => mode() === "15",
    allowsGallery: () => mode() === "18",
    guardAnimation,
    guardGallery,
    showTextScene,
    sync,
  };
})(window.LifeGame);
