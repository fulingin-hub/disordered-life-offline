(function (LG) {
  const templates = [
    ["foot", "足踏", "角色立绘与足部冲击模板回放。"],
    ["gold", "黄金", "黄金冲积层模板回放。"],
    ["water", "圣水", "圣水持续滴落模板回放。"],
    ["offering", "供奉", "三阶段献上灵魂模板回放。"],
    ["showcase", "支配", "王座支配与灵魂吞噬模板回放。"],
  ].map(([id, title, caption]) => ({ id, title, caption }));
  const leaderCaptions = {
    foot: "势力首领以低机位俯视姿态发动足部冲击。",
    gold: "势力首领用黄金奖励维持近距离压迫。",
    water: "势力首领让圣水持续覆盖玩家视野。",
    offering: "势力首领启动三阶段灵魂供奉仪式。",
    showcase: "势力首领在王座支配中吞噬玩家灵魂。",
  };

  function record(id) {
    return LG.CAREER_DATA?.roster?.find((item) => item.id === id)
      || LG.CASINO_DATA?.byId?.[id]
      || LG.EDEN_CHARACTER_DATA?.byId?.[id]
      || LG.PENITENTIARY_DATA?.byId?.[id]
      || LG.OTHERWORLD_CHARACTER_DATA?.byId?.[id]
      || LG.BLACK_MARKET_DATA?.characters?.[id]
      || LG.COLLECTIBLE_CHARACTERS?.[id]
      || null;
  }

  function resolve(id) {
    const gallery = LG.GALLERY_ASSETS[id];
    const queen = LG.INFERNAL_CLUB_DATA?.byCharacter?.[id];
    if (queen) {
      return {
        id: queen.id,
        kind: "queen",
        gender: "female",
        route: "gallery",
        name: queen.title,
        src: LG.CONFIG.assets[queen.portrait],
        portrait: LG.CONFIG.assets[queen.portrait],
        showcase: LG.contributionShowcase.queen(queen),
      };
    }
    const witch = LG.INFERNAL_DATA?.byWitchCharacter?.[id];
    if (witch) {
      const src = LG.CONFIG.assets[witch.witch];
      return {
        id, kind: "room", gender: "female", route: "gallery",
        name: witch.mobTitle, src, portrait: src,
        showcase: LG.contributionShowcase.leader({
          name: witch.mobTitle, faction: `infernal-${witch.id}`,
        }),
      };
    }
    const data = record(id);
    const career = LG.CAREER_DATA?.roster?.find((item) => item.id === id);
    const src = career
      ? LG.careerPortraits.characterSource(career)
      : data?.portrait || LG.CONFIG.assets[id]
        || gallery?.items.find((item) => item.src)?.src;
    if (!gallery || !src) return null;
    const name = gallery.name || data?.name || id;
    const gender = career?.gender || data?.gender;
    return {
      id,
      kind: career?.rankIndex === 2 ? "leader" : "room",
      gender: ["male", "female"].includes(gender) ? gender : "female",
      route: "gallery",
      name,
      src,
      portrait: src,
      faction: career?.faction,
      showcase: LG.contributionShowcase.leader({
        id, name, src,
        faction: career?.faction || id,
      }),
    };
  }

  function unique(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item?.src || seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });
  }

  Object.values(LG.GALLERY_ASSETS).forEach((gallery) => {
    gallery.items = unique(gallery.items);
  });

  LG.galleryAnimationTemplates = {
    entries(character) {
      const leader = LG.CAREER_DATA?.roster?.some((item) =>
        item.id === character && item.rankIndex === 2);
      const meta = resolve(character);
      const model = LG.characterAnimationModels?.profile?.(meta);
      return templates.map((item) => ({
        type: "animation",
        template: item.id,
        title: item.title,
        caption: LG.characterAnimationModels?.caption?.(meta, item.id)
          || (leader ? leaderCaptions[item.id] : item.caption),
        portrait: model?.src,
        animationModel: model?.id,
        modelPrimary: model?.primary,
        modelSecondary: model?.secondary,
      }));
    },
    play(character, template) {
      const meta = resolve(character);
      if (!meta) return false;
      if (template === "foot") {
        if (meta.kind === "queen") {
          return Boolean(LG.infernalStompPopup.show(meta.id, "original", 1));
        }
        return Boolean(LG.characterFootImpactPopup.show({
          kind: "gallery",
          roomId: meta.id,
          members: [meta],
        }, 1, [LG.buttImpactMeta.femaleVariant(meta.id)]));
      }
      if (template === "gold" || template === "water") {
        return LG.buttImpactPopup.showCharacter(meta, 10, template);
      }
      if (template === "offering" || template === "showcase") {
        return LG.contributionRitual.preview(meta, template);
      }
      return false;
    },
    resolve,
  };
})(window.LifeGame);
