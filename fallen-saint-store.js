(function (LG) {
  LG.fallenSaintStore = {
    open() {
      LG.factionStoreUI.open("holy-light-saint", "private", {
        forcePrivate: true,
        name: "堕落圣徒",
        location: "地狱教会 · 七大欲化身的隐藏房间",
        chatId: "fallenSaint",
        galleryId: "fallenSaint",
      });
    },
  };
})(window.LifeGame);
