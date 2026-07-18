(function (LG) {
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  LG.infernalClubItemUI = {
    card(queen, item, busy, onBuy, onUse) {
      const consumable = item.type === "consumable";
      const price = LG.infernalClub.price(item);
      const owned = consumable
        ? LG.infernalClub.quantity(item.id) > 0 : LG.infernalClub.owns(item.id);
      const locked = item.type === "special" && !LG.infernalClub.fullSet(queen.id);
      const card = node("article",
        `club-item${owned ? " owned" : ""}${locked ? " locked" : ""}`);
      const heading = node("div", "club-item-heading");
      heading.append(node("strong", "", item.name), node("span", "",
        consumable ? `持有 ${LG.infernalClub.quantity(item.id)}`
          : owned ? "已收录" : `${price}人格`));
      const actions = node("div", "club-item-actions");
      const buy = node("button", "", consumable
        ? `购买 · ${price}` : owned ? "已拥有" : `购买 · ${price}`);
      buy.type = "button";
      buy.disabled = busy || locked || (!consumable && owned)
        || LG.infernalClub.personality() < price;
      buy.addEventListener("click", () => onBuy(queen, item));
      actions.append(buy);
      if (consumable) {
        const use = node("button", "quiet-button", "使用");
        use.type = "button";
        use.disabled = busy || LG.infernalClub.quantity(item.id) < 1;
        use.addEventListener("click", () => onUse(item));
        actions.append(use);
      }
      card.append(heading, node("p", "", locked
        ? "集齐该女魔王五件套后开放购买。" : item.description), actions);
      return card;
    },
  };
})(window.LifeGame);
