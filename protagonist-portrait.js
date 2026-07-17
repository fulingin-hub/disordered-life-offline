(function (LG) {
  const assetKeys = {
    male: {
      base: "protagonistMaleBase",
      character: "protagonistMaleCharacterSet",
      tribute: "protagonistMaleTributeSet",
      japan: "protagonistMaleJapanSet",
      usa: "protagonistMaleUSASet",
      trait: "protagonistMaleTraitSet",
    },
    female: {
      base: "protagonistFemaleBase",
      character: "protagonistFemaleCharacterSet",
      tribute: "protagonistFemaleTributeSet",
      japan: "protagonistFemaleJapanSet",
      usa: "protagonistFemaleUSASet",
      trait: "protagonistFemaleTraitSet",
    },
  };
  const labels = {
    base: "常规装束",
    character: "角色收藏套装",
    tribute: "贡金角色套装",
    japan: "日本黑市套装",
    usa: "美国黑市套装",
    trait: "属性套装",
  };
  let wrap;
  let image;

  function eventAge(event) {
    const age = Number(event?.age);
    return Number.isFinite(age) ? age : 0;
  }

  function currentAge(state) {
    const activeAge = eventAge(LG.engine?.current?.(state));
    return Math.max(activeAge, Number(state?.lastEventAge) || 0,
      state?.endingId ? 18 : 0);
  }

  function equippedItems(state) {
    return LG.EQUIPMENT_SLOTS
      .map((slot) => LG.equipment.item(state.equipment?.[slot.id]))
      .filter(Boolean);
  }

  function setCategory(state) {
    const items = equippedItems(state);
    if (items.length !== LG.EQUIPMENT_SLOTS.length) return null;
    const summary = LG.equipment.summary(state);
    if (!summary.set) return null;
    const tributeSetIds = new Set([
      "collection-streetThug",
      "collection-beggar",
    ]);
    if (items.every((item) => tributeSetIds.has(item.setId))) return "tribute";
    if (items.every((item) => item.source === "collection")) return "character";
    if (items.every((item) =>
      item.source === "blackMarket" && item.country === "japan")) return "japan";
    if (items.every((item) =>
      item.source === "blackMarket" && item.country === "usa")) return "usa";
    const traitSetIds = new Set(LG.EQUIPMENT_SETS.map((set) => set.id));
    if (items.every((item) => traitSetIds.has(item.setId))) return "trait";
    return null;
  }

  function source(state) {
    const gender = state?.gender === "female" ? "female"
      : state?.gender === "male" ? "male" : null;
    if (!gender || currentAge(state) < 18) return null;
    return LG.CONFIG.assets[assetKeys[gender][setCategory(state) || "base"]];
  }

  LG.protagonistPortrait = {
    init() {
      wrap = document.getElementById("protagonistWrap");
      image = document.getElementById("protagonistPortrait");
    },
    category: setCategory,
    currentAge,
    source,
    render(state) {
      if (!wrap || !image) this.init();
      const gender = state?.gender === "female" ? "female"
        : state?.gender === "male" ? "male" : null;
      const src = source(state);
      if (!src) {
        wrap.hidden = true;
        image.removeAttribute("src");
        return;
      }
      const category = setCategory(state) || "base";
      image.src = src;
      image.alt = `${gender === "female" ? "女" : "男"}主角·${labels[category]}`;
      wrap.dataset.category = category;
      wrap.hidden = false;
    },
  };
})(window.LifeGame);
