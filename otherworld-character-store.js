(function (LG) {
  function data() {
    return LG.authority?.snapshot?.()?.economy?.otherworldCharacters
      || { version: 1, owned: [] };
  }
  function meta(id) {
    return LG.OTHERWORLD_CHARACTER_DATA.byId[id] || null;
  }
  function testing() {
    return LG.TEST_MODE?.unlockAllRooms === true;
  }
  LG.otherworldCharacters = {
    data,
    isCharacter(id) { return Boolean(meta(id)); },
    characters(host) {
      return LG.OTHERWORLD_CHARACTER_DATA.characters
        .filter((item) => !host || item.host === host);
    },
    access(id) {
      const character = meta(id);
      if (!character) return false;
      if (testing()) return true;
      return character.host === "expo"
        ? LG.vehicleStore.access().allowed : LG.infernalRealm.access().allowed;
    },
    items(id) { return meta(id)?.items || []; },
    owns(itemId) { return testing() || data().owned.includes(itemId); },
    regularItems(id) { return this.items(id).filter((item) => !item.special); },
    regularProgress(id) {
      const items = this.regularItems(id);
      const count = items.filter((item) => this.owns(item.id)).length;
      return { count, total: items.length, complete: items.length > 0 && count === items.length };
    },
    visibleItems(id) {
      const regularReady = this.regularProgress(id).complete;
      return this.items(id).filter((item) => !item.special || regularReady);
    },
    progress(id) {
      const items = this.items(id);
      const count = items.filter((item) => this.owns(item.id)).length;
      return { count, total: items.length, complete: items.length > 0 && count === items.length };
    },
    canChat(id) { return this.access(id) && this.progress(id).complete; },
    galleryUnlocked(id) { return this.canChat(id); },
    vehicleMarkup() {
      return data().owned.includes("expoSaleswoman-private-room-card") ? 1.1 : 1;
    },
    infernalTarget() {
      return data().owned.includes("guildReceptionist-reception-basement-key") ? 15 : 10;
    },
    abyssTarget() {
      return data().owned.includes("guildManager-manager-basement-key") ? 15 : 10;
    },
    aiState(id) {
      const state = LG.authority.state() || {};
      return {
        runId: state.runId, stats: state.stats,
        conversations: { [id]: [] }, chatUsage: {},
      };
    },
  };
})(window.LifeGame);
