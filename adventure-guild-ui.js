(function (LG) {
  const el = {};
  let active = "supply";
  let busy = false;
  let latest = 0;
  const cards = LG.adventureGuildCards;
  function setStatus(text) {
    el.status.textContent = text;
  }
  function setActive(next) {
    active = ["supply", "equipment", "corrupted", "inventory", "rewards"]
      .includes(next)
      ? next : "supply";
    el.tabs.forEach((button) => button.setAttribute("aria-selected",
      String(button.dataset.guildView === active)));
    render();
  }
  function renderInventory() {
    const supplies = LG.adventureGuild.supplyItems()
      .map((item) => cards.supplyCard(item, useSupply, busy));
    const equipment = LG.adventureGuild.equipmentItems()
      .map(cards.equipmentCard);
    const corrupted = LG.adventureGuild.corruptedItems()
      .map((item) => cards.corruptedCard(item, sell, busy));
    el.items.replaceChildren(...supplies, ...equipment, ...corrupted);
    if (!el.items.children.length) {
      el.items.append(cards.node("p", "system-status", "公会仓库暂时为空。"));
    }
  }
  function render() {
    if (!el.dialog) return;
    const data = LG.adventureGuild.data();
    el.tabs.forEach((button) => button.setAttribute("aria-selected",
      String(button.dataset.guildView === active)));
    el.points.textContent = String(data.points || 0);
    el.refreshCount.textContent = `${data.refreshesUsed || 0}/3`;
    el.chestCount.textContent = String(data.lootBoxes || 0);
    el.shareCount.textContent = `${data.rewards?.abyssShares || 0}/5`;
    el.refresh.textContent = data.refreshesRemaining > 0
      ? `刷新库存 · ${data.refreshCost}点` : "今日刷新已用完";
    el.refresh.disabled = busy || data.refreshesRemaining < 1;
    el.chest.disabled = busy || data.lootBoxes < 1;
    if (active === "inventory") renderInventory();
    else if (active === "rewards") {
      LG.adventureGuildRewardsUI.render(el.items, data, busy, act);
    }
    else {
      const offers = LG.adventureGuild.stock(active);
      el.items.replaceChildren(...offers.map((offer) =>
        cards.offerCard(offer, buy, busy)));
      if (!offers.length) {
        el.items.append(cards.node("p", "system-status", "今日没有该类商品。"));
      }
    }
  }
  async function act(method, args, pending) {
    if (busy) return;
    busy = true;
    const requestId = ++latest;
    setStatus(pending);
    render();
    try {
      const result = await LG.authority.mutate(method, args);
      if (requestId !== latest) return;
      setStatus(result.message || "公会结算完成。");
      LG.collectiblesUI?.refresh?.();
      LG.careerUI?.refresh?.();
      LG.dailyTasksUI?.refresh?.();
    } catch (err) {
      if (requestId !== latest) return;
      console.error("冒险者公会结算失败:",
        err?.code, err?.message, err?.stack);
      setStatus(err?.message || "公会结算失败，请稍后重试。");
    } finally {
      if (requestId === latest) busy = false;
      render();
    }
  }
  function buy(offer) {
    return act("adventureGuildBuy", { offerId: offer.id },
      `正在购买${offer.name}...`);
  }
  function sell(item) {
    return act("adventureGuildSell", { itemId: item.id },
      `正在回收${item.name}...`);
  }
  function useSupply(itemId) {
    return act("adventureGuildUseSupply", { itemId },
      "正在向职业任务提交补给...");
  }
  function handleWheel(event) {
    if (!el.dialog?.open || !el.items
      || el.items.scrollHeight <= el.items.clientHeight) return;
    const insideItems = event.target.closest?.("#adventureGuildItems");
    if (insideItems) return;
    el.items.scrollTop += event.deltaY;
    event.preventDefault();
  }
  function roomCard() {
    const data = LG.adventureGuild.data();
    const card = cards.node("article",
      "room-card area-room-card adventure-guild-room unlocked");
    const image = cards.node("img");
    image.src = LG.ADVENTURE_GUILD_DATA.headquartersScene;
    image.alt = "异界联盟冒险者公会总部大厅";
    image.loading = "lazy";
    image.decoding = "async";
    const body = cards.node("div", "room-card-body");
    const button = cards.node("button", "", "进入冒险者公会");
    button.type = "button";
    button.addEventListener("click", open);
    body.append(cards.node("span", "event-type", "社会区域 · 每日供应"),
      cards.node("h3", "", "异界联盟冒险者公会"),
      cards.node("p", "", `战利品箱 ${data.lootBoxes || 0} · 今日刷新 ${
        data.refreshesUsed || 0}/3`), button);
    card.append(image, body);
    return card;
  }
  function open(initialView = "supply") {
    active = ["supply", "equipment", "corrupted", "inventory", "rewards"]
      .includes(initialView) ? initialView : "supply";
    setStatus("每日限量补给、职业装备与十件堕落收藏已经同步。");
    render();
    if (!el.dialog.open) el.dialog.showModal();
  }
  function init() {
    [["dialog", "adventureGuildDialog"], ["items", "adventureGuildItems"],
      ["status", "adventureGuildStatus"], ["points", "adventureGuildPoints"],
      ["refreshCount", "adventureGuildRefreshCount"],
      ["chestCount", "adventureGuildChestCount"],
      ["shareCount", "adventureGuildShareCount"],
      ["refresh", "adventureGuildRefreshButton"],
      ["chest", "adventureGuildChestButton"],
      ["characters", "adventureGuildCharacters"],
      ["scene", "adventureGuildScene"]]
      .forEach(([key, id]) => { el[key] = document.getElementById(id); });
    el.tabs = [...document.querySelectorAll("[data-guild-view]")];
    el.scene.src = LG.ADVENTURE_GUILD_DATA.headquartersScene;
    el.characters.replaceChildren(...LG.ADVENTURE_GUILD_DATA.characters
      .map(cards.characterCard));
    el.tabs.forEach((button) => button.addEventListener("click", () =>
      setActive(button.dataset.guildView)));
    el.refresh.addEventListener("click", () => act(
      "adventureGuildRefresh", {}, "正在重新抽取今日限量库存..."));
    el.chest.addEventListener("click", () => act(
      "adventureGuildOpenChest", {}, "正在开启战利品宝箱..."));
    document.getElementById("closeAdventureGuildButton")
      .addEventListener("click", () => { latest += 1; el.dialog.close(); });
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      document.getElementById("closeAdventureGuildButton").click();
    });
    el.dialog.addEventListener("wheel", handleWheel, { passive: false });
    document.getElementById("infernalGuildButton")
      ?.addEventListener("click", open);
    LG.authority.subscribe(() => { if (el.dialog.open) render(); });
  }
  LG.adventureGuildUI = { init, open, roomCard, render };
  init();
})(window.LifeGame);
