(function (LG) {
  const el = {};
  let selected = null;
  let buying = false, saveBlocked = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function characterCard(character) {
    const card = node("article", `casino-character${character.unlocked ? " unlocked" : ""}`);
    const image = node("img");
    image.src = character.portrait;
    image.alt = character.role;
    image.loading = "lazy";
    image.decoding = "async";
    const body = node("div", "casino-character-body");
    body.append(
      node("span", "event-type", character.unlocked ? "角色已解锁" : "角色未解锁"),
      node("strong", "", character.name),
      node("p", "", character.role),
    );
    const track = node("div", "casino-progress");
    const fill = node("span");
    fill.style.width = `${character.progress * 100}%`;
    track.append(fill);
    const button = node("button");
    button.type = "button";
    button.disabled = !character.unlocked;
    button.textContent = character.unlocked
      ? `进入个人商店 · ${character.price}点/件`
      : LG.casino.unlockText(character.id);
    button.addEventListener("click", () => openDetail(character.id));
    body.append(track, node("small", "", LG.casino.unlockText(character.id)), button);
    card.append(image, body);
    return card;
  }

  function itemCard(item) {
    const owned = LG.casino.owns(item.id);
    const card = node("article", `casino-item${owned ? " owned" : ""}`);
    card.append(
      node("span", "casino-item-state", owned ? "已拥有" : `${item.price}属性点`),
      node("strong", "", item.name),
      node("p", "", item.description),
    );
    const button = node("button");
    button.type = "button";
    button.disabled = buying || saveBlocked || owned || LG.traits.points() < item.price;
    button.textContent = owned ? "已购买"
      : LG.traits.points() < item.price ? `需要${item.price}点` : "购买";
    button.addEventListener("click", () => buy(item));
    card.append(button);
    if (owned) {
      card.append(LG.collectionUseUI.button({
        owned,
        source: "casino",
        roomId: item.character,
        itemId: item.id,
        tone: item.insider ? "private" : "normal",
        onStatus: (text) => { el.status.textContent = text; },
        onRefresh: () => openDetail(item.character),
      }));
    }
    return card;
  }

  function renderList() {
    selected = null;
    el.detail.hidden = true;
    el.list.hidden = false;
    el.list.replaceChildren(...LG.casino.characters().map(characterCard));
  }

  function openDetail(characterId) {
    if (!LG.casino.unlocked(characterId)) return;
    selected = characterId;
    const character = LG.CASINO_DATA.byId[characterId];
    const progress = LG.casino.progress(characterId);
    const regular = LG.casino.regularProgress(characterId);
    const insider = character.items.find((item) => item.insider);
    el.list.hidden = true;
    el.detail.hidden = false;
    el.portrait.src = character.portrait;
    el.portrait.alt = character.role;
    el.role.textContent = character.role;
    el.name.textContent = character.name;
    el.points.textContent = String(LG.traits.points());
    el.progress.textContent = `基础商品 ${regular.count}/${regular.total} · 内幕商品 ${
      LG.casino.owns(insider.id) ? "已购买" : LG.casino.insiderAvailable(characterId)
        ? "已解锁" : "未解锁"}`;
    el.items.replaceChildren(...LG.casino.visibleItems(characterId).map(itemCard));
    el.chat.disabled = !progress.complete;
    el.gallery.disabled = !progress.complete;
    el.chat.textContent = progress.complete ? "AI对话 · 服侍" : "买光后解锁AI对话";
    el.gallery.textContent = progress.complete ? "角色画廊" : "买光后解锁画廊";
    el.status.textContent = progress.complete
      ? "商店已集齐；AI对话消耗50点属性点，可解锁20轮。"
      : !LG.casino.insiderAvailable(characterId)
        ? `先购买四件基础商品，之后才会显示并解锁内幕商品。还差${regular.total - regular.count}件。`
        : "内幕商品购买资格已解锁；购买后开放AI对话与画廊。";
  }

  async function buy(item) {
    if (buying || !selected) return;
    buying = true;
    let feedback = "正在提交购买…";
    try {
      const result = await LG.authority.mutate("buyCasinoItem", {
        character: selected,
        itemId: item.id,
      });
      feedback = result.message;
      LG.traitsUI.refresh();
      LG.casinoUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("赌场商店保存失败:", err.code, err.message, err.stack);
      saveBlocked = true;
      feedback = "购买保存失败，已停止后续交易；请刷新游戏恢复最近存档。";
    } finally {
      buying = false;
      openDetail(selected);
      el.status.textContent = feedback;
    }
  }

  LG.casinoShopUI = {
    init() {
      el.list = document.getElementById("casinoCharacterList");
      el.detail = document.getElementById("casinoShopDetail");
      el.portrait = document.getElementById("casinoShopPortrait");
      el.role = document.getElementById("casinoShopRole");
      el.name = document.getElementById("casinoShopName");
      el.points = document.getElementById("casinoShopPoints");
      el.progress = document.getElementById("casinoShopProgress");
      el.status = document.getElementById("casinoShopStatus");
      el.items = document.getElementById("casinoShopItems");
      el.chat = document.getElementById("casinoChatButton");
      el.gallery = document.getElementById("casinoGalleryButton");
      document.getElementById("casinoShopBack").addEventListener("click", renderList);
      el.chat.addEventListener("click", () => LG.casinoChatUI.open(selected));
      el.gallery.addEventListener("click", () => {
        if (!LG.galleryUI.open(selected)) {
          el.status.textContent = "需要先买光该角色的个人商店。";
        }
      });
    },
    open() {
      renderList();
    },
    refresh() {
      if (selected) openDetail(selected);
      else renderList();
    },
  };
})(window.LifeGame);
