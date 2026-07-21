(function (LG) {
  function economy() {
    return LG.authority?.snapshot?.()?.economy || {};
  }
  function realm() {
    return economy().infernalRealm || {};
  }
  function club() {
    return realm().club || {
      spent: 0, spentByQueen: {}, owned: [], consumables: {}, used: {},
      specialUsesByQueen: {}, buttImpactUsesByQueen: {},
      stompConquests: 0, equippedSet: null,
    };
  }
  LG.infernalClub = {
    access() {
      const testing = LG.TEST_MODE?.unlockAllRooms === true;
      const access = realm().display?.clubAccess || {};
      return {
        allowed: testing || access.allowed === true,
        defeat: Math.max(0, Number(access.defeat) || 0),
        text: testing ? "测试模式已开放" : access.text || "开放条件同步中",
      };
    },
    personality() {
      return Math.max(0, Number(economy().penitentiary?.personality) || 0);
    },
    spent(sin) {
      return sin
        ? Math.max(0, Number(club().spentByQueen?.[sin]) || 0)
        : Math.max(0, Number(club().spent) || 0);
    },
    owns(id) {
      return Array.isArray(club().owned) && club().owned.includes(id);
    },
    quantity(id) {
      return Math.max(0, Number(club().consumables?.[id]) || 0);
    },
    used(id) {
      return Math.max(0, Number(club().used?.[id]) || 0);
    },
    specialUses(sin) {
      return Math.max(0, Number(club().specialUsesByQueen?.[sin]) || 0);
    },
    buttImpactUses(sin) {
      return Math.max(0, Number(club().buttImpactUsesByQueen?.[sin]) || 0);
    },
    fullSet(sin) {
      const queen = LG.INFERNAL_CLUB_DATA.byId[sin];
      return Boolean(queen && queen.equipment.every((item) => this.owns(item.id)));
    },
    equippedSet() {
      const id = club().equippedSet;
      return LG.INFERNAL_CLUB_DATA.byId[id] ? id : null;
    },
    price(item) {
      return Math.max(0,
        Number(realm().display?.clubPrices?.[item?.id]) || 0);
    },
    isCharacter(id) {
      return Boolean(LG.INFERNAL_CLUB_DATA.byCharacter[id]);
    },
    queenByCharacter(id) {
      return LG.INFERNAL_CLUB_DATA.byCharacter[id] || null;
    },
    equipmentItems() {
      return LG.INFERNAL_CLUB_DATA.queens.flatMap((queen) =>
        queen.equipment.filter((item) => this.owns(item.id)).map((item) => ({
          ...item,
          source: "infernalClub",
          setId: `club-${queen.id}`,
          prefix: `${queen.name}地狱魔王`,
          shame: 20,
          adult: true,
        })));
    },
    chatPass(character) {
      return LG.dialogueAI.roomPass(character);
    },
    canChat(character) {
      const chat = realm().display?.clubChat || {};
      return this.access().allowed
        && (this.chatPass(character) > 0
          || this.personality() >= Math.max(0, Number(chat.cost) || 0));
    },
    chatStatus(character) {
      const pass = this.chatPass(character);
      const chat = realm().display?.clubChat || {};
      const turns = Math.max(1, Number(chat.turns) || 1);
      if (pass) return `本周期剩余${pass}/${turns}轮。`;
      return `消耗${Math.max(0, Number(chat.cost) || 0)}人格开启${
        turns}轮对话；当前${this.personality()}人格。`;
    },
  };
})(window.LifeGame);
