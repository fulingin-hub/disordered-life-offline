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
      const drinkable = repeatable;
      const owned = !repeatable && LG.penitentiary.owns(item.id);
      const price = LG.penitentiary.itemPrice(role.id, item);
      const quantity = repeatable
        ? LG.penitentiary.consumableQuantity(role.id, item.id) : 0;
      const used = repeatable
        ? LG.penitentiary.consumableUsage(role.id, item.id) : 0;
      const allowance = repeatable
        ? LG.penitentiary.consumableAllowance(role.id, item.id) : null;
      const card = node("article",
        `penitentiary-shop-item${owned ? " owned" : ""}`);
      const status = owned ? "已激活" : repeatable && price === 0
        ? `影狱套装 · 免费 · 库存 ${quantity} · 累计饮用 ${used} 次 · ${allowance.label}`
        : repeatable
        ? `价格 ${price} 点 · 库存 ${quantity}${
          repeatable ? ` · 累计饮用 ${used} 次 · ${allowance.label}` : ""}`
        : `${price}赎罪卷`;
      card.append(node("span", "", status), node("strong", "", item.name),
        node("p", "", item.description));
      const actions = node("div", "eden-character-item-actions");
      const button = node("button", "", owned ? "已购买"
        : repeatable && price === 0 ? "免费领取" : "购买");
      button.type = "button";
      button.disabled = busy || consuming || owned
        || LG.penitentiary.coupons() < price;
      button.addEventListener("click", () => onBuy(item));
      actions.append(button);
      if (drinkable) {
        const use = node("button", "quiet-button",
          !quantity ? "无库存" : allowance.exhausted ? "已达上限" : "饮用");
        use.type = "button";
        use.disabled = busy || consuming || !quantity || allowance.exhausted;
        use.addEventListener("click", async () => {
          if (consuming) return;
          consuming = true;
          LG.penitentiaryUI.status("正在保存影狱饮品饮用记录...");
          try {
            const suffix = item.id.slice(role.id.length + 1);
            const potionId = `penitentiary-potion-${role.id}-${suffix}`;
            const result = await LG.authority.mutate("usePotion", { itemId: potionId });
            LG.ui.render(result.life);
            LG.penitentiaryShopUI.refresh();
            LG.penitentiaryUI.refresh(result.message);
            window.dzmm?.toast?.success?.(result.message);
          } catch (err) {
            console.error("影狱饮品饮用失败:", err?.code, err?.message, err?.stack);
            LG.penitentiaryUI.status(err?.message || "饮用失败，请稍后重试。");
          } finally {
            consuming = false;
            LG.penitentiaryShopUI.refresh();
          }
        });
        actions.append(use);
      }
      if (owned) {
        actions.append(LG.collectionUseUI.button({
          owned,
          source: "penitentiary",
          roomId: role.id,
          itemId: item.id,
          onStatus: (text) => LG.penitentiaryUI.status(text),
          onRefresh: () => LG.penitentiaryShopUI.refresh(),
        }));
      }
      card.append(actions);
      return card;
    },
  };
})(window.LifeGame);
