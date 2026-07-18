(function (LG) {
  let data;

  function emptyData() {
    return {
      version: 5, owned: [], demonRuns: [], demonMealsEaten: 0, equippedOutfit: null,
      outfitEndings: { luxury: false, infernal: false },
      characters: {
        edenChef: { owned: [] },
        edenFashion: { owned: [] },
      },
    };
  }

  function normalize(saved) {
    const next = emptyData();
    const valid = new Set(LG.BLACK_PRISON_DATA.all.map((item) => item.id));
    next.owned = [...new Set(Array.isArray(saved?.owned) ? saved.owned : [])]
      .filter((id) => valid.has(id));
    next.demonRuns = Array.isArray(saved?.demonRuns) ? saved.demonRuns : [];
    const equipped = ["luxury", "infernal"].includes(saved?.equippedOutfit)
      ? saved.equippedOutfit : null;
    next.equippedOutfit = equipped
      && (LG.BLACK_PRISON_DATA.groups[equipped] || [])
        .every((item) => next.owned.includes(item.id))
      ? equipped : null;
    const legacy = Math.floor(Number(saved?.version) || 0) < 4;
    ["luxury", "infernal"].forEach((group) => {
      next.outfitEndings[group] = saved?.outfitEndings?.[group] === true
        || (legacy && (LG.BLACK_PRISON_DATA.groups[group] || [])
          .every((item) => next.owned.includes(item.id)));
    });
    Object.keys(next.characters).forEach((id) => {
      const valid = new Set(LG.EDEN_CHARACTER_DATA.byId[id].items
        .map((item) => item.id));
      next.characters[id].owned = [...new Set(
        Array.isArray(saved?.characters?.[id]?.owned)
          ? saved.characters[id].owned : [],
      )].filter((itemId) => valid.has(itemId));
    });
    const inferredMeals = next.owned.filter((id) =>
      LG.BLACK_PRISON_DATA.byId[id]?.group === "demon").length
      + next.characters.edenChef.owned.filter((id) =>
        LG.BLACK_PRISON_DATA.byId[id]?.group === "demon").length;
    next.demonMealsEaten = Math.max(0, Math.floor(Number(
      saved?.demonMealsEaten,
    ) || 0), Math.floor(Number(saved?.version) || 0) < 5 ? inferredMeals : 0);
    return next;
  }

  function groupComplete(group) {
    const items = LG.BLACK_PRISON_DATA.groups[group] || [];
    return items.length > 0 && items.every((item) => data.owned.includes(item.id));
  }

  LG.blackPrison = {
    async init() {
      data = normalize(await LG.storage.loadBlackPrison());
    },
    completedLives() {
      return LG.casino.completedLives();
    },
    lifetimePoints() {
      return LG.traits.lifetimePoints();
    },
    access() {
      const requirements = LG.BLACK_PRISON_DATA.requirements;
      const lives = this.completedLives();
      const points = this.lifetimePoints();
      const testing = LG.TEST_MODE?.unlockAllRooms;
      return {
        allowed: testing || (lives >= requirements.lives
          && points >= requirements.lifetimePoints),
        lives,
        points,
        lifeProgress: testing ? 1 : Math.min(1, lives / requirements.lives),
        pointProgress: testing ? 1 : Math.min(1, points / requirements.lifetimePoints),
      };
    },
    owns(id) {
      return data.owned.includes(id);
    },
    progress(group) {
      const items = LG.BLACK_PRISON_DATA.groups[group] || [];
      const count = items.filter((item) => this.owns(item.id)).length;
      return { count, total: items.length, complete: groupComplete(group) };
    },
    demonUnlocked() {
      return this.owns("chef-live") && this.owns("materials-menu");
    },
    demonMealsEaten() {
      return Math.max(0, Math.floor(Number(data.demonMealsEaten) || 0));
    },
    demonUnlockState() {
      return {
        chef: this.owns("chef-live"),
        materials: this.owns("materials-menu"),
        complete: this.demonUnlocked(),
      };
    },
    canEquip(group) {
      return ["luxury", "infernal"].includes(group) && groupComplete(group);
    },
    equippedOutfit() {
      return data.equippedOutfit;
    },
    outfitCategory() {
      return this.canEquip(data.equippedOutfit) ? data.equippedOutfit : null;
    },
    characterOwns(character, itemId) {
      return data.characters?.[character]?.owned?.includes(itemId) || false;
    },
    characterComplete(character) {
      return LG.EDEN_CHARACTER_DATA.byId[character].items
        .every((item) => this.characterOwns(character, item.id));
    },
    equipmentItems() {
      return Object.values(LG.EDEN_CHARACTER_DATA.byId).flatMap((character) =>
        character.items.filter((item) => this.characterOwns(character.id, item.id))
          .map((item) => ({
            id: item.equipmentId,
            source: "eden",
            adult: true,
            setId: "eden",
            prefix: "伊甸园",
            slot: "any",
            name: item.equipmentName,
            shame: 20,
          })));
    },
  };
})(window.LifeGame);
