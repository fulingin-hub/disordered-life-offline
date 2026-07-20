(function (LG) {
  const el = {};
  let buying = false;
  let activeCharacter = null;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function useButton(item, source = "character") {
    return LG.collectionUseUI.button({
      owned: true, source, roomId: item.character, itemId: item.id,
      onStatus: (text) => { el.collectionStatus.textContent = text; },
      onRefresh: () => renderCollection(item.character),
    });
  }

  function purchaseButton(item) {
    const tribute = item.source === "tribute";
    const roomUnlocked = LG.achievements.isUnlocked(item.character);
    const shopUnlocked = LG.collectibles.shopUnlocked();
    const points = LG.traits.points();
    const button = node("button");
    button.type = "button";
    button.disabled = buying || tribute || !roomUnlocked || !shopUnlocked
      || points < item.price;
    button.textContent = tribute ? `贡金${item.unlockAt}点自动获得`
      : !roomUnlocked ? "先解锁角色房间"
        : !shopUnlocked ? "丧志100点后购买"
          : points < item.price ? `需要${item.price}点` : `${item.price}点购买`;
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

  function ownedSaintItems() {
    return LG.collectibles.characters().flatMap((character) =>
      LG.saintItems.items(character.id)).filter((item) =>
      LG.saintItems.owns(item.id));
  }

  function renderArchive() {
    const regular = Object.values(LG.COLLECTIBLE_CATALOG).flat()
      .filter((item) => LG.collectibles.owns(item.id));
    const saint = ownedSaintItems();
    const total = Object.values(LG.COLLECTIBLE_CATALOG).flat().length + 5;
    el.ownedCount.textContent = `${regular.length + saint.length}/${total}`;
    el.status.textContent = regular.length || saint.length
      ? "已获得道具汇总；购买和使用请前往对应角色房间。"
      : "尚未获得角色道具；请先进入已解锁角色房间购买或推进贡金。";
    el.items.replaceChildren(
      ...regular.map((item) => itemCard(item)),
      ...saint.map((item) => saintCard(item)),
    );
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
      el.ownedCount = document.getElementById("shopOwnedCount");
      el.status = document.getElementById("shopStatus");
      el.items = document.getElementById("shopItems");
      el.collectionDialog = document.getElementById("collectionDialog");
      el.collectionTitle = document.getElementById("collectionTitle");
      el.collectionStatus = document.getElementById("collectionStatus");
      el.collectionItems = document.getElementById("collectionItems");
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
