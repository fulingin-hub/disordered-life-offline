(function (LG) {
  const el = {};
  let active = null;
  let view = "normal";
  let busy = false;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function owned(id) {
    return LG.career.data().characterItems?.includes(id);
  }

  async function mutate(method, body) {
    if (busy) return;
    busy = true;
    try {
      const result = await LG.authority.mutate(method, body);
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      LG.careerUI.refresh();
      render();
      el.status.textContent = result.message;
      if (method === "usePotion" || method === "useFactionSpecial") LG.itemFeedback?.show?.(
        result.message, method === "useFactionSpecial" ? "private" : "normal");
    } catch (err) {
      console.error("职业角色商城结算失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "商城操作失败，请稍后重试。";
    } finally {
      busy = false;
    }
  }

  function itemCard(item) {
    const data = LG.career.data();
    const card = node("article", `collectible-card${owned(item.id) ? " owned" : ""}`);
    card.append(node("span", "collectible-mark", owned(item.id) ? "已获得"
      : view === "normal" ? "普通收藏" : "私密收藏"),
    node("strong", "", item.name), node("p", "", item.description));
    const stat = view === "normal"
      ? LG.CAREER_DATA.factions[active.faction].name + "主属性" : "羞耻";
    const button = node("button", "", owned(item.id) ? "已获得"
      : `${item.pointCost}属性点 + ${item.statCost}${stat}`);
    button.type = "button";
    button.disabled = busy || owned(item.id);
    button.addEventListener("click", () => mutate("buyFactionItem", {
      characterId: active.id, privacy: view, index: item.index,
    }));
    card.append(button);
    if (view === "private" && item.index === 5 && data.specialActivated) {
      const count = data.specialUses?.[active.specialKey || active.faction] || 0;
      const progress = active.rankIndex === 2 && owned(item.id)
        ? ` · 隐藏职业 ${Math.min(count, 101)}/101` : "";
      const use = node("button", "career-special-use",
        `使用特殊道具 · 10000属性点${progress}`);
      use.type = "button";
      use.disabled = busy;
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

  function professionPanel(data) {
    if (active.rankIndex !== 2) return null;
    const statId = data.factions?.find((item) => item.id === active.faction)?.stat;
    const balance = LG.authority.state()?.stats?.[statId] || 0;
    const jobs = (data.professionDefinitions || []).filter((item) =>
      !item.specialFaction && item.factions?.includes(active.faction)
      && (!item.branch || item.branch === active.branch));
    const panel = node("section", "faction-profession-panel");
    panel.append(
      node("h3", "", `${active.name} · 势力专属职业`),
      node("p", "", `当前${LG.CAREER_DATA.stats[statId]} ${balance}；每个职业消耗20000点永久解锁。`),
    );
    const grid = node("div", "faction-profession-grid");
    jobs.forEach((job) => {
      const button = node("button", "", job.unlocked
        ? `${job.name} · 已解锁` : `解锁${job.name} · 20000${LG.CAREER_DATA.stats[statId]}`);
      button.type = "button";
      button.disabled = busy || job.unlocked || balance < 20000;
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
    const profession = professionPanel(data);
    el.items.replaceChildren(
      ...(profession ? [profession] : []),
      ...LG.CAREER_DATA.items(active, view).map(itemCard),
      ...(view === "private"
        ? LG.factionConsumablesUI.cards(active, busy, mutate) : []),
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
      view = initialView === "private" ? "private" : "normal";
      render();
      el.dialog.showModal();
    },
    ownedItems(privacy) {
      const ids = new Set(LG.career.data().characterItems || []);
      return LG.CAREER_DATA.roster.flatMap((character) =>
        LG.CAREER_DATA.items(character, privacy)).filter((item) => ids.has(item.id));
    },
  };
})(window.LifeGame);
