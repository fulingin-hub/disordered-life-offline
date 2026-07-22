(function (LG) {
  const assetKeys = {
    male: {
      base: "protagonistMaleBase",
      character: "protagonistMaleCharacterSet",
      tribute: "protagonistMaleTributeSet",
      japan: "protagonistMaleJapanSet",
      usa: "protagonistMaleUSASet",
      trait: "protagonistMaleTraitSet",
      luxury: "protagonistMaleLuxurySet",
      infernal: "protagonistMaleInfernalSet",
      penitentiary: "protagonistMalePenitentiarySet",
      saint: "protagonistMaleSaintSet",
      eden: "protagonistMaleEdenSet",
      penitentiaryPolice: "protagonistMalePenitentiaryPoliceSet",
    },
    female: {
      base: "protagonistFemaleBase",
      character: "protagonistFemaleCharacterSet",
      tribute: "protagonistFemaleTributeSet",
      japan: "protagonistFemaleJapanSet",
      usa: "protagonistFemaleUSASet",
      trait: "protagonistFemaleTraitSet",
      luxury: "protagonistFemaleLuxurySet",
      infernal: "protagonistFemaleInfernalSet",
      penitentiary: "protagonistFemalePenitentiarySet",
      saint: "protagonistFemaleSaintSet",
      eden: "protagonistFemaleEdenSet",
      penitentiaryPolice: "protagonistFemalePenitentiaryPoliceSet",
    },
  };
  const labels = {
    base: "常规装束",
    character: "角色收藏套装",
    tribute: "贡金角色套装",
    japan: "岛国黑市套装",
    usa: "米国黑市套装",
    trait: "属性套装",
    luxury: "权贵奢华套装",
    infernal: "乐园王袍套装",
    penitentiary: "影狱人格丧志套装",
    saint: "圣徒礼赞套装",
    eden: "伊甸园套装",
    penitentiaryPolice: "影狱套装",
  };
  let wrap, image, mountImage;
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
    if (items.every((item) => item.source === "saint")) return "saint";
    if (items.every((item) =>
      item.source === "penitentiaryCertificate")) return "penitentiaryPolice";
    const summary = LG.equipment.summary(state);
    if (!summary.set) return null;
    if (items.every((item) => item.source === "eden")) return "eden";
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
    if (items.every((item) =>
      ["realm-hunter", "realm-black-knight"].includes(item.setId))) {
      return "realm";
    }
    const traitSetIds = new Set(LG.EQUIPMENT_SETS.map((set) => set.id));
    if (items.every((item) => traitSetIds.has(item.setId))) return "trait";
    return null;
  }

  function category(state) {
    const clubSet = LG.infernalClub?.equippedSet?.();
    return (clubSet ? `club-${clubSet}` : null)
      || (LG.penitentiary?.outfitEquipped?.() ? "penitentiary" : null)
      || LG.blackPrison?.outfitCategory?.()
      || setCategory(state) || "base";
  }

  function source(state) {
    const gender = state?.gender === "female" ? "female" : state?.gender === "male" ? "male" : null;
    if (!gender || currentAge(state) < 18) return null;
    const career = LG.careerMainPortrait?.get?.(gender);
    const vehicle = LG.vehicleStore?.equipped?.();
    if (vehicle && LG.vehicleStore.displayMode() === "ride") {
      const mounted = LG.vehicleStore.mountedAsset(vehicle, gender);
      return career?.src || mounted
        || LG.vehicleStore.riderAsset(vehicle.store, gender);
    }
    if (career) return career.src;
    const outfit = category(state);
    if (outfit === "realm") {
      return LG.CONFIG.assets[gender === "female"
        ? "vehiclePersonalityFemale" : "vehiclePersonalityMale"];
    }
    if (outfit.startsWith("club-")) {
      const queen = LG.INFERNAL_CLUB_DATA?.byId?.[outfit.slice(5)];
      return queen ? LG.CONFIG.assets[
        gender === "female" ? queen.apostleFemale : queen.apostleMale] : null;
    }
    return LG.CONFIG.assets[assetKeys[gender][outfit]];
  }

  LG.protagonistPortrait = {
    init() {
      wrap = document.getElementById("protagonistWrap");
      image = document.getElementById("protagonistPortrait");
      mountImage = document.getElementById("protagonistMountPortrait");
    },
    category,
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
        mountImage.removeAttribute("src");
        mountImage.hidden = true;
        return;
      }
      const outfit = category(state);
      image.src = src;
      const career = LG.careerMainPortrait?.get?.(gender);
      const vehicle = LG.vehicleStore?.equipped?.();
      if (vehicle) {
        const mode = LG.vehicleStore.displayMode();
        const mounted = mode === "ride" && !career
          ? LG.vehicleStore.mountedAsset(vehicle, gender) : "";
        const identity = LG.VEHICLE_DATA.stores[vehicle.store].outfit;
        const role = career?.name || identity;
        image.alt = `${gender === "female" ? "女" : "男"}主角·${role}·${
          mode === "ride" ? "乘骑" : "跟随"}${vehicle.name}`;
        image.className = mounted ? `protagonist-mounted-portrait tone-${vehicle.tone}`
          : career ? `career-main-portrait${mode === "ride"
            ? " career-vehicle-rider" : ""}`
          : mode === "ride"
            ? `protagonist-rider-portrait tone-${vehicle.tone}`
            : "protagonist-rider-portrait";
        if (mounted) {
          mountImage.removeAttribute("src");
          mountImage.hidden = true;
        } else {
          mountImage.src = LG.CONFIG.assets[vehicle.asset];
          mountImage.alt = vehicle.name;
          mountImage.className = `protagonist-mount-portrait tone-${vehicle.tone}`;
          mountImage.hidden = false;
        }
        wrap.dataset.category = career && mode === "follow"
          ? `career-${career.category}` : `vehicle-${vehicle.store}`;
        wrap.dataset.vehicleFamily = vehicle.family;
        wrap.dataset.vehicleTone = vehicle.tone;
        wrap.dataset.vehicleMode = mode;
        wrap.classList.toggle("mounted", mode === "ride");
        wrap.classList.toggle("following", mode === "follow");
        wrap.hidden = false;
        return;
      }
      if (career) return LG.careerMainPortrait.apply({ wrap, image, mountImage, gender, career });
      const clubName = outfit.startsWith("club-")
        ? `${LG.INFERNAL_CLUB_DATA.byId[outfit.slice(5)]?.name || "地狱"}魔王使徒`
        : outfit === "realm" ? "异界魔境骑士" : labels[outfit];
      image.alt = `${gender === "female" ? "女" : "男"}主角·${clubName}`;
      image.className = "";
      mountImage.removeAttribute("src");
      mountImage.hidden = true;
      wrap.dataset.category = outfit;
      delete wrap.dataset.vehicleFamily;
      delete wrap.dataset.vehicleTone;
      delete wrap.dataset.vehicleMode;
      wrap.classList.remove("mounted");
      wrap.classList.remove("following");
      wrap.hidden = false;
    },
  };
})(window.LifeGame);
