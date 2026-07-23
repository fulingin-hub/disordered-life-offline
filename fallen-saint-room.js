(function (LG) {
  const asset = "./assets/generated/fallen-saint-room.ff7bb5f1.webp";
  let dialog;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function unlocked() {
    return LG.contentMode?.adultSimulation?.() === true
      && LG.holyLight?.has?.("seven-desires-pet") === true;
  }

  function open() {
    if (!unlocked()) return;
    if (!dialog) {
      dialog = node("dialog", "priestess-trial-dialog fallen-saint-room");
      const heading = node("div", "trial-heading");
      const title = node("div");
      title.append(node("span", "event-type", "隐藏房间 · 地狱教会"),
        node("h2", "", "堕落圣徒的房间"));
      const close = node("button", "", "关闭");
      close.type = "button";
      close.addEventListener("click", () => dialog.close());
      heading.append(title, close);
      const image = node("img");
      image.src = asset;
      image.alt = "身穿黑色仪典袍的堕落圣徒";
      const copy = node("p", "trial-copy",
        "圣光教团覆灭后，这里只剩被改写的祷词与绿色魔纹。"
        + "她提醒你：隐藏成就“七大欲的宠奴”已让地狱教会任务可以直接完成，"
        + "并解锁特殊职业“堕落圣徒的无脑奴”。");
      dialog.append(heading, image, copy);
      document.body.append(dialog);
    }
    dialog.showModal();
  }

  function roomCard() {
    const card = node("article",
      `room-card area-room-card holy-room-card${unlocked() ? " unlocked" : ""}`);
    const image = node("img");
    image.src = asset;
    image.alt = "堕落圣徒的房间";
    image.loading = "lazy";
    const body = node("div", "room-card-body");
    body.append(node("span", "event-type",
      unlocked() ? "隐藏成就 · 已开放" : "隐藏成就 · 未开放"),
    node("h3", "", "堕落圣徒的房间"),
    node("p", "", unlocked()
      ? "七大欲的宠奴专属房间。"
      : "完成“放过女司祭”“女祭司的小把戏”，再选择背叛圣光。"));
    const button = node("button", "", unlocked() ? "进入房间" : "尚未解锁");
    button.type = "button";
    button.disabled = !unlocked();
    button.addEventListener("click", open);
    body.append(button);
    card.append(image, body);
    return card;
  }

  LG.fallenSaintRoom = { open, roomCard, unlocked, asset };
})(window.LifeGame);
