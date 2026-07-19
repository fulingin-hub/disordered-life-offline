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
      equippedSet: null,
    };
  }
  LG.infernalClub = {
    access() {
      const defeat = Math.max(0, Number(realm().defeat) || 0);
      const testing = LG.TEST_MODE?.unlockAllRooms === true;
      return {
        allowed: testing || defeat >= LG.INFERNAL_CLUB_DATA.accessDefeat,
        defeat,
        required: LG.INFERNAL_CLUB_DATA.accessDefeat,
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
    fullSet(sin) {
      const queen = LG.INFERNAL_CLUB_DATA.byId[sin];
      return Boolean(queen && queen.equipment.every((item) => this.owns(item.id)));
    },
    equippedSet() {
      const id = club().equippedSet;
      return LG.INFERNAL_CLUB_DATA.byId[id] ? id : null;
    },
    taskMultiplier() {
      const set = this.equippedSet();
      const outfit = ["wrath", "greed", "gluttony"].includes(set) ? 3
        : set === "envy" ? 1.1
          : LG.equipment.summary(LG.authority.state()).edenSet ? 2 : 1;
      const vehicle = economy().vehicleShop?.equipped;
      const multiplier = outfit * (["achievement-lost-griffin",
        "achievement-reborn-phoenix", "reputation-blood-trex"]
        .includes(vehicle) ? 3 : 1);
      return Math.round(multiplier * 10) / 10;
    },
    reputationMultiplier() {
      const vehicle = economy().vehicleShop?.equipped;
      const multiplier = this.taskMultiplier()
        * (["reputation-blood-wolf", "reputation-blood-tiger"]
          .includes(vehicle) ? 3 : 1);
      return Math.round(multiplier * 10) / 10;
    },
    price(item) {
      const price = Math.max(0, Number(item?.price) || 0);
      if (item?.type === "equipment") return price;
      const set = this.equippedSet();
      if (["wrath", "greed", "gluttony"].includes(set)) return 0;
      return set === "envy" ? Math.ceil(price * 0.9) : price;
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
      return this.access().allowed
        && (this.chatPass(character) > 0
          || this.personality() >= LG.INFERNAL_CLUB_DATA.chatCost);
    },
    chatStatus(character) {
      const pass = this.chatPass(character);
      if (pass) return `本周期剩余${pass}/${LG.INFERNAL_CLUB_DATA.chatTurns}轮。`;
      return `消耗${LG.INFERNAL_CLUB_DATA.chatCost}人格开启${
        LG.INFERNAL_CLUB_DATA.chatTurns}轮对话；当前${this.personality()}人格。`;
    },
  };
})(window.LifeGame);
