(function (LG) {
  const poses = {
    bare: "./assets/generated/female-soul-offering-barefoot.f8533a4e.webp",
    stocking: "./assets/generated/female-soul-offering-stockings.96bcf7c2.webp",
    male: "./assets/generated/low-angle-male-pose.98edae6f.webp",
  };
  const queenPoses = {
    greed:
      "./assets/generated/infernal-greed-queen-offering-squat.ac1304b1.webp",
    lust:
      "./assets/generated/infernal-lust-queen-offering-squat.3e82c11f.webp",
    wrath:
      "./assets/generated/infernal-wrath-queen-offering-squat.e223f759.webp",
    sloth:
      "./assets/generated/infernal-sloth-queen-offering-squat.623091ad.webp",
    pride:
      "./assets/generated/infernal-pride-queen-offering-squat.b990ff4b.webp",
    envy:
      "./assets/generated/infernal-envy-queen-offering-squat.e1da65a6.webp",
    gluttony:
      "./assets/generated/infernal-gluttony-queen-offering-squat.a4a0235c.webp",
  };

  function playerGender() {
    return LG.authority?.state?.()?.gender === "female" ? "Female" : "Male";
  }

  function femaleVariant(id) {
    const score = [...String(id || "")].reduce(
      (sum, character) => sum + character.charCodeAt(0), 0);
    return score % 2 ? "stocking" : "bare";
  }

  function pose(meta) {
    if (meta?.kind === "queen" && queenPoses[meta.id]) {
      return { variant: `queen-${meta.id}`, src: queenPoses[meta.id] };
    }
    const model = LG.characterAnimationModels?.profile?.(meta);
    if (model) {
      return {
        variant: `character-${model.group}`,
        src: model.src,
        dedicated: true,
      };
    }
    if (meta?.gender !== "female") {
      return { variant: "male", src: poses.male };
    }
    const variant = femaleVariant(meta.id);
    return { variant, src: poses[variant] };
  }

  function queen(sin) {
    const data = LG.INFERNAL_CLUB_DATA.byId[sin];
    if (!data) return null;
    const name = sin[0].toUpperCase() + sin.slice(1);
    return {
      id: sin,
      kind: "queen",
      gender: "female",
      name: `${data.name}地狱女魔王`,
      src: LG.CONFIG.assets[`infernalClub${name}Seated${playerGender()}`]
        || LG.CONFIG.assets[data.portrait],
    };
  }

  function leader(raw) {
    const data = typeof raw === "string"
      ? LG.CAREER_DATA.roster.find((item) => item.id === raw) : raw;
    if (data?.rankIndex !== 2) return null;
    return {
      id: data.id,
      kind: "leader",
      gender: data.gender,
      name: LG.CAREER_DATA.characterLabel(data),
      src: LG.careerPortraits.characterSource(data),
    };
  }

  function room(raw) {
    if (!raw?.id || !raw?.src) return null;
    return {
      id: raw.id,
      kind: raw.kind || "room",
      gender: raw.gender || LG.COLLECTIBLE_CHARACTERS?.[raw.id]?.gender,
      name: raw.name || LG.COLLECTIBLE_CHARACTERS?.[raw.id]?.name || raw.id,
      src: raw.src,
      country: raw.country,
      faction: raw.faction,
      host: raw.host,
    };
  }

  LG.buttImpactMeta = {
    pose,
    queen,
    leader,
    room,
    femaleVariant,
    queenPoses,
  };
})(window.LifeGame);
