(function (LG) {
  let el;
  let callbacks;
  let currentArea = null;
  let currentSection = null;

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
        button.addEventListener("click", () => renderArea(area.id, item.id));
        tabs.append(button);
      });
      bar.append(tabs);
    }
    return bar;
  }

  function renderWorld() {
    currentArea = null;
    currentSection = null;
    el.title.textContent = "世界区域";
    el.intro.textContent = "选择场景区域后，再进入校园、社会或特殊园区中的角色房间。异域赌场累计完成50次人生解锁。";
    const areaCards = LG.worldAreas.all()
      .map((area) => LG.roomCards.area(area, renderArea));
    el.cards.replaceChildren(
      LG.roomCards.player(callbacks.onEnterPlayer),
      LG.casinoUI.roomCard(callbacks.onEnterCasino),
      ...areaCards,
    );
  }

  function renderArea(areaId, sectionId) {
    const area = LG.worldAreas.get(areaId);
    if (!area) return renderWorld();
    const section = area.sections.find((item) => item.id === sectionId)
      || area.sections[0];
    currentArea = area.id;
    currentSection = section.id;
    el.title.textContent = `${area.name} · ${section.label}`;
    el.intro.textContent = area.description;
    el.cards.replaceChildren(
      toolbar(area, section),
      ...characterCards(section.characters),
    );
  }

  LG.roomLobbyUI = {
    init(elements, nextCallbacks) {
      el = elements;
      callbacks = nextCallbacks;
    },
    renderWorld,
    restore() {
      if (currentArea) renderArea(currentArea, currentSection);
      else renderWorld();
    },
  };
})(window.LifeGame);
