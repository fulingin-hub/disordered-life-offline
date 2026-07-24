(function (LG) {
  function cards(section, callbacks) {
    switch (section.facility) {
      case "adventure-guild":
        return [LG.adventureGuildUI.roomCard()];
      case "infernal-realm":
        return [LG.infernalUI.roomCard()];
      case "infernal-club":
        return [LG.infernalClubUI.roomCard()];
      case "casino":
        return [LG.casinoUI.roomCard(callbacks.onEnterCasino)];
      case "golden-horizon":
        return [LG.goldenHorizonUI.roomCard()];
      default:
        return [];
    }
  }

  LG.worldFacilityUI = { cards };
})(window.LifeGame);
