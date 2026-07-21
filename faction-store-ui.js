(function (LG) {
  const el = {};
  let active = null;
  let view = "normal";
  let busy = false;
  let store = null;
  let latestStoreRequest = 0;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function owned(id) {
    return LG.career.data().characterItems?.includes(id);
  }
  async function refreshStore() {
    const requestId = ++latestStoreRequest;
    const result = await LG.authority.inspect("viewFactionStore", {
      characterId: active.id,
    });
    if (requestId !== latestStoreRequest || result.store?.characterId !== active.id) {
      return false;
    }
    store = result.store;
    return true;
  }
  async function mutate(method, body) {
    if (busy) return;
    const sacrifice = method === "useFactionSpecial"
      ? LG.factionLeaderSacrifice?.capture?.(active, view) : null;
    const buttImpact = method === "usePotion"
      ? LG.buttImpactPopup?.captureFaction?.(active, body?.itemId) : null;
    let status = "";
    let needsRefresh = false;
    busy = true;
    render();
    try {
      const result = await LG.authority.mutate(method, body);
      if (result.store?.characterId === active.id) store = result.store;
      else needsRefresh = true;
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      LG.careerUI.refresh();
      LG.equipmentUI.refresh();
      status = result.message;
      if (method === "usePotion" || method === "useFactionSpecial") LG.itemFeedback?.show?.(
        result.message, method === "useFactionSpecial" ? "private" : "normal");
      LG.factionLeaderSacrifice?.complete?.(sacrifice, result.action);
      LG.buttImpactPopup?.completeFaction?.(buttImpact);
    } catch (err) {
      console.error("职业角色商城结算失败:", err?.code, err?.message, err?.stack);
      status = err?.message || "商城操作失败，请稍后重试。";
    } finally {
      busy = false;
      render();
      el.status.textContent = status;
      if (needsRefresh) refreshStore().then((changed) => {
        if (!changed) return;
        render();
        el.status.textContent = status;
      }).catch((err) => console.warn("商城状态补充同步失败:",
        err?.code, err?.message, err?.stack));
    }
  }
  function itemCard(item) {
    const data = LG.career.data();
    const price = store?.[view]?.find((entry) => entry.index === item.index);
    const card = node("article", `collectible-card${owned(item.id) ? " owned" : ""}`);
    card.append(node("span", "collectible-mark", owned(item.id) ? "已获得"
      : view === "normal" ? "普通收藏" : "私密收藏"),
    node("strong", "", item.name), node("p", "", item.description));
    const button = node("button", "", owned(item.id) ? "已获得"
      : price ? `${price.pointCost}属性点 + ${price.statCost}${price.statLabel}`
        : "价格同步中");
    button.type = "button";
    button.disabled = busy || owned(item.id) || price?.canBuy !== true;
    button.addEventListener("click", () => mutate("buyFactionItem", {
      characterId: active.id, privacy: view, index: item.index,
    }));
    card.append(button);
    if (view === "private" && item.index === 5 && store?.specialUse?.available) {
      const use = node("button", "career-special-use",
        store.specialUse.label);
      use.type = "button";
      use.disabled = busy || store.specialUse.canUse !== true;
      use.addEventListener("click", () =>
        mutate("useFactionSpecial", { characterId: active.id }));
      card.append(use);
    }
    return card;
  }
  function pieceClaim(data) {
    const mode = view === "normal" ? "master" : "consumable";
    const claimId = `${active.id}-${mode}`;
    const allOwned = LG.CAREER_DATA.items(active, view)
      .every((item) => owned(item.id));
    const claimed = data.setClaims?.includes(claimId);
    const card = node("article", `collectible-card${claimed ? " owned" : ""}`);
    card.append(node("span", "collectible-mark", "免费领取"),
      node("strong", "", `职业${mode === "master" ? "大师" : "耗材"}套装部件 ×${active.pieces}`),
      node("p", "", "集齐本商城前五件道具图鉴后开放领取资格。"));
    const button = node("button", "", claimed ? "已领取"
      : allOwned ? "免费领取" : "需要集齐前五件图鉴");
    button.type = "button";
    button.disabled = busy || claimed || !allOwned;
    button.addEventListener("click", () => mutate("claimFactionPiece", {
      characterId: active.id, mode,
    }));
    card.append(button);
    return card;
  }
  function professionPanel() {
    if (active.rankIndex !== 2) return null;
    const jobs = store?.professions || [];
    const panel = node("section", "faction-profession-panel");
    panel.append(
      node("h3", "", `${active.name} · 势力专属职业`),
      node("p", "", "解锁条件与扣费由权威职业档案结算。"),
    );
    const grid = node("div", "faction-profession-grid");
    jobs.forEach((job) => {
      const button = node("button", "", job.unlocked
        ? `${job.name} · 已解锁` : `解锁${job.name} · ${job.costLabel}`);
      button.type = "button";
      button.disabled = busy || job.unlocked || job.canUnlock !== true;
      button.addEventListener("click", () => mutate("unlockFactionProfession", {
        characterId: active.id, professionId: job.id,
      }));
      grid.append(button);
    });
    panel.append(grid);
    return panel;
  }

  function render() {
    if (!active) return;
    if (!store) {
      el.status.textContent = "正在读取权威商城数据...";
      el.items.replaceChildren(node("p", "system-status", "商城加载中"));
      return;
    }
    const data = LG.career.data();
    const faction = LG.CAREER_DATA.factions[active.faction];
    el.faction.textContent = `${faction.name} · ${
      active.branchLabel || faction.location}`;
    el.title.textContent = `${LG.CAREER_DATA.characterLabel(active)}的${
      view === "normal" ? "正常" : "丧志"}商城`;
    el.status.textContent = view === "normal"
      ? `消耗属性点与${LG.CAREER_DATA.stats[data.factions?.find((item) =>
        item.id === active.faction)?.stat] || "势力主属性"}；集齐五件后免费领取职业大师部件。`
      : "消耗属性点与羞耻值；集齐五件后免费领取职业耗材部件，并开放特殊道具使用权。";
    const profession = professionPanel();
    const characterActions = LG.careerCharacterActions.panel(active, view, busy);
    el.items.replaceChildren(
      ...(profession ? [profession] : []),
      ...(characterActions ? [characterActions] : []),
      ...LG.CAREER_DATA.items(active, view).map(itemCard),
      ...(view === "private"
        ? LG.factionConsumablesUI.cards(active, store.consumables, busy, mutate) : []),
      pieceClaim(data),
    );
    el.tabs.forEach((button) => button.setAttribute("aria-selected",
      String(button.dataset.factionStoreView === view)));
  }

  LG.factionStoreUI = {
    init() {
      el.dialog = document.getElementById("factionStoreDialog");
      el.faction = document.getElementById("factionStoreFaction");
      el.title = document.getElementById("factionStoreTitle");
      el.status = document.getElementById("factionStoreStatus");
      el.items = document.getElementById("factionStoreItems");
      el.tabs = [...document.querySelectorAll("[data-faction-store-view]")];
      document.getElementById("closeFactionStoreButton")
        .addEventListener("click", () => el.dialog.close());
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        view = button.dataset.factionStoreView;
        render();
      }));
    },
    open(characterId, initialView = "normal") {
      active = LG.CAREER_DATA.roster.find((item) => item.id === characterId);
      if (!active) return;
      store = null;
      view = initialView === "private" ? "private" : "normal";
      render();
      el.dialog.showModal();
      refreshStore().then(() => render()).catch((err) => {
        console.error("职业角色商城读取失败:", err?.code, err?.message, err?.stack);
        el.status.textContent = err?.message || "商城读取失败，请关闭后重试。";
      });
    },
    ownedItems(privacy) {
      const ids = new Set(LG.career.data().characterItems || []);
      return LG.CAREER_DATA.roster.flatMap((character) =>
        LG.CAREER_DATA.items(character, privacy)).filter((item) => ids.has(item.id));
    },
  };
})(window.LifeGame);
