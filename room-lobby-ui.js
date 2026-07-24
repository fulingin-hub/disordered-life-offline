(function (LG) {
  let el;
  let callbacks;
  let currentArea = null;
  let currentSection = null;
  const paradiseId = "paradise";

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
    back.textContent = "返回世界地图";
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
        button.addEventListener("click", () => openArea(area.id, item.id));
        tabs.append(button);
      });
      bar.append(tabs);
    }
    return bar;
  }

  function renderWorld() {
    LG.audio.scene("world");
    el.dialog.classList.add("world-map-mode");
    currentArea = null;
    currentSection = null;
    LG.worldMapUI.resetSelection();
    LG.worldMapUI.render({
      elements: el,
      extras: LG.contentMode?.strictTeen?.() ? [] : [
        LG.roomCards.player(callbacks.onEnterPlayer),
        LG.vehicleUI.roomCard(callbacks.onEnterVehicle),
      ],
    });
  }

  function renderParadise(sectionId = "eden") {
    if (!LG.blackPrison.access().allowed) return renderWorld();
    const paradiseArea = LG.worldAreas.get(paradiseId);
    el.dialog.classList.remove("world-map-mode");
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
    if (LG.contentMode?.strictTeen?.()
      && !LG.worldMapData.safeArea(areaId)) return renderWorld();
    const area = LG.worldAreas.get(areaId);
    if (!area) return renderWorld();
    el.dialog.classList.remove("world-map-mode");
    const section = area.sections.find((item) => item.id === sectionId)
      || area.sections[0];
    LG.audio.scene(`area:${area.id}:${section.id}`);
    currentArea = area.id;
    currentSection = section.id;
    el.title.textContent = `${area.name} · ${section.label}`;
    el.intro.textContent = area.description;
    const safeNotice = document.createElement("p");
    safeNotice.className = "system-status";
    safeNotice.textContent =
      "15+安全模式仅展示公共地区场景，不开放角色房间和高风险设施。";
    el.cards.replaceChildren(
      toolbar(area, section),
      LG.roomCards.scene(area, section),
      ...(LG.contentMode?.strictTeen?.() ? [safeNotice] : [
      ...(section.guild ? [LG.adventureGuildUI.roomCard()] : []),
      ...(section.faction
        ? LG.factionRooms.cards(section.faction, section.branch)
        : section.facility ? LG.worldFacilityUI.cards(section, callbacks)
          : section.church ? [LG.infernalChurchUI.roomCard()]
          : section.holyLight ? [
            LG.holyLightUI.roomCard(area.id),
            ...(LG.contentMode?.adultSimulation?.()
              ? [LG.fallenSaintRoom.roomCard()] : []),
          ]
          : characterCards(section.characters)),
      ]),
    );
  }

  function openArea(areaId, sectionId) {
    if (areaId === paradiseId) return renderParadise(sectionId);
    return renderArea(areaId, sectionId);
  }

  LG.roomLobbyUI = {
    init(elements, nextCallbacks) {
      el = elements;
      callbacks = nextCallbacks;
    },
    renderWorld,
    renderArea,
    renderParadise,
    openArea,
    restore() {
      if (currentArea === paradiseId) renderParadise(currentSection);
      else if (currentArea) renderArea(currentArea, currentSection);
      else renderWorld();
    },
  };
})(window.LifeGame);
