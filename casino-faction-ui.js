(function (LG) {
  const el = {};

  function setActive(active) {
    el.view.hidden = !active;
    el.tab.classList.toggle("active", active);
    if (!active) return;
    el.game.hidden = true;
    el.shop.hidden = true;
    el.chat.hidden = true;
    el.gameTab.classList.remove("active");
    el.shopTab.classList.remove("active");
    LG.casinoChatUI.leave();
    LG.factionRooms.render(el.rooms, "domain");
  }

  LG.casinoFactionUI = {
    init() {
      el.tab = document.getElementById("casinoFactionTab");
      el.view = document.getElementById("casinoFactionView");
      el.rooms = document.getElementById("casinoFactionRooms");
      el.game = document.getElementById("casinoGameView");
      el.shop = document.getElementById("casinoShopView");
      el.chat = document.getElementById("casinoChat");
      el.gameTab = document.getElementById("casinoGameTab");
      el.shopTab = document.getElementById("casinoShopTab");
      el.tab.addEventListener("click", () => setActive(true));
      [el.gameTab, el.shopTab].forEach((button) =>
        button.addEventListener("click", () => setActive(false)));
    },
    refresh() {
      if (!el.view?.hidden) LG.factionRooms.render(el.rooms, "domain");
    },
  };
})(window.LifeGame);
