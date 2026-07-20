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

  function roomCard(character, onEnter) {
    const unlocked = LG.blackMarket.roomUnlocked(character.id);
    const count = LG.blackMarket.kneelingCount(character.id);
    const medal = LG.blackMarket.currentMedal(character.id);
    const card = node("article", `room-card black-market-card${unlocked ? " unlocked" : ""}`);
    const image = node("img");
    image.src = LG.CONFIG.assets[character.id];
    image.alt = `${character.name} · ${character.role}`;
    const body = node("div", "room-card-body");
    const label = node("span", "event-type", unlocked ? "神秘黑市已解锁" : "媚外属性未达标");
    const title = node("h3", "", character.location);
    const track = node("div", "room-progress");
    const fill = node("span");
    fill.style.width = `${Math.min(100, count / 50 * 100)}%`;
    track.append(fill);
    const status = node("p", "", `下跪 ${count}/50 · ${medal?.label || "尚无勋章"}`);
    const button = node("button");
    button.type = "button";
    button.disabled = !unlocked;
    button.textContent = unlocked ? "进入黑市房间"
      : `媚外属性 ${LG.traits.value("foreign")}/30`;
    button.addEventListener("click", () => onEnter(character.id));
    body.append(label, title, track, status, LG.roomEntryCopy.node(character.id), button);
    card.append(image, body);
    return card;
  }

  function milestoneNodes() {
    const count = LG.blackMarket.kneelingCount(activeCharacter);
    return LG.blackMarket.milestones().map((item) => {
      const row = node("li", count >= item.count ? "unlocked" : "");
      row.append(
        node("strong", "", `${item.count}次 · ${item.label}`),
        node("span", "", item.benefit),
      );
      return row;
    });
  }

  function stockCard(item, state, purchased, limit) {
    const card = node("article", `market-item${item.sold ? " sold" : item.owned ? " owned" : ""}`);
    const price = item.type !== "equipment" && LG.penitentiary.policeSetEquipped(state) ? 0 : item.price;
    card.append(
      node("span", "market-kind", item.type === "equipment" ? "装备" : "药剂"),
      node("strong", "", item.name),
      node("p", "", item.description),
      node("small", "", price ? `${price} 属性点` : "影狱套装 · 免费"),
    );
    const button = node("button"); button.type = "button";
    const affordable = LG.traits.points() >= price; const adult = LG.blackMarket.currentAge(state) >= 18;
    button.disabled = busy || LG.blackMarketRefreshUI?.isBusy() || item.sold || item.owned || !adult || purchased >= limit
      || !affordable;
    button.textContent = item.sold ? "今日已售"
      : item.owned ? "已拥有" : !adult ? "18岁后可购买"
        : !limit ? "先下跪1次"
          : purchased >= limit ? "今日额度已用完"
            : !affordable ? `需要${price}点` : price ? "购买" : "免费领取";
    button.addEventListener("click", () => buy(item.id));
    card.append(button);
    return card;
  }

  function inventoryNodes(state, country) {
    const equipment = LG.blackMarket.equipmentItems()
      .filter((item) => item.country === country);
    const potions = LG.blackMarket.potions().filter((item) => item.country === country);
    const totals = LG.blackMarket.usageTotals();
    const rows = [node("p", "market-owned-note",
      `已购装备 ${equipment.length} 件，可在“主角面板 → 主角装备”中使用。`),
    node("p", "market-owned-note", `累计饮用：美味圣水 ${totals.holyWater} 次 · 黄金圣餐 ${totals.goldenSacrament} 次 · 健康归零 ${totals.healthZeroFromSpecials || 0}/500 次`)];
    potions.forEach((item) => {
      const row = node("article", "market-potion");
      const body = node("div");
      const allowance = LG.blackMarket.potionAllowance(item.id, state);
      body.append(node("strong", "", item.name),
        node("span", "", `库存 ${item.quantity} · ${item.description} · ${allowance.label}`));
      const button = node("button", "", !item.quantity ? "无库存"
        : allowance.exhausted ? "已达上限" : "饮用");
      button.type = "button";
      button.disabled = busy || !item.quantity || allowance.exhausted
        || LG.blackMarket.currentAge(state) < 18;
      button.addEventListener("click", () => usePotion(item.id));
      row.append(body, button);
      rows.push(row);
    });
    if (!potions.length) rows.push(node("p", "market-empty", "当前没有可用药剂。"));
    return rows;
  }

  function render(message) {
    if (!activeCharacter) return;
    const state = getState();
    const character = LG.BLACK_MARKET_DATA.characters[activeCharacter];
    const count = LG.blackMarket.kneelingCount(activeCharacter);
    const limit = LG.blackMarket.purchaseLimit(activeCharacter);
    const purchased = LG.blackMarket.purchasedToday(activeCharacter);
    el.kneels.textContent = String(count);
    el.limit.textContent = `${purchased}/${limit}`;
    el.points.textContent = String(LG.traits.points());
    el.status.textContent = message || `每日库存按UTC日期刷新；当前主角${LG.blackMarket.currentAge(state)}岁。`;
    el.milestones.replaceChildren(...milestoneNodes());
    el.stock.replaceChildren(...LG.blackMarket.stock(activeCharacter)
      .map((item) => stockCard(item, state, purchased, limit)));
    el.inventory.replaceChildren(...inventoryNodes(state, character.country));
    LG.blackMarketRefreshUI?.render();
  }

  async function buy(stockId) {
    if (busy) return;
    busy = true;
    render("正在保存购买记录…");
    try {
      const result = await LG.authority.mutate("buyMarket", {
        character: activeCharacter,
        stockId,
      });
      LG.traitsUI.refresh();
      LG.equipmentUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
      render(result.message);
    } catch (err) {
      console.error("黑市购买保存失败:", err.code, err.message, err.stack);
      render("购买记录保存失败，请稍后重试。");
    } finally {
      busy = false;
      render(el.status.textContent);
    }
  }

  async function usePotion(itemId) {
    if (busy) return;
    busy = true;
    render("正在保存药剂效果…");
    try {
      const result = await LG.authority.mutate("usePotion", { itemId });
      const state = LG.authority.state();
      LG.ui.render(state);
      window.dzmm?.toast?.success?.(result.message); LG.itemFeedback?.show?.(result.message, "normal");
      if (state.endingId) {
        LG.roomsUI.close();
        return;
      }
      render(result.message);
    } catch (err) {
      console.error("黑市药剂保存失败:", err.code, err.message, err.stack);
      render(err?.message || "药剂效果保存失败，请稍后重试。");
    } finally {
      busy = false;
      render(el.status.textContent);
    }
  }
  LG.blackMarketUI = {
    init(stateProvider) {
      getState = stateProvider;
      ["panel", "kneels", "limit", "points", "status", "milestones", "stock", "inventory"]
        .forEach((key) => { el[key] = document.getElementById(`blackMarket${key[0].toUpperCase()}${key.slice(1)}`); });
      el.messages = document.getElementById("roomMessages");
      el.form = document.getElementById("roomForm");
      el.roomStatus = document.getElementById("roomStatus");
      LG.blackMarketRefreshUI.init(() => activeCharacter, render, () => busy);
    },
    roomCards(onEnter) {
      return LG.blackMarket.characters().map((item) => roomCard(item, onEnter));
    },
    enter(character) {
      activeCharacter = character;
      el.panel.hidden = false;
      const canChat = LG.blackMarket.canChat(character);
      el.messages.hidden = !canChat;
      el.form.hidden = !canChat;
      el.roomStatus.textContent = canChat
        ? LG.dialogueAI.roomStatus(character)
        : `AI对话需实际下跪30次（当前${LG.blackMarket.kneelingCount(character)}次）；开放后消耗50点属性点可解锁20轮。`;
      render();
    },
    leave() {
      activeCharacter = null;
      if (!el.panel) return;
      el.panel.hidden = true;
      el.messages.hidden = false;
      el.form.hidden = false;
    },
    refresh() {
      if (activeCharacter) render();
    },
  };
})(window.LifeGame);
