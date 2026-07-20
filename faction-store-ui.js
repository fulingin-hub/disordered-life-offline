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
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      LG.careerUI.refresh();
      render();
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
      const use = node("button", "career-special-use", "使用特殊道具 · 10000属性点");
      use.type = "button";
      use.disabled = busy;
      use.addEventListener("click", () =>
        mutate("useFactionSpecial", { characterId: active.id }));
      card.append(use);
    }
    return card;
  }

  function render() {
    if (!active) return;
    const data = LG.career.data();
    const faction = LG.CAREER_DATA.factions[active.faction];
    el.faction.textContent = `${faction.name} · ${faction.location}`;
    el.title.textContent = `${active.name}的${view === "normal" ? "正常" : "丧志"}商城`;
    el.status.textContent = view === "normal"
      ? `消耗属性点与${LG.CAREER_DATA.stats[data.factions?.find((item) =>
        item.id === active.faction)?.stat] || "势力主属性"}；前四件解锁职业大师部件。`
      : "消耗属性点与羞耻值；第五件解锁职业耗材部件与全职业特殊道具使用权。";
    el.items.replaceChildren(...LG.CAREER_DATA.items(active, view).map(itemCard));
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
    open(characterId) {
      active = LG.CAREER_DATA.roster.find((item) => item.id === characterId);
      if (!active) return;
      view = "normal";
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
