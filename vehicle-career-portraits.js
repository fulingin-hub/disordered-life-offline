(function (LG) {
  const exact = [
    {
      professionId: "mercenary",
      vehicleId: "points-horse-black",
      label: "雇佣兵 · 黑色马",
      assets: {
        male: "careerMountedMercenaryHorseMale",
        female: "careerMountedMercenaryHorseFemale",
      },
    },
  ];

  function genderKey(gender) {
    return gender === "female" ? "female" : "male";
  }

  function exactMatch(professionId, vehicle) {
    if (!professionId || !vehicle) return null;
    return exact.find((item) =>
      item.professionId === professionId && item.vehicleId === vehicle.id) || null;
  }

  function resolve(vehicle, gender, mode) {
    if (!vehicle) return null;
    const career = LG.careerMainPortrait?.get?.(gender);
    const professionId = career?.id || "";
    if (mode === "follow") {
      return {
        mode, career, match: career ? "career-follow" : "vehicle-follow",
        primarySrc: career?.src
          || LG.vehicleStore.riderAsset(vehicle.store, gender),
        mountSrc: LG.CONFIG.assets[vehicle.asset] || "",
        label: career ? `${career.name} · ${vehicle.name}` : vehicle.name,
        applyTone: false,
      };
    }
    const entry = exactMatch(professionId, vehicle);
    const assetKey = entry?.assets?.[genderKey(gender)];
    const exactSrc = assetKey ? LG.CONFIG.assets[assetKey] : "";
    if (exactSrc) {
      return {
        mode: "ride", career, match: "exact",
        primarySrc: exactSrc, mountSrc: "", sprite: null,
        label: entry.label,
        applyTone: false,
      };
    }
    const generated = LG.vehicleCareerCombinations?.resolve?.(
      professionId, vehicle, genderKey(gender));
    const paired = generated?.pair;
    if (paired) {
      return {
        mode: "ride", career, match: "career-pair",
        primarySrc: paired.careerSrc,
        mountSrc: paired.mountSrc,
        sprite: null,
        label: `${career.name} · ${vehicle.name}`,
        applyTone: false,
      };
    }
    if (career?.exclusiveVehicle) {
      return {
        mode: "ride", career, match: "career-database",
        primarySrc: career.src, mountSrc: "", sprite: null,
        label: `${career.name} · 专属坐骑`,
        applyTone: false,
      };
    }
    return {
      mode: "ride", career,
      match: generated?.src ? "career-database" : "vehicle",
      primarySrc: generated?.src
        || LG.vehicleStore.mountedAsset(vehicle, gender)
        || LG.vehicleStore.riderAsset(vehicle.store, gender),
      sprite: generated?.sprite || null,
      mountSrc: "",
      label: `${career?.name ? `${career.name} · ` : ""}${vehicle.name}`,
      applyTone: !generated?.src,
    };
  }

  LG.vehicleCareerPortraits = {
    exact,
    resolve,
    hasExact(professionId, vehicleId) {
      return exact.some((item) =>
        item.professionId === professionId && item.vehicleId === vehicleId);
    },
  };
})(window.LifeGame);
