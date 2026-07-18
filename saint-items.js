(function (LG) {
  function data() {
    return LG.authority?.snapshot?.()?.economy?.saint || {
      owned: [], items: [], active: false, endingTriggered: false,
    };
  }

  function points() {
    return LG.authority?.snapshot?.()?.economy?.achievementPoints || {
      balance: 0, lifetime: 0,
    };
  }

  LG.saintItems = {
    items(character) {
      return data().items.filter((item) => item.character === character);
    },
    owns(itemId) {
      return data().owned.includes(itemId);
    },
    active() {
      return data().active === true;
    },
    balance() {
      return Math.max(0, Number(points().balance) || 0);
    },
    lifetime() {
      return Math.max(0, Number(points().lifetime) || 0);
    },
    equipmentItems() {
      return data().items.filter((item) => this.owns(item.id)).map((item) => ({
        ...item,
        source: "saint",
        setId: "saint",
        prefix: "圣徒礼赞",
        shame: 0,
        adult: false,
      }));
    },
    isFullSet(state) {
      const ids = new Set(Object.values(state?.equipment || {}));
      return ["saint-crown", "saint-robe", "saint-staff", "saint-star", "saint-shoes"]
        .every((id) => ids.has(id));
    },
  };
})(window.LifeGame);
