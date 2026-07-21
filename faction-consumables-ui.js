(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function quantity(id) {
    const potions = LG.authority.snapshot()?.economy?.blackMarket?.potions || [];
    return potions.find((item) => item.id === `faction-consumable-${id}`)?.quantity || 0;
  }

  function card(active, item, busy, mutate) {
    const count = quantity(item.id);
    const effects = LG.potionEffects.for({ specialKind: item.specialKind });
    const card = node("article", `collectible-card${count ? " owned" : ""}`);
    card.append(
      node("span", "collectible-mark", "通用售卖道具"),
      node("strong", "", item.name),
      node("p", "", `${LG.potionEffects.text(effects)}；六大势力丧志房间通用库存。`),
    );
    const actions = node("div", "club-item-actions");
    const buy = node("button", "", `购买 · ${item.price}属性点`);
    buy.type = "button";
    buy.disabled = busy || item.canBuy !== true;
    buy.addEventListener("click", () => mutate("buyFactionConsumable", {
      characterId: active.id, kind: item.id,
    }));
    const use = node("button", "quiet-button", `使用 · 持有${count}`);
    use.type = "button";
    use.disabled = busy || count < 1;
    use.addEventListener("click", () => mutate("usePotion", {
      itemId: `faction-consumable-${item.id}`,
    }));
    actions.append(buy, use);
    card.append(actions);
    return card;
  }

  LG.factionConsumablesUI = {
    cards(active, goods, busy, mutate) {
      return (goods || []).map((item) => card(active, item, busy, mutate));
    },
  };
})(window.LifeGame);
