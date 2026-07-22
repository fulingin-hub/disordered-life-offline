(function (LG) {
  const themes = {
    shadow: ["#aab7c6", "#6e7d96", "影狱管制模型"],
    casino: ["#e0b651", "#9e3151", "异域赌场模型"],
    expo: ["#62c9d6", "#d58a45", "万界博览会模型"],
    infernal: ["#b86de3", "#d34f79", "异界魔境模型"],
    university: ["#d5c58d", "#6f86a7", "国立大学首领模型"],
    sanctuary: ["#d7d0b4", "#6d9d8f", "机构园区首领模型"],
    ranch: ["#d0a45f", "#78865a", "米国牧场首领模型"],
    paradise: ["#d9b75c", "#a84f6b", "乐园首领模型"],
    domain: ["#d76088", "#6e63b5", "异域首领模型"],
    otherworld: ["#6ec5c8", "#8468c6", "异界首领模型"],
    japanMarket: ["#d8d9e0", "#b34d65", "岛国黑市模型"],
    usaMarket: ["#d6b568", "#9c4050", "米国黑市模型"],
    privateShop: ["#d3b35d", "#568f98", "个人商城角色模型"],
  };

  function career(id) {
    return LG.CAREER_DATA?.roster?.find((item) => item.id === id);
  }

  function group(meta) {
    const id = meta?.id;
    if (!id) return null;
    if (LG.PENITENTIARY_DATA?.byId?.[id]) return "shadow";
    if (LG.CASINO_DATA?.byId?.[id]) return "casino";
    const other = LG.OTHERWORLD_CHARACTER_DATA?.byId?.[id];
    if (other) return other.host === "expo" ? "expo" : "infernal";
    if (LG.INFERNAL_DATA?.byWitchCharacter?.[id]) return "infernal";
    const leader = career(id);
    if (leader?.rankIndex === 2) return leader.faction;
    const market = LG.BLACK_MARKET_DATA?.characters?.[id];
    if (market) return market.country === "japan" ? "japanMarket" : "usaMarket";
    if (LG.COLLECTIBLE_CHARACTERS?.[id]) return "privateShop";
    return null;
  }

  function offeringSource(meta) {
    const items = LG.GALLERY_ASSETS?.[meta?.id]?.items || [];
    const dedicated = items.find((item) =>
      /灵魂|供奉|钥匙/.test(`${item.title || ""}${item.caption || ""}`));
    const alternate = items.find((item) =>
      item?.src && item.src !== meta?.src);
    return dedicated?.src || alternate?.src || meta?.src || null;
  }

  function profile(meta) {
    const key = group(meta);
    const theme = themes[key];
    if (!theme || !meta?.src) return null;
    return {
      id: `${key}-${meta.id}`,
      group: key,
      primary: theme[0],
      secondary: theme[1],
      label: theme[2],
      src: meta.src,
      offeringSrc: offeringSource(meta),
    };
  }

  function caption(meta, template) {
    const model = profile(meta);
    if (!model) return null;
    const action = {
      foot: "以角色自身模型完成低机位足部动作",
      gold: "以角色自身模型启动黄金仪式",
      water: "以角色自身模型启动圣水仪式",
      offering: "以角色自身模型完成三阶段灵魂供奉",
      showcase: "以角色自身模型完成王座支配与灵魂吸收",
    }[template];
    return `${meta.name} · ${model.label} · ${action}`;
  }

  function apply(dialog, meta, mode) {
    const model = profile(meta);
    if (!dialog) return model;
    if (!model) {
      delete dialog.dataset.animationModel;
      delete dialog.dataset.animationGroup;
      delete dialog.dataset.dedicatedModel;
      delete dialog.dataset.animationMode;
      dialog.style.removeProperty("--character-model-primary");
      dialog.style.removeProperty("--character-model-secondary");
      return null;
    }
    dialog.dataset.animationModel = model.id;
    dialog.dataset.animationGroup = model.group;
    dialog.dataset.dedicatedModel = "true";
    if (mode) dialog.dataset.animationMode = mode;
    dialog.style.setProperty("--character-model-primary", model.primary);
    dialog.style.setProperty("--character-model-secondary", model.secondary);
    dialog.style.setProperty("--showcase-primary", model.primary);
    dialog.style.setProperty("--showcase-secondary", model.secondary);
    return model;
  }

  LG.characterAnimationModels = {
    profile, caption, apply, group, offeringSource,
  };
})(window.LifeGame);
