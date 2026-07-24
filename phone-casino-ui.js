(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function render(content, status) {
    const shell = node("section", "phone-online-casino");
    const image = node("img", "phone-online-casino-scene");
    image.src = LG.CONFIG.assets.casinoScene;
    image.alt = "异域赌场大厅";
    image.loading = "lazy";
    const copy = node("div", "phone-online-casino-copy");
    const access = LG.casinoAccess.status();
    copy.append(
      node("span", "event-type", "线上赌场"),
      node("h3", "", "异域赌场"),
      node("p", "", "赌场入口、十轮赌局、角色商店和 AI 对话统一从这里进入。"),
      node("small", "", access.detail),
    );
    const button = node("button", "", access.allowed ? "进入赌场" : access.button);
    button.type = "button";
    button.disabled = !access.allowed;
    button.addEventListener("click", () => {
      LG.phoneUI.close();
      LG.casinoUI.open();
    });
    copy.append(button);
    shell.append(image, copy);
    status.textContent = access.allowed ? "赌场入口已准备好。" : access.detail;
    content.replaceChildren(shell);
  }

  LG.phoneCasinoUI = { render };
})(window.LifeGame);
