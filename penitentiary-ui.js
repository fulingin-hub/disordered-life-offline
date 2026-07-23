(function (LG) {
  const el = {};
  let activeStage = 1, activeView = "tasks";
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function stageButton(role) {
    const unlocked = LG.penitentiary.stageUnlocked(role.stage);
    const button = node("button", role.stage === activeStage ? "active" : "",
      unlocked ? `${role.stage} · ${LG.characterDemographics.label(
        role.id, role.name)}` : `${role.stage} · 未解锁`);
    button.type = "button";
    button.disabled = !unlocked;
    button.addEventListener("click", () => { activeStage = role.stage; refresh(); });
    return button;
  }
  function switchView(view, resetShop = false) {
    activeView = view === "shop" ? "shop" : "tasks";
    if (activeView === "tasks") LG.penitentiaryChatUI.leave();
    el.tasks.hidden = activeView !== "tasks";
    el.shop.hidden = activeView !== "shop";
    el.tabs.forEach((button) => button.classList.toggle("active",
      button.dataset.penitentiaryView === activeView));
    if (activeView === "shop" && resetShop) LG.penitentiaryShopUI.open();
  }
  function refresh(message) {
    const access = LG.penitentiary.access();
    el.coupons.textContent = String(LG.penitentiary.coupons());
    el.lifetime.textContent = String(LG.penitentiary.lifetime());
    el.spent.textContent = String(LG.penitentiary.spentTotal());
    el.personality.textContent = String(LG.penitentiary.personality());
    el.zeroes.textContent = `${access.zeroedPoints}/50`;
    el.eden.textContent = `${access.edenPurchases}/10`;
    el.stages.replaceChildren(...LG.PENITENTIARY_DATA.roles.map(stageButton));
    LG.penitentiaryTasksUI.render(activeStage);
    LG.penitentiaryShopUI.refresh();
    el.status.textContent = message || "领取任务后可随时提交；五项全部完成时自动刷新下一轮。";
    switchView(activeView);
  }
  LG.penitentiaryUI = {
    init(stateProvider) {
      [["dialog", "penitentiaryDialog"], ["coupons", "penitentiaryCoupons"],
        ["lifetime", "penitentiaryLifetime"], ["zeroes", "penitentiaryZeroes"],
        ["spent", "penitentiarySpent"], ["personality", "penitentiaryPersonality"],
        ["eden", "penitentiaryEden"], ["stages", "penitentiaryStages"],
        ["status", "penitentiaryStatus"], ["tasks", "penitentiaryTasksView"],
        ["shop", "penitentiaryShopView"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.tabs = [...document.querySelectorAll("[data-penitentiary-view]")];
      el.tabs.forEach((button) => button.addEventListener("click", () =>
        switchView(button.dataset.penitentiaryView, true)));
      document.getElementById("closePenitentiaryButton").addEventListener("click", () => {
        if (LG.penitentiaryControlUI.open()) return;
        if (LG.penitentiary.lifetime() < 500) {
          const remaining = 500 - LG.penitentiary.lifetime();
          refresh(`影狱管制尚未解除：累计获得赎罪卷还差${remaining}点，暂时无法离开。`);
          window.dzmm?.toast?.warning?.(`累计获得500点赎罪卷后才能离开，还差${remaining}点。`);
          return;
        }
        LG.penitentiaryChatUI.leave();
        el.dialog.close();
        LG.audio.scene("shadow");
        LG.roomsUI.openParadise("shadow");
      });
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        document.getElementById("closePenitentiaryButton").click();
      });
      LG.penitentiaryTasksUI.init();
      LG.penitentiaryShopUI.init();
      LG.penitentiaryChatUI.init(stateProvider);
      LG.penitentiaryControlUI.init();
    },
    roomCard(onEnter) {
      const access = LG.penitentiary.access();
      const card = node("article", `room-card penitentiary-room-card${access.allowed ? " unlocked" : ""}`);
      const image = node("img"); image.src = LG.CONFIG.assets.shadowPrisonGateGuards;
      image.alt = "影狱黑色监狱门与四位女狱警";
      image.loading = "lazy"; image.decoding = "async";
      const body = node("div", "room-card-body");
      body.append(node("span", "event-type", access.allowed ? "场景2 · 已开放" : "场景2 · 未解锁"),
        node("h3", "", "影狱"),
        node("p", "", `属性点清零 ${access.zeroedPoints}/50 · 伊甸园消费 ${access.edenPurchases}/10`),
        node("p", "room-entry-copy", "在这里，你将被支配，从而获得救赎。"));
      const button = node("button", "", access.allowed ? "进入影狱" : "尚未满足全部条件");
      button.type = "button"; button.disabled = !access.allowed;
      button.addEventListener("click", onEnter); body.append(button); card.append(image, body);
      return card;
    },
    open() {
      if (!LG.penitentiary.access().allowed) return;
      LG.audio.scene("shadow");
      refresh();
      el.dialog.showModal();
      LG.penitentiaryControlUI.open();
    },
    refresh,
    status(text) { el.status.textContent = text; },
  };
})(window.LifeGame);
