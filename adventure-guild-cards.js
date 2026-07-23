(function (LG) {
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function characterCard(character) {
    const card = node("article", "adventure-guild-character");
    const image = node("img");
    image.src = character.portrait;
    image.alt = character.name;
    image.loading = "lazy";
    image.decoding = "async";
    const copy = node("div");
    copy.append(node("span", "event-type",
      `${character.role} · ${character.age}岁`),
      node("strong", "", character.name), node("p", "", character.copy));
    card.append(image, copy);
    return card;
  }
  function offerCard(offer, onBuy, busy) {
    const card = node("article", `adventure-guild-item ${offer.kind}`);
    const heading = node("div", "adventure-guild-item-heading");
    heading.append(node("strong", "", offer.name),
      node("span", "", `剩余 ${offer.remaining}`));
    card.append(heading, node("p", "", offer.description));
    if (offer.affixLabel) {
      card.append(node("small", "adventure-guild-affix",
        `${offer.affixLabel}收益 +${offer.affixPercent}%`));
    }
    const button = node("button", "", offer.remaining > 0
      ? `${offer.price}属性点购买` : "今日售罄");
    button.type = "button";
    button.disabled = busy || offer.remaining < 1;
    button.addEventListener("click", () => onBuy(offer));
    card.append(button);
    return card;
  }
  function supplyCard(item, onUse, busy) {
    const meta = LG.ADVENTURE_GUILD_DATA.supplies[item.id] || {
      name: item.id, type: "food",
    };
    const card = node("article", "adventure-guild-item inventory");
    card.append(node("strong", "", meta.name),
      node("p", "", `库存 ${item.quantity} · 可推进${
        meta.type === "food" ? "食物" : "药剂"}类职业任务。`));
    const button = node("button", "", "用于职业任务");
    button.type = "button";
    button.disabled = busy;
    button.addEventListener("click", () => onUse(item.id));
    card.append(button);
    return card;
  }
  function equipmentCard(item) {
    const parts = item.id.replace("guild-equip-", "").split("-");
    const slot = parts.pop();
    const professionId = parts.join("-");
    const offer = LG.adventureGuild.data().stock.find((entry) =>
      entry.itemId === item.id);
    const name = offer?.name || `${professionId}·${slot}`;
    const card = node("article", "adventure-guild-item inventory");
    card.append(node("strong", "", name),
      node("p", "", `库存 ${item.quantity} · 同职业五件集齐后完成一阶装备认证。`));
    return card;
  }
  function corruptedCard(item, onSell, busy) {
    const card = node("article", "adventure-guild-item corrupted owned");
    const heading = node("div", "adventure-guild-item-heading");
    heading.append(node("strong", "", item.name),
      node("span", "", `库存 ${item.quantity}`));
    card.append(heading, node("p", "", item.description),
      node("small", "adventure-guild-affix",
        `${item.affixLabel}收益 +${item.affixPercent}% · 售价 ${item.price}`));
    const button = node("button", "quiet-button",
      `按40%回收 · ${Math.max(1, Math.floor(item.price * 0.4))}点`);
    button.type = "button";
    button.disabled = busy;
    button.addEventListener("click", () => onSell(item));
    card.append(button);
    return card;
  }
  LG.adventureGuildCards = {
    node, characterCard, offerCard, supplyCard, equipmentCard, corruptedCard,
  };
})(window.LifeGame);
