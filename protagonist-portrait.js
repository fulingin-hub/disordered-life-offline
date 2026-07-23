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
    if (vehicle) {
      const resolved = LG.vehicleCareerPortraits.resolve(
        vehicle, gender, LG.vehicleStore.displayMode());
      if (resolved?.primarySrc) return resolved.primarySrc;
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
      wrap.hidden = true;
      image.removeAttribute("src");
      mountImage.removeAttribute("src");
      mountImage.hidden = true;
    },
  };
})(window.LifeGame);
