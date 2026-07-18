(function (LG) {
  const el = {};
  let getState;
  let activeCharacter = null;
  let busy = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function card(item, state) {
    const article = node("article", "room-consumable-card");
    const allowance = LG.blackMarket.potionAllowance(item.id, state);
    const price = item.price === 0 ? "影狱套装 · 免费"
      : item.tribute
      ? `价格 ${item.price} 点 · 不参与容器折扣`
      : item.discounted ? `价格 1 点 · 已持有${item.container}` : `价格 ${item.price} 点`;
    article.append(
      node("span", "market-kind", "角色饮品"),
      node("strong", "", item.name),
      node("p", "", item.description),
      node("small", "", `${price} · 库存 ${item.quantity} · 累计饮用 ${
        item.used} 次 · ${allowance.label}`),
    );
    const actions = node("div", "room-consumable-actions");
    const buyButton = node("button", "", "购买");
    buyButton.type = "button";
    buyButton.disabled = busy || !item.purchaseUnlocked || LG.traits.points() < item.price;
    buyButton.textContent = !item.purchaseUnlocked ? `贡金${item.tributeRequirement}点解锁`
      : LG.traits.points() < item.price ? `需要${item.price}点` : "购买";
    buyButton.addEventListener("click", () => buy(item.specialKind));
    const useButton = node("button", "quiet-button", "饮用");
    useButton.type = "button";
    const adult = LG.blackMarket.currentAge(state) >= 18;
    useButton.disabled = busy || !item.quantity || !adult || allowance.exhausted;
    useButton.textContent = !adult ? "18岁后饮用" : !item.quantity ? "无库存"
      : allowance.exhausted ? "已达上限" : "饮用";
    useButton.addEventListener("click", () => use(item.id));
    actions.append(buyButton, useButton);
    article.append(actions);
    return article;
  }

  function render(message) {
    if (!activeCharacter) return;
    const state = getState();
    const name = LG.COLLECTIBLE_CHARACTERS[activeCharacter].name;
    const tribute = LG.tribute.isCharacter(activeCharacter);
    el.points.textContent = String(LG.traits.points());
    el.status.textContent = message || (tribute
      ? `${name}累计贡金达到600点后开放购买；固定价格40/80点，不参与折扣。`
      : activeCharacter === "evelyn"
        ? `${name}出售成瘾药剂；基础限饮一次，恶魔神秘套装可额外饮用10次。`
        : `${name}角色饮品；持有对应容器后单价降至1点。`);
    el.items.replaceChildren(...LG.roomConsumables.items(activeCharacter)
      .map((item) => card(item, state)));
  }

  async function buy(kind) {
    if (busy) return;
    busy = true;
    render("正在保存购买记录…");
    try {
      const result = await LG.authority.mutate("buyRoomConsumable", {
        character: activeCharacter,
        kind,
      });
      LG.traitsUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
      render(result.message);
    } catch (err) {
      console.error("私密餐饮购买保存失败:", err.code, err.message, err.stack);
      render("购买记录保存失败，请稍后重试。");
    } finally {
      busy = false;
      render(el.status.textContent);
    }
  }

  async function use(itemId) {
    if (busy) return;
    busy = true;
    render("正在保存饮用记录…");
    try {
      const result = await LG.authority.mutate("usePotion", { itemId });
      const state = LG.authority.state();
      LG.ui.render(state);
      window.dzmm?.toast?.success?.(result.message);
      if (state.endingId) return LG.roomsUI.close();
      render(result.message);
    } catch (err) {
      console.error("私密餐饮保存失败:", err.code, err.message, err.stack);
      render(err?.message || "饮用记录保存失败，请稍后重试。");
    } finally {
      busy = false;
      if (activeCharacter) render(el.status.textContent);
    }
  }

  LG.roomConsumablesUI = {
    init(stateProvider) {
      getState = stateProvider;
      el.panel = document.getElementById("roomConsumablesPanel");
      el.points = document.getElementById("roomConsumablesPoints");
      el.status = document.getElementById("roomConsumablesStatus");
      el.items = document.getElementById("roomConsumablesItems");
    },
    enter(character) {
      activeCharacter = LG.roomConsumables.available(character) ? character : null;
      el.panel.hidden = !activeCharacter;
      if (activeCharacter) render();
    },
    leave() {
      activeCharacter = null;
      if (el.panel) el.panel.hidden = true;
    },
    refresh() {
      if (activeCharacter) render();
    },
  };
})(window.LifeGame);
