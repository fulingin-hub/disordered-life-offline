(function (LG) {
  let consuming = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  LG.penitentiaryItemUI = {
    card(role, item, busy, onBuy) {
      const repeatable = item.type === "consumable";
      const edible = item.id.endsWith("holy-water")
        || item.id.endsWith("golden-sacrament");
      const owned = !repeatable && LG.penitentiary.owns(item.id);
      const price = LG.penitentiary.itemPrice(role.id, item);
      const quantity = repeatable
        ? LG.penitentiary.consumableQuantity(role.id, item.id) : 0;
      const used = edible ? LG.penitentiary.consumableUsage(role.id, item.id) : 0;
      const card = node("article",
        `penitentiary-shop-item${owned ? " owned" : ""}`);
      const status = owned ? "已激活" : repeatable
        ? `价格 ${price} 点 · 库存 ${quantity}${
          edible ? ` · 累计食用 ${used} 次` : ""}`
        : `${price}赎罪卷`;
      card.append(node("span", "", status), node("strong", "", item.name),
        node("p", "", item.description));
      const actions = node("div", "eden-character-item-actions");
      const button = node("button", "", owned ? "已购买" : repeatable ? "购买" : "购买");
      button.type = "button";
      button.disabled = busy || consuming || owned
        || LG.penitentiary.coupons() < price;
      button.addEventListener("click", () => onBuy(item));
      actions.append(button);
      if (edible) {
        const use = node("button", "quiet-button", quantity ? "食用" : "无库存");
        use.type = "button";
        use.disabled = busy || consuming || !quantity;
        use.addEventListener("click", async () => {
          if (consuming) return;
          consuming = true;
          LG.penitentiaryUI.status("正在保存影狱餐饮食用记录...");
          try {
            const potionId = `penitentiary-potion-${role.id}-${
              item.id.endsWith("holy-water") ? "holy-water" : "golden-sacrament"}`;
            const result = await LG.authority.mutate("usePotion", { itemId: potionId });
            LG.ui.render(result.life);
            LG.penitentiaryShopUI.refresh();
            LG.penitentiaryUI.refresh(result.message);
            window.dzmm?.toast?.success?.(result.message);
          } catch (err) {
            console.error("影狱餐饮食用失败:", err?.code, err?.message, err?.stack);
            LG.penitentiaryUI.status(err?.message || "食用失败，请稍后重试。");
          } finally {
            consuming = false;
            LG.penitentiaryShopUI.refresh();
          }
        });
        actions.append(use);
      }
      card.append(actions);
      return card;
    },
  };
})(window.LifeGame);
