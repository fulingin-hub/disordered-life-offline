(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function roomCard(character, privacy) {
    const data = LG.career.data();
    const faction = LG.CAREER_DATA.factions[character.faction];
    const joined = data.memberships?.includes(character.faction);
    const items = LG.CAREER_DATA.items(character, privacy);
    const owned = new Set(data.characterItems || []);
    const count = items.filter((item) => owned.has(item.id)).length;
    const leader = character.rankIndex === 2;
    const card = node("article", `room-card faction-room-card${joined ? " unlocked" : ""}`);
    const image = node("img");
    image.src = LG.CONFIG.assets[character.asset];
    image.alt = `${character.name}的${privacy === "normal" ? "正常" : "丧志"}房间`;
    image.loading = "lazy";
    image.decoding = "async";
    const body = node("div", "room-card-body");
    const label = privacy === "normal" ? "正常个人房间" : "丧志个人房间";
    body.append(
      node("span", "event-type", `${label}${leader ? " · 势力首领" : ""}`),
      node("h3", "", `${character.name}的个人房间`),
      node("p", "", joined
        ? `${privacy === "normal" ? "普通" : "私密"}图鉴 ${count}/5${
          leader ? " · 可购买势力职业" : ""}`
        : `需要先加入${faction.name}`),
    );
    const track = node("div", "room-progress");
    const fill = node("span");
    fill.style.width = `${count * 20}%`;
    track.append(fill);
    const button = node("button", "", joined ? `进入${label}` : "势力成员方可进入");
    button.type = "button";
    button.disabled = !joined;
    button.addEventListener("click", () =>
      LG.factionStoreUI.open(character.id, privacy));
    body.append(track, button);
    card.append(image, body);
    return card;
  }

  function cards(factionId) {
    return LG.CAREER_DATA.roster
      .filter((character) => character.faction === factionId)
      .flatMap((character) => [
        roomCard(character, "normal"),
        roomCard(character, "private"),
      ]);
  }

  function render(container, factionId) {
    const faction = LG.CAREER_DATA.factions[factionId];
    if (!container || !faction) return;
    container.replaceChildren(
      node("p", "faction-room-intro",
        `${faction.name}独立区域 · 六名角色各设正常与丧志房间，共十二间。`),
      ...cards(factionId),
    );
  }

  LG.factionRooms = { cards, render };
})(window.LifeGame);
