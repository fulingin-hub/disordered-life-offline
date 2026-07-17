(function (LG) {
  let data;
  let saveQueue = Promise.resolve();

  function emptyData() {
    return { version: 1, owned: [] };
  }

  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    const validIds = new Set(Object.values(LG.COLLECTIBLE_CATALOG)
      .flat().map((item) => item.id));
    next.owned = [...new Set(Array.isArray(saved.owned) ? saved.owned : [])]
      .filter((id) => validIds.has(id));
    return next;
  }

  LG.collectibles = {
    async init() {
      data = normalize(await LG.storage.loadCollectibles());
    },
    shopUnlocked() {
      return LG.traits.isAtLeast("despair", 100);
    },
    characters() {
      return Object.values(LG.COLLECTIBLE_CHARACTERS);
    },
    shopCharacters() {
      return this.characters().filter((character) => !LG.tribute?.isCharacter(character.id));
    },
    items(character) {
      return LG.COLLECTIBLE_CATALOG[character] || [];
    },
    owns(itemId) {
      const item = Object.values(LG.COLLECTIBLE_CATALOG).flat()
        .find((entry) => entry.id === itemId);
      if (item?.source === "tribute") {
        return LG.tribute?.points(item.character) >= item.unlockAt;
      }
      return data.owned.includes(itemId);
    },
    equipmentItems() {
      return Object.values(LG.COLLECTIBLE_CATALOG).flat()
        .filter((item) => this.owns(item.id))
        .map((item) => ({
          id: `collection-${item.id}`,
          source: "collection",
          adult: true,
          setId: `collection-${item.character}`,
          prefix: LG.COLLECTIBLE_CHARACTERS[item.character].name,
          slot: "any",
          name: item.name,
          shame: 20,
        }));
    },
    progress(character) {
      const items = this.items(character);
      const count = items.filter((item) => this.owns(item.id)).length;
      return { count, total: items.length, complete: items.length > 0 && count === items.length };
    },
    galleryUnlocked(character) {
      if (LG.blackMarket?.isCharacter(character)) {
        return LG.blackMarket.galleryUnlocked(character);
      }
      if (!LG.achievements.isUnlocked(character)) return false;
      return LG.tribute?.isCharacter(character)
        ? LG.tribute.galleryUnlocked(character) : this.progress(character).complete;
    },
    galleryHint(character) {
      if (LG.blackMarket?.isCharacter(character)) {
        const place = LG.blackMarket.country(character) === "japan" ? "日本" : "美国";
        return `需在${place}女高官引荐事件中选择特殊足底选项解锁。`;
      }
      if (LG.tribute?.isCharacter(character)) {
        return `CG画廊解锁需求：贡金达到100点（当前${LG.tribute.points(character)}点）。`;
      }
      const progress = this.progress(character);
      return `CG画廊解锁需求：集齐该角色全部道具（${progress.count}/${progress.total}）。`;
    },
    collectionStatus(character) {
      const progress = this.progress(character);
      if (LG.tribute?.isCharacter(character)) {
        return `贡金${LG.tribute.points(character)}点；道具${progress.count}/${progress.total}，在100/200/300/500/600点自动激活。`;
      }
      return progress.complete
        ? `${progress.total}件道具已全部激活，角色CG画廊已开放。`
        : `已激活 ${progress.count}/${progress.total}，集齐后开放角色CG画廊。`;
    },
    buy(character, itemId) {
      if (!this.shopUnlocked()) return { ok: false, message: "丧志达到100点后解锁属性点商城。" };
      if (!LG.achievements.isUnlocked(character)) {
        return { ok: false, message: "需要先完成该角色路线10次并解锁房间。" };
      }
      const item = this.items(character).find((entry) => entry.id === itemId);
      if (!item) return { ok: false, message: "道具不存在。" };
      if (item.source === "tribute") {
        return { ok: false, message: `该道具需在角色房间贡金达到${item.unlockAt}点。` };
      }
      if (this.owns(itemId)) return { ok: false, message: "该道具已经激活。" };
      if (!LG.traits.spendPoints(item.price)) {
        return { ok: false, message: `属性点不足，需要${item.price}点。` };
      }
      data.owned.push(itemId);
      const progress = this.progress(character);
      return {
        ok: true,
        item,
        progress,
        message: progress.complete
          ? `已集齐${LG.COLLECTIBLE_CHARACTERS[character].name}的全部道具，CG画廊已开放。`
          : `已激活${item.name}（${progress.count}/${progress.total}）。`,
      };
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveCollectibles(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
