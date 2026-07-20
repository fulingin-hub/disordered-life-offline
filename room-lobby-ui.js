(function (LG) {
  let el;
  let callbacks;
  let currentArea = null;
  let currentSection = null;
  const paradiseId = "paradise";
  const paradiseArea = {
    id: paradiseId,
    name: "终产者的乐园",
    sections: [
      {
        id: "eden",
        label: "伊甸园",
        image: "edenGoldenDistrict",
        description: "黄金餐厅与高定服装店分列大道两侧，属性点在这里决定服务与身份。",
      },
      {
        id: "shadow",
        label: "影狱",
        image: "shadowPrisonComplex",
        description: "封闭任务区以赎罪卷记录服从、消费与角色认可，五级权限依次开放。",
      },
      {
        id: "paradise",
        label: "乐园",
        image: "edenGoldenDistrict",
        description: "乐园职业角色的独立办公区，设有十二间正常与丧志个人房间。",
        faction: "paradise",
      },
    ],
  };

  function standardMap() {
    return Object.fromEntries(LG.achievements.all().map((item) => [item.id, item]));
  }

  function marketMap() {
    const characters = LG.blackMarket.characters();
    const cards = LG.blackMarketUI.roomCards(callbacks.onEnter);
    return Object.fromEntries(characters.map((item, index) => [item.id, cards[index]]));
  }

  function characterCards(ids) {
    const progress = standardMap();
    const markets = marketMap();
    return ids.map((id) => markets[id]
      || LG.roomCards.standard(progress[id], callbacks.onEnter));
  }

  function toolbar(area, section) {
    const bar = document.createElement("nav");
    bar.className = "room-area-toolbar";
    bar.setAttribute("aria-label", `${area.name}区域导航`);
    const back = document.createElement("button");
    back.type = "button";
    back.className = "quiet-button room-area-back";
    back.textContent = "返回世界区域";
    back.addEventListener("click", () => renderWorld());
    bar.append(back);
    if (area.sections.length > 1) {
      const tabs = document.createElement("div");
      tabs.className = "room-area-tabs";
      area.sections.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = item.id === section.id ? "active" : "";
        button.textContent = item.label;
        button.setAttribute("aria-pressed", String(item.id === section.id));
        button.addEventListener("click", () => area.id === paradiseId
          ? renderParadise(item.id) : renderArea(area.id, item.id));
        tabs.append(button);
      });
      bar.append(tabs);
    }
    return bar;
  }

  function paradiseCard() {
    const access = LG.blackPrison.access();
    const prison = LG.penitentiary.access();
    const card = document.createElement("article");
    card.className = `room-card area-room-card paradise-area-card${
      access.allowed ? " unlocked" : ""}`;
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets.paradiseDistantView;
    image.alt = "终产者的乐园";
    image.loading = "lazy";
    image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = !access.allowed;
    button.textContent = access.allowed ? "进入终产者的乐园" : "尚未获得终产者资格";
    button.addEventListener("click", () => renderParadise("eden"));
    body.append(
      Object.assign(document.createElement("span"), {
        className: "event-type",
        textContent: access.allowed ? "终产者专属 · 已开放" : "终产者专属 · 未达门槛",
      }),
      Object.assign(document.createElement("h3"), { textContent: paradiseArea.name }),
      Object.assign(document.createElement("p"), {
        textContent: access.allowed
          ? `已开放场景 ${2 + Number(prison.allowed)}/3`
          : `人生 ${access.lives}/100 · 累计属性点 ${access.points}/2000`,
      }),
      LG.roomEntryCopy.node("area-paradise"),
      button,
    );
    card.append(image, body);
    return card;
  }

  function renderWorld() {
    LG.audio.scene("world");
    currentArea = null;
    currentSection = null;
    el.title.textContent = "世界区域";
    el.intro.textContent = "选择场景区域或特殊功能场所。万界载具博览会馆在任一长期资源超过1000点后永久开放。";
    const areaCards = LG.worldAreas.all()
      .map((area) => LG.roomCards.area(area, renderArea));
    el.cards.replaceChildren(
      LG.roomCards.player(callbacks.onEnterPlayer),
      LG.casinoUI.roomCard(callbacks.onEnterCasino),
      paradiseCard(),
      LG.vehicleUI.roomCard(callbacks.onEnterVehicle),
      LG.infernalUI.roomCard(),
      LG.infernalClubUI.roomCard(),
      ...areaCards,
    );
  }

  function renderParadise(sectionId = "eden") {
    if (!LG.blackPrison.access().allowed) return renderWorld();
    const section = paradiseArea.sections.find((item) => item.id === sectionId)
      || paradiseArea.sections[0];
    LG.audio.scene(section.id);
    currentArea = paradiseId;
    currentSection = section.id;
    el.title.textContent = `${paradiseArea.name} · ${section.label}`;
    el.intro.textContent = "伊甸园负责消费，影狱负责赎罪，乐园区域负责势力角色与职业商城。";
    el.cards.replaceChildren(
      toolbar(paradiseArea, section),
      LG.roomCards.scene(paradiseArea, section),
      ...(section.faction
        ? LG.factionRooms.cards(section.faction)
        : [section.id === "eden"
          ? LG.blackPrisonUI.roomCard(callbacks.onEnterBlackPrison)
          : LG.penitentiaryUI.roomCard(callbacks.onEnterPenitentiary)]),
    );
  }

  function renderArea(areaId, sectionId) {
    const area = LG.worldAreas.get(areaId);
    if (!area) return renderWorld();
    const section = area.sections.find((item) => item.id === sectionId)
      || area.sections[0];
    LG.audio.scene(`area:${area.id}:${section.id}`);
    currentArea = area.id;
    currentSection = section.id;
    el.title.textContent = `${area.name} · ${section.label}`;
    el.intro.textContent = area.description;
    el.cards.replaceChildren(
      toolbar(area, section),
      LG.roomCards.scene(area, section),
      ...(section.faction
        ? LG.factionRooms.cards(section.faction)
        : characterCards(section.characters)),
    );
  }

  LG.roomLobbyUI = {
    init(elements, nextCallbacks) {
      el = elements;
      callbacks = nextCallbacks;
    },
    renderWorld,
    renderParadise,
    restore() {
      if (currentArea === paradiseId) renderParadise(currentSection);
      else if (currentArea) renderArea(currentArea, currentSection);
      else renderWorld();
    },
  };
})(window.LifeGame);
