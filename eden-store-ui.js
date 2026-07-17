(function (LG) {
  const stores = {
    dining: {
      asset: "edenChefClerk",
      character: "edenChef",
      role: "神明餐饮店 · 女厨师店员",
      title: "神明餐饮店",
      location: "伊甸园餐饮大厅",
    },
    clothing: {
      asset: "edenFashionClerk",
      character: "edenFashion",
      role: "神明服装店 · 女店员",
      title: "神明服装店",
      location: "伊甸园高定陈列室",
    },
  };
  const el = {};
  let onView = () => {};
  let currentView = "dining";

  function showRoom(view) {
    const store = stores[view] || stores.dining;
    currentView = stores[view] ? view : "dining";
    LG.audio.scene(`eden-${currentView}`);
    el.lobby.hidden = true;
    el.room.hidden = false;
    el.portrait.src = LG.CONFIG.assets[store.asset];
    el.portrait.alt = store.role;
    el.role.textContent = store.role;
    el.title.textContent = store.title;
    el.location.textContent = store.location;
    onView(currentView);
    LG.edenCharacterUI.open(store.character, currentView);
    LG.blackPrisonUI?.refresh?.();
  }

  LG.edenStoreUI = {
    init(nextOnView) {
      onView = nextOnView;
      el.lobby = document.getElementById("blackPrisonStoreLobby");
      el.room = document.getElementById("blackPrisonStoreRoom");
      el.portrait = document.getElementById("blackPrisonStorePortrait");
      el.role = document.getElementById("blackPrisonStoreRole");
      el.title = document.getElementById("blackPrisonStoreTitle");
      el.location = document.getElementById("blackPrisonStoreLocation");
      document.getElementById("edenDiningCardPortrait").src =
        LG.CONFIG.assets.edenRestaurantDistantEntry;
      document.getElementById("edenClothingCardPortrait").src =
        LG.CONFIG.assets.edenFashionDistantEntry;
      el.lobby.querySelectorAll("[data-black-prison-view]")
        .forEach((button) => button.addEventListener("click", () =>
          showRoom(button.dataset.blackPrisonView)));
      document.getElementById("blackPrisonStoreBack")
        .addEventListener("click", () => this.openLobby());
    },
    openLobby() {
      LG.edenCharacterChatUI?.leave?.();
      el.lobby.hidden = false;
      el.room.hidden = true;
      LG.audio.scene("eden");
      document.getElementById("blackPrisonScroll").scrollTop = 0;
      LG.blackPrisonUI?.refresh?.();
    },
    restoreView() {
      onView(currentView);
    },
    summaryMode() {
      return el.room && !el.room.hidden ? currentView : "lobby";
    },
  };
})(window.LifeGame);
