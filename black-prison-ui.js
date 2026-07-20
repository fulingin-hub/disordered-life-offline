(function (LG) {
  const el = {};
  let busy = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className; if (text !== undefined) item.textContent = text;
    return item;
  }
  function progressText(group) { const value = LG.blackPrison.progress(group); return `${value.count}/${value.total}`; }
  function actionLabel(item, owned, locked) {
    if (owned) return "已完成";
    if (locked) return "先完成命令2与命令3";
    if (["waiter", "chef", "materials"].includes(item.group)) return "执行命令";
    if (["rare", "demon"].includes(item.group)) return "确认点单";
    return "购入单品";
  }
  function itemCard(item) {
    const owned = LG.blackPrison.owns(item.id);
    const locked = item.group === "demon" && !LG.blackPrison.demonUnlocked();
    const card = node("article", `black-prison-item${owned ? " owned" : ""}`);
    const heading = node("div", "black-prison-item-heading");
    heading.append(
      node("strong", "", item.name),
      node("span", "", owned ? "已获得" : `${item.price}点`),
    );
    const button = node("button", "", actionLabel(item, owned, locked));
    button.type = "button";
    button.disabled = busy || owned || locked || LG.traits.points() < item.price;
    button.addEventListener("click", () => buy(item.id));
    card.append(heading, node("p", "", item.description), button);
    if (owned) card.append(LG.collectionUseUI.button({ owned, source: "paradise",
      roomId: "blackPrison", itemId: item.id,
      tone: /demon|infernal/.test(item.group) ? "private" : "normal",
      onStatus: (text) => { el.status.textContent = text; }, onRefresh: render }));
    return card;
  }
  function renderGroup(target, group) {
    target.replaceChildren(...LG.BLACK_PRISON_DATA.groups[group].map(itemCard));
  }
  function commandBlock(title, copy, items) {
    const block = node("section", "black-prison-command");
    const heading = node("div", "black-prison-command-heading");
    heading.append(node("h4", "", title), node("span", "", copy));
    const grid = node("div", "black-prison-grid");
    grid.replaceChildren(...items.map(itemCard));
    block.append(heading, grid);
    return block;
  }
  function renderServices() {
    const items = LG.BLACK_PRISON_DATA.groups.services;
    el.services.replaceChildren(
      commandBlock("命令1 · 让侍者服务", "三项共1500点",
        items.filter((item) => item.group === "waiter")),
      commandBlock("命令2 · 让厨师服务", "500点 · 开放三国厨师菜单",
        items.filter((item) => item.group === "chef")),
      commandBlock("命令3 · 挑选原材料", "500点 · 开放人物选择名录",
        items.filter((item) => item.group === "materials")),
    );
  }
  function countryState() {
    const state = LG.blackPrison.demonUnlockState();
    if (state.complete) return "厨师与原料名录已就绪";
    if (state.chef) return "厨师已就绪，等待原料名录";
    if (state.materials) return "原料名录已送达，等待厨师";
    return "需要先完成命令2与命令3";
  }

  function renderDemon() {
    el.demon.replaceChildren(...LG.BLACK_PRISON_DATA.demonCountries.map((country) => {
      const items = LG.BLACK_PRISON_DATA.groups.demon.filter((item) =>
        item.id.startsWith(`demon-${country.id}-`));
      return commandBlock(`${country.name} · ${country.price}点`,
        countryState(), items);
    }));
  }

  function render(message) {
    const access = LG.blackPrison.access();
    el.lives.textContent = String(access.lives);
    el.lifetime.textContent = String(access.points);
    el.points.textContent = String(LG.traits.points());
    const chefOpen = LG.edenStoreUI?.summaryMode?.() === "dining";
    el.healthLabel.textContent = chefOpen ? "噬人次数" : "当前健康"; el.health.textContent = String(chefOpen ? LG.blackPrison.demonMealsEaten() : LG.authority.state()?.stats?.health ?? 0);
    el.status.textContent = message || (LG.blackPrison.demonUnlocked()
      ? "厨师与原料菜单已开放。乐园只承认支付完成的命令。"
      : "先购买厨师现场制作与原料菜单，才能选择恶魔餐饮。");
    renderServices();
    renderGroup(el.rare, "rare");
    renderDemon();
    renderGroup(el.luxury, "luxury");
    renderGroup(el.infernal, "infernal");
    el.rareProgress.textContent = progressText("rare");
    el.demonProgress.textContent = progressText("demon");
    el.luxuryProgress.textContent = progressText("luxury");
    el.infernalProgress.textContent = progressText("infernal");
    LG.blackPrisonOutfitUI?.refresh?.();
  }

  async function buy(itemId) {
    if (busy) return;
    busy = true;
    render("正在由乐园账本确认消费...");
    try {
      const result = await LG.authority.mutate("blackPrisonBuy", { itemId });
      render(result.message);
      LG.traitsUI.refresh();
      LG.roomsUI.refresh();
      LG.protagonistPortrait.render(result.life);
      if (result.life.endingId) {
        LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
        LG.ui.render(result.life);
      }
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("乐园消费失败:", err?.code, err?.message, err?.stack);
      render(err?.message || "消费失败，请稍后重试。");
      window.dzmm?.toast?.error?.(el.status.textContent);
    } finally {
      busy = false;
      render(el.status.textContent);
    }
  }

  function switchView(view) {
    const activeView = view === "clothing" ? "clothing" : "dining";
    el.dining.hidden = activeView !== "dining";
    el.clothing.hidden = activeView !== "clothing";
    el.scroll.scrollTop = activeView === "clothing"
      ? el.clothing.offsetTop : 0;
  }

  LG.blackPrisonUI = {
    init() {
      [
        ["dialog", "blackPrisonDialog"], ["scroll", "blackPrisonScroll"],
        ["lives", "blackPrisonLives"],
        ["lifetime", "blackPrisonLifetime"], ["points", "blackPrisonPoints"],
        ["health", "blackPrisonHealth"], ["healthLabel", "blackPrisonHealthLabel"], ["status", "blackPrisonStatus"],
        ["dining", "blackPrisonDining"], ["clothing", "blackPrisonClothing"],
        ["services", "blackPrisonServices"], ["rare", "blackPrisonRare"],
        ["demon", "blackPrisonDemon"], ["luxury", "blackPrisonLuxury"],
        ["infernal", "blackPrisonInfernal"], ["rareProgress", "blackPrisonRareProgress"],
        ["demonProgress", "blackPrisonDemonProgress"],
        ["luxuryProgress", "blackPrisonLuxuryProgress"],
        ["infernalProgress", "blackPrisonInfernalProgress"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      LG.edenStoreUI.init(switchView);
      document.getElementById("closeBlackPrisonButton")
        .addEventListener("click", () => {
          el.dialog.close();
          LG.audio.scene("eden");
          LG.roomsUI.openParadise("eden");
        });
      switchView("dining");
    },
    roomCard(onEnter) {
      const access = LG.blackPrison.access();
      const card = node("article",
        `room-card black-prison-room-card${access.allowed ? " unlocked" : ""}`);
      const image = node("img"); image.src = LG.CONFIG.assets.edenWelcomeGate;
      image.alt = "伊甸园迎宾入口";
      image.loading = "lazy"; image.decoding = "async";
      const body = node("div", "room-card-body");
      body.append(
        node("span", "event-type", access.allowed ? "场景1 · 已开放" : "场景1 · 未达门槛"),
        node("h3", "", "伊甸园"),
        node("p", "", `人生 ${access.lives}/100 · 累计属性点 ${access.points}/2000`),
        node("p", "room-entry-copy", "黄金建筑催生无尽消费欲；在这里，属性点可以买到一切。"),
      );
      const tracks = node("div", "black-prison-access-tracks");
      [access.lifeProgress, access.pointProgress].forEach((value) => {
        const track = node("div", "room-progress"), fill = node("span");
        fill.style.width = `${value * 100}%`;
        track.append(fill);
        tracks.append(track);
      });
      const button = node("button", "", access.allowed ? "进入伊甸园" : "尚未获得终产者资格");
      button.type = "button";
      button.disabled = !access.allowed;
      button.addEventListener("click", onEnter);
      body.append(tracks, button);
      card.append(image, body);
      return card;
    },
    open() {
      if (!LG.blackPrison.access().allowed) return;
      LG.audio.scene("eden");
      render();
      LG.edenStoreUI.openLobby();
      el.dialog.showModal();
      el.scroll.scrollTop = 0;
    },
    refresh() {
      if (el.dialog?.open) render();
    },
    status(message) {
      if (el.status) el.status.textContent = message || "";
    },
  };
})(window.LifeGame);
