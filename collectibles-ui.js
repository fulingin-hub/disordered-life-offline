(function (LG) {
  const el = {};
  let buying = false;
  let activeCharacter = null;
  let archivePrivacy = "private";
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function useButton(item, source = "character") {
    return LG.collectionUseUI.button({
      owned: true, source, roomId: item.character, itemId: item.id,
      tone: source === "saint" || item.privacy === "normal" ? "normal" : "private",
      onStatus: (text) => { el.collectionStatus.textContent = text; },
      onRefresh: () => renderCollection(item.character),
    });
  }
  function purchaseButton(item) {
    const tribute = item.source === "tribute";
    const roomUnlocked = LG.achievements.isUnlocked(item.character);
    const shopUnlocked = LG.collectibles.shopUnlocked();
    const points = LG.traits.points(); const price = LG.infernalChurch.price(item.price);
    const button = node("button");
    button.type = "button";
    button.disabled = buying || tribute || !roomUnlocked || !shopUnlocked
      || points < price;
    button.textContent = tribute ? `贡金${item.unlockAt}点自动获得`
      : !roomUnlocked ? "先解锁角色房间"
        : !shopUnlocked ? "丧志100点后购买"
          : points < price ? `需要${price}点` : `${price}点购买`;
    button.addEventListener("click", () => buy(item));
    return button;
  }
  function itemCard(item, roomMode = false) {
    const owned = LG.collectibles.owns(item.id);
    const card = node("article", `collectible-card${owned ? " owned" : ""}`);
    card.append(
      node("span", "collectible-mark", owned ? "已获得" : "未获得"),
      node("strong", "", item.name),
      node("p", "", item.description),
    );
    if (roomMode) card.append(owned ? useButton(item) : purchaseButton(item));
    return card;
  }
  function saintCard(item, roomMode = false) {
    const owned = LG.saintItems.owns(item.id);
    const card = node("article", `collectible-card${owned ? " owned" : ""}`);
    card.append(
      node("span", "collectible-mark", owned ? "已获得" : "圣徒礼赞"),
      node("strong", "", item.name),
      node("p", "", item.description),
    );
    if (!roomMode) return card;
    if (owned) {
      card.append(useButton(item, "saint"));
      return card;
    }
    const button = node("button");
    button.type = "button";
    button.disabled = buying || LG.saintItems.balance() < item.price;
    button.textContent = LG.saintItems.balance() < item.price
      ? `需要${item.price}成就点` : `${item.price}成就点激活`;
    button.addEventListener("click", () => buySaint(item));
    card.append(button);
    return card;
  }
  function renderArchive() {
    if (archivePrivacy === "corruption") {
      const collection = LG.corruptedCollectionUI.view();
      el.ownedLabel.textContent = "已获得堕落收藏";
      el.ownedCount.textContent = `${collection.count}/${collection.total} · 库存${collection.quantity}`;
      el.status.textContent = collection.count
        ? `已收录${collection.count}/${collection.total}种堕落收藏；重复获取会增加库存。`
        : "尚未获得堕落收藏。";
      el.items.replaceChildren(...collection.cards);
      if (!collection.cards.length) el.items.append(node(
        "p", "system-status", "没有符合当前筛选条件的堕落收藏。"));
      el.privacyTabs.forEach((button) => button.setAttribute("aria-selected",
        String(button.dataset.collectionPrivacy === archivePrivacy)));
      return;
    }
    el.ownedLabel.textContent = "已获得角色道具";
    const regular = Object.values(LG.COLLECTIBLE_CATALOG).flat()
      .filter((item) => LG.collectibles.owns(item.id)
        && (item.privacy || "private") === archivePrivacy);
    const saint = LG.collectionFilters.ownedSaintItems();
    const visibleSaint = archivePrivacy === "normal" ? saint : [];
    const careerItems = LG.factionStoreUI?.ownedItems?.(archivePrivacy) || [];
    const all = Object.values(LG.COLLECTIBLE_CATALOG).flat()
      .filter((item) => (item.privacy || "private") === archivePrivacy);
    const total = all.length + (archivePrivacy === "normal" ? 5 : 0);
    const careerTotal = (LG.CAREER_DATA?.roster?.length || 0) * 5;
    const entries = LG.collectionFilters.entries(
      regular, visibleSaint, careerItems);
    LG.collectionFilters.updateCharacters(entries);
    const visible = LG.collectionFilters.apply(entries);
    el.ownedCount.textContent = `${regular.length + visibleSaint.length + careerItems.length}/${
      total + careerTotal}`;
    el.status.textContent = regular.length || visibleSaint.length || careerItems.length
      ? `${archivePrivacy === "private" ? "私密" : "普通"}收藏仅供查看，不能在角色收藏页面使用道具。`
      : `尚未获得${archivePrivacy === "private" ? "私密" : "普通"}角色道具。`;
    el.items.replaceChildren(...visible.map((entry) => {
      if (entry.kind === "regular") return itemCard(entry.item);
      if (entry.kind === "saint") return saintCard(entry.item);
      return LG.collectionFilters.ownedCard(entry.item);
    }));
    if (!visible.length) el.items.append(node(
      "p", "system-status", "没有符合当前筛选条件的收藏。"));
    el.privacyTabs.forEach((button) => button.setAttribute("aria-selected",
      String(button.dataset.collectionPrivacy === archivePrivacy)));
  }
  async function buy(item) {
    if (buying) return;
    buying = true;
    let feedback = "";
    try {
      const result = await LG.authority.mutate("buyCollectible", {
        character: item.character, itemId: item.id,
      });
      feedback = result.message;
      LG.traitsUI.refresh();
      LG.equipmentUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("角色房间道具购买失败:", err?.code, err?.message, err?.stack);
      feedback = err?.message || "购买失败，请稍后重试。";
    } finally {
      buying = false;
      renderCollection(item.character);
      el.collectionStatus.textContent = feedback;
    }
  }
  async function buySaint(item) {
    if (buying) return;
    buying = true;
    let feedback = "";
    try {
      const result = await LG.authority.mutate("buySaintItem", { itemId: item.id });
      feedback = result.message;
      LG.equipmentUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("圣徒礼赞道具激活失败:", err?.code, err?.message, err?.stack);
      feedback = err?.message || "激活失败，请稍后重试。";
    } finally {
      buying = false;
      renderCollection(item.character);
      el.collectionStatus.textContent = feedback;
    }
  }
  function renderCollection(character) {
    const meta = LG.COLLECTIBLE_CHARACTERS[character];
    const progress = LG.collectibles.progress(character);
    const saintItems = LG.saintItems.items(character);
    el.collectionTitle.textContent = `${meta.name} · 专属道具图鉴`;
    el.collectionStatus.textContent = `${LG.collectibles.collectionStatus(character)
      } 可用属性点：${LG.traits.points()}；可用成就点：${LG.saintItems.balance()}`;
    el.collectionItems.replaceChildren(
      ...LG.collectibles.items(character).map((item) => itemCard(item, true)),
      ...saintItems.map((item) => saintCard(item, true)),
    );
  }
  LG.collectiblesUI = {
    init() {
      el.ownedLabel = document.getElementById("shopOwnedLabel");
      el.ownedCount = document.getElementById("shopOwnedCount");
      el.status = document.getElementById("shopStatus");
      el.items = document.getElementById("shopItems");
      el.collectionDialog = document.getElementById("collectionDialog");
      el.collectionTitle = document.getElementById("collectionTitle");
      el.collectionStatus = document.getElementById("collectionStatus");
      el.collectionItems = document.getElementById("collectionItems");
      el.privacyTabs = [...document.querySelectorAll("[data-collection-privacy]")];
      el.privacyTabs.forEach((button) => button.addEventListener("click", () => {
        archivePrivacy = button.dataset.collectionPrivacy;
        renderArchive();
      }));
      document.getElementById("closeCollectionButton")
        .addEventListener("click", () => el.collectionDialog.close());
      this.refresh();
    },
    openStore: renderArchive,
    openCollection(character) {
      if (!LG.achievements.isUnlocked(character)
        && !LG.saintItems.items(character).length) return;
      activeCharacter = character;
      renderCollection(character);
      el.collectionDialog.showModal();
    },
    refresh() {
      if (!el.items) return;
      if (LG.equipmentUI?.activePage?.() === "collection") renderArchive();
      if (el.collectionDialog?.open && activeCharacter) {
        renderCollection(activeCharacter);
      }
    },
  };
})(window.LifeGame);
