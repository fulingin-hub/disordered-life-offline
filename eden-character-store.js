(function (LG) {
  function potion(character, itemId) {
    const key = `room-${character}-${itemId}`;
    return LG.blackMarket._data()?.potions?.find((item) => item.effectKey === key);
  }
  function usage(character, kind) {
    return Math.max(0, Math.floor(Number(
      LG.blackMarket._data()?.roomUsage?.[character]?.[kind],
    ) || 0));
  }
  LG.edenCharacters = {
    characters() {
      return LG.EDEN_CHARACTER_DATA.characters;
    },
    character(id) {
      return LG.EDEN_CHARACTER_DATA.byId[id] || null;
    },
    owns(id, itemId) {
      return LG.blackPrison.characterOwns(id, itemId);
    },
    unlocked(id) {
      return LG.blackPrison.characterComplete(id);
    },
    galleryUnlocked(id) {
      return Boolean(this.character(id) && this.unlocked(id));
    },
    canChat(id) {
      return this.galleryUnlocked(id);
    },
    storeUnlocked(id) {
      return id !== "edenChef"
        || (LG.blackPrison.progress("rare").complete
          && LG.blackPrison.progress("demon").complete);
    },
    itemState(id, itemId) {
      const item = this.character(id)?.items.find((entry) => entry.id === itemId);
      if (!item) return null;
      const owned = this.owns(id, itemId);
      const complete = this.unlocked(id);
      const discounted = item.group === "consumable"
        ? owned : complete && (item.group === "rare" || item.group === "demon");
      return {
        ...item,
        owned,
        unlocked: this.storeUnlocked(id),
        price: LG.infernalChurch.price(discounted ? 1 : item.price),
        quantity: item.group === "consumable"
          ? Math.max(0, Math.floor(Number(potion(id, itemId)?.quantity) || 0)) : null,
        used: item.group === "consumable" ? usage(id, itemId) : null,
      };
    },
    equipmentItems() {
      return LG.blackPrison.equipmentItems();
    },
    aiState(id, state) {
      return {
        ...state,
        edenStats: {
          character: id,
          owned: this.character(id).items.filter((item) =>
            this.owns(id, item.id)).map((item) => item.id),
        },
      };
    },
  };
})(window.LifeGame);
