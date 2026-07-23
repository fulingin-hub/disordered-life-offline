(function (LG) {
  const el = {};
  let selected = null, buying = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function entryCard(character) {
    const card = node("article", "otherworld-entry");
    const image = node("img");
    image.src = character.portrait;
    image.alt = character.role;
    image.loading = "lazy";
    const body = node("div");
    body.append(
      node("span", "event-type", LG.characterDemographics.label(
        character.id, "", character.role)),
      node("strong", "", character.name),
      node("p", "", `个人图鉴 ${LG.otherworldCharacters.progress(character.id).count}/5`),
    );
    const button = node("button", "", "进入角色房间");
    button.type = "button";
    button.addEventListener("click", () => LG.otherworldCharacterUI.open(character.id));
    body.append(button);
    card.append(image, body);
    return card;
  }
  function itemCard(item) {
    const owned = LG.otherworldCharacters.owns(item.id);
    const price = LG.infernalChurch.price(item.price);
    const card = node("article", `casino-item${owned ? " owned" : ""}`);
    card.append(
      node("span", "casino-item-state", owned ? "已拥有" : `${price.toLocaleString("zh-CN")}属性点`),
      node("strong", "", item.name),
      node("p", "", item.description),
    );
    const buy = node("button", "", owned ? "已购买" : "购买");
    buy.type = "button";
    buy.disabled = buying || owned || LG.traits.points() < price;
    buy.addEventListener("click", () => purchase(item));
    card.append(buy);
    if (owned) {
      card.append(LG.collectionUseUI.button({
        owned, source: "otherworld", roomId: item.character, itemId: item.id,
        tone: item.special ? "private" : "normal",
        onStatus: (text) => { el.status.textContent = text; },
        onRefresh: () => renderDetail(),
      }));
    }
    return card;
  }
  function renderHosts() {
    [["expo", "otherworldExpoCharacter"], ["infernal", "otherworldGuildCharacters"]]
      .forEach(([host, id]) => {
        const target = document.getElementById(id);
        if (target) target.replaceChildren(
          ...LG.otherworldCharacters.characters(host).map(entryCard));
      });
  }
  function renderDetail(message) {
    if (!selected) return;
    const character = LG.OTHERWORLD_CHARACTER_DATA.byId[selected];
    const regular = LG.otherworldCharacters.regularProgress(selected);
    const progress = LG.otherworldCharacters.progress(selected);
    el.portrait.src = character.portrait;
    el.portrait.alt = character.role;
    el.role.textContent = `${character.location} · ${
      LG.characterDemographics.label(character.id, "", character.role)}`;
    el.name.textContent = character.name;
    el.points.textContent = LG.traits.points().toLocaleString("zh-CN");
    el.progress.textContent = `基础收藏 ${regular.count}/4 · 特殊道具 ${
      progress.count === 5 ? "已获得" : regular.complete ? "已解锁" : "未解锁"}`;
    el.items.replaceChildren(...LG.otherworldCharacters.visibleItems(selected).map(itemCard),
      LG.roomRitualUI.panel({ id: character.id, name: character.name,
        src: character.portrait, gender: "female" }));
    el.chat.disabled = !progress.complete;
    el.gallery.disabled = !progress.complete;
    el.chat.textContent = progress.complete ? "AI对话" : "集齐五件后开放";
    el.gallery.textContent = progress.complete ? "角色画廊" : "集齐五件后开放";
    el.status.textContent = message || (progress.complete
      ? `账单明细：${character.fee}。图鉴使用：消耗10000属性点、增加100败北、降低100人格。`
      : regular.complete
        ? "特殊道具购买资格已解锁。"
        : `当前每件${LG.infernalChurch.price(10000)}属性点；还需${
          4 - regular.count}件基础收藏才能显示特殊道具。`);
  }
  async function purchase(item) {
    if (buying) return;
    buying = true;
    renderDetail("正在提交异界商行账单…");
    try {
      const result = await LG.authority.mutate("buyOtherworldItem", {
        character: selected, itemId: item.id,
      });
      window.dzmm?.toast?.success?.(result.message);
      LG.traitsUI.refresh();
      renderHosts();
      renderDetail(result.message);
      LG.vehicleUI.render();
    } catch (err) {
      console.error("异界角色商品购买失败:", err?.code, err?.message, err?.stack);
      renderDetail(err?.message || "购买失败，请稍后重试。");
    } finally {
      buying = false;
      renderDetail(el.status.textContent);
    }
  }
  LG.otherworldCharacterUI = {
    init() {
      ["dialog", "portrait", "role", "name", "points", "progress", "status",
        "items", "chat", "gallery"].forEach((key) => {
        const id = `otherworldCharacter${key[0].toUpperCase()}${key.slice(1)}`;
        el[key] = document.getElementById(id);
      });
      document.getElementById("closeOtherworldCharacterButton")
        .addEventListener("click", () => el.dialog.close());
      el.chat.addEventListener("click", () => LG.otherworldCharacterChatUI.open(selected));
      el.gallery.addEventListener("click", () => LG.galleryUI.open(selected));
      LG.otherworldCharacterChatUI.init();
      LG.authority.subscribe(renderHosts);
      renderHosts();
    },
    open(characterId) {
      if (!LG.otherworldCharacters.access(characterId)) return;
      selected = characterId;
      renderDetail();
      el.dialog.showModal();
    },
  };
})(window.LifeGame);
