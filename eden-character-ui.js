(function (LG) {
  const el = {};
  let active = null;
  let activeView = "dining";
  let busy = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function stateFor(item) {
    return LG.edenCharacters.itemState(active.id, item.id);
  }

  function card(item) {
    const state = stateFor(item);
    const article = node("article",
      `eden-character-item${state.owned ? " owned" : ""}`);
    article.append(
      node("span", "market-kind", !state.unlocked ? "原菜单尚未完成"
        : state.owned ? "已加入装备图鉴" : "伊甸园角色商品"),
      node("strong", "", state.name),
      node("p", "", state.description),
      node("small", "", state.group === "consumable"
        ? `价格 ${state.price} 点 · 库存 ${state.quantity} · 累计饮用 ${state.used} 次`
        : `价格 ${state.price} 点 · 购买后立即食用${
          state.owned ? " · 图鉴已激活" : ""}`),
    );
    const actions = node("div", "eden-character-item-actions");
    const buy = node("button", "", !state.unlocked ? "完成原菜单后开放"
      : state.owned ? "再次购买" : "购买并收录");
    buy.type = "button";
    buy.disabled = busy || !state.unlocked || LG.traits.points() < state.price;
    buy.addEventListener("click", () => purchase(state.id));
    actions.append(buy);
    if (state.group === "consumable") {
      const use = node("button", "quiet-button", state.quantity ? "饮用" : "无库存");
      use.type = "button";
      use.disabled = busy || !state.quantity;
      use.addEventListener("click", () =>
        consume(`room-potion-${active.id}-${state.id}`));
      actions.append(use);
    }
    if (state.owned) {
      actions.append(LG.collectionUseUI.button({
        owned: true,
        source: "eden",
        roomId: active.id,
        itemId: state.id,
        tone: "normal",
        onStatus: (text) => LG.blackPrisonUI.status(text),
        onRefresh: () => render(),
      }));
    }
    article.append(actions);
    return article;
  }

  function render(message) {
    if (!active) return;
    const owned = active.items.filter((item) =>
      LG.edenCharacters.owns(active.id, item.id)).length;
    const unlocked = LG.edenCharacters.unlocked(active.id);
    el.points.textContent = String(LG.traits.points());
    el.progress.textContent = `装备图鉴 ${owned}/${active.items.length}`;
    el.hint.textContent = active.id === "edenChef"
      ? "原有奇珍与恶魔菜单全部完成后开放商城；13项图鉴全部激活后，两类餐饮均降为1点。"
      : "首次购买永久激活装备图鉴；两项全部激活后开放AI对话与画廊。";
    el.items.replaceChildren(...active.items.map(card));
    el.chat.disabled = busy || !unlocked;
    el.gallery.disabled = busy || !unlocked;
    el.chat.textContent = unlocked ? "AI对话" : "图鉴全部激活后开放";
    el.gallery.textContent = unlocked ? "角色画廊" : "图鉴全部激活后开放";
    if (message) LG.blackPrisonUI.status(message);
  }

  async function purchase(itemId) {
    if (busy) return;
    busy = true;
    render("正在确认伊甸园角色商品...");
    try {
      const result = await LG.authority.mutate("edenCharacterBuy", {
        character: active.id, itemId,
      });
      LG.traitsUI.refresh();
      LG.equipmentUI.refresh();
      render(result.message);
      LG.blackPrisonUI?.refresh?.();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("伊甸园角色商品购买失败:",
        err?.code, err?.message, err?.stack);
      render(err?.message || "购买失败，请稍后重试。");
    } finally {
      busy = false;
      render();
    }
  }

  async function consume(itemId) {
    if (busy) return;
    busy = true;
    render("正在保存饮用记录...");
    try {
      const result = await LG.authority.mutate("usePotion", { itemId });
      LG.ui.render(result.life);
      render(result.message);
      window.dzmm?.toast?.success?.(result.message);
      LG.itemFeedback?.show?.(result.message, "normal");
    } catch (err) {
      console.error("伊甸园角色商品饮用失败:",
        err?.code, err?.message, err?.stack);
      render(err?.message || "饮用失败，请稍后重试。");
    } finally {
      busy = false;
      render();
    }
  }

  function setRoomVisible(visible) {
    el.panel.hidden = !visible;
    document.getElementById("blackPrisonDining").hidden =
      !visible || activeView !== "dining";
    document.getElementById("blackPrisonClothing").hidden =
      !visible || activeView !== "clothing";
    el.chatView.hidden = visible;
  }

  LG.edenCharacterUI = {
    init() {
      [["panel", "edenCharacterPanel"], ["points", "edenCharacterPoints"],
        ["progress", "edenCharacterProgress"], ["hint", "edenCharacterHint"],
        ["items", "edenCharacterItems"],
        ["chat", "edenCharacterChatButton"],
        ["gallery", "edenCharacterGalleryButton"],
        ["chatView", "edenCharacterChat"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.chat.addEventListener("click", () => {
        if (!active || !LG.edenCharacters.canChat(active.id)) return;
        setRoomVisible(false);
        LG.edenCharacterChatUI.open(active.id);
      });
      el.gallery.addEventListener("click", () => {
        if (active) LG.galleryUI.open(active.id);
      });
    },
    open(characterId, view) {
      active = LG.edenCharacters.character(characterId);
      activeView = view === "clothing" ? "clothing" : "dining";
      setRoomVisible(true);
      render();
    },
    closeChat() {
      LG.edenCharacterChatUI.leave();
      setRoomVisible(true);
      render();
    },
    refresh: render,
  };
})(window.LifeGame);
