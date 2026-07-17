(function (LG) {
  const el = {};
  let selectedCharacter = "qin";
  let buying = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function itemCard(item, collectionOnly = false) {
    const owned = LG.collectibles.owns(item.id);
    const card = node("article", `collectible-card${owned ? " owned" : ""}`);
    card.append(
      node("span", "collectible-mark", owned ? "已激活" : "未激活"),
      node("strong", "", item.name),
      node("p", "", item.description),
    );
    if (!collectionOnly) {
      const roomUnlocked = LG.achievements.isUnlocked(item.character);
      const button = node("button");
      button.type = "button";
      button.disabled = buying || owned || !roomUnlocked || LG.traits.points() < item.price;
      button.textContent = owned ? "已拥有"
        : !roomUnlocked ? "先解锁角色房间"
          : LG.traits.points() < item.price ? `需要 ${item.price} 点` : `${item.price}点购买`;
      button.addEventListener("click", () => buy(item));
      card.append(button);
    }
    return card;
  }

  function fillCharacterSelect() {
    const current = selectedCharacter;
    el.character.replaceChildren(...LG.collectibles.shopCharacters().map((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = `${character.name}${LG.achievements.isUnlocked(character.id) ? "" : "（房间未解锁）"}`;
      return option;
    }));
    el.character.value = current;
  }

  function renderStore() {
    const unlocked = LG.collectibles.shopUnlocked();
    el.points.textContent = String(LG.traits.points());
    el.lock.hidden = unlocked;
    el.content.hidden = !unlocked;
    if (!unlocked) {
      el.status.textContent = "解锁需求：丧志属性达到100点。";
      return;
    }
    fillCharacterSelect();
    const progress = LG.collectibles.progress(selectedCharacter);
    el.status.textContent = `${LG.COLLECTIBLE_CHARACTERS[selectedCharacter].name}道具 ${progress.count}/${progress.total}`;
    el.items.replaceChildren(...LG.collectibles.items(selectedCharacter).map((item) => itemCard(item)));
  }

  async function buy(item) {
    if (buying) return;
    buying = true;
    try {
      const result = await LG.authority.mutate("buyCollectible", {
        character: item.character,
        itemId: item.id,
      });
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.equipmentUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("道具购买保存失败:", err.code, err.message, err.stack);
      el.status.textContent = "保存失败，请稍后重试。";
    } finally {
      buying = false;
      renderStore();
    }
  }

  function renderCollection(character) {
    const meta = LG.COLLECTIBLE_CHARACTERS[character];
    const progress = LG.collectibles.progress(character);
    el.collectionTitle.textContent = `${meta.name} · 专属道具图鉴`;
    el.collectionStatus.textContent = LG.collectibles.collectionStatus(character);
    el.collectionItems.replaceChildren(...LG.collectibles.items(character)
      .map((item) => itemCard(item, true)));
  }

  LG.collectiblesUI = {
    init() {
      el.button = document.getElementById("shopButton");
      el.dialog = document.getElementById("shopDialog");
      el.points = document.getElementById("shopPoints");
      el.lock = document.getElementById("shopLock");
      el.content = document.getElementById("shopContent");
      el.character = document.getElementById("shopCharacterSelect");
      el.status = document.getElementById("shopStatus");
      el.items = document.getElementById("shopItems");
      el.collectionDialog = document.getElementById("collectionDialog");
      el.collectionTitle = document.getElementById("collectionTitle");
      el.collectionStatus = document.getElementById("collectionStatus");
      el.collectionItems = document.getElementById("collectionItems");
      el.button.addEventListener("click", () => this.openStore());
      el.character.addEventListener("change", () => {
        selectedCharacter = el.character.value;
        renderStore();
      });
      document.getElementById("closeShopButton").addEventListener("click", () => el.dialog.close());
      document.getElementById("closeCollectionButton")
        .addEventListener("click", () => el.collectionDialog.close());
      this.refresh();
    },
    openStore() {
      renderStore();
      el.dialog.showModal();
    },
    openCollection(character) {
      if (!LG.achievements.isUnlocked(character)) return;
      renderCollection(character);
      el.collectionDialog.showModal();
    },
    refresh() {
      if (!el.button) return;
      el.button.textContent = LG.collectibles.shopUnlocked() ? "商城" : "商城·锁";
      if (el.dialog?.open) renderStore();
    },
  };
})(window.LifeGame);
