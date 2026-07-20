(function (LG) {
  const origin = (country) => country === "japan" ? "岛国" : "米国";
  const kindFrom = (item) => {
    if (item?.specialKind === "water" || item?.name?.includes("美味圣水")) return "water";
    if (item?.specialKind === "gold" || item?.name?.includes("美味黄金")) return "gold";
    if (item?.specialKind === "despair" || item?.name?.includes("丧志药物")) return "despair";
    if (item?.specialKind === "addictive" || item?.name?.includes("成瘾药剂")) {
      return "addictive";
    }
    if (item?.type === "potion" || item?.name?.includes("药剂")
      || item?.name?.includes("药物")) return "potion";
    return null;
  };
  const defaultPrice = (country, kind) => country === "japan"
    ? (kind === "gold" ? 40 : 20) : (kind === "gold" ? 20 : 10);

  function normalizePotion(item, country) {
    const kind = kindFrom(item);
    const effects = LG.potionEffects.for({ specialKind: kind });
    const room = item?.source === "room" || item?.roomCharacter;
    return {
      ...item,
      country: room ? "room" : country || item.country,
      source: room ? "room" : item.source,
      type: "potion",
      specialKind: kind,
      stat: "health",
      amount: effects.health,
      effects,
      effectKey: item.effectKey || `room-${item.roomCharacter}-${kind}`,
      description: `${LG.potionEffects.text(effects)}；${
        ["water", "gold"].includes(kind)
          ? "库存充足时可重复饮用。" : "每轮人生限饮一次。"}`,
    };
  }

  function normalizeSpecial(item, country) {
    const kind = kindFrom(item);
    if (!kind) return item;
    const market = country || item.country || (item.id?.startsWith("japan-") ? "japan" : "usa");
    const effects = LG.potionEffects.for({ specialKind: kind });
    const suffix = kind === "water" ? "美味圣水" : "美味黄金圣餐";
    return {
      ...item,
      country: market,
      type: "potion",
      specialKind: kind,
      prefixId: `${market}-origin`,
      prefix: `${origin(market)}产出的`,
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : defaultPrice(market, kind),
      name: `${origin(market)}产出的${suffix}`,
      stat: "health",
      amount: effects.health,
      effects,
      effectKey: `${market}-${kind}`,
      description: `${LG.potionEffects.text(effects)}；库存充足时可重复饮用。`,
      guaranteed: true,
    };
  }

  LG.blackMarketPotions = {
    normalize(item, country) {
      const kind = kindFrom(item);
      const custom = item?.source === "room" || item?.roomCharacter
        || item?.source === "faction" || item?.country === "career";
      if (custom && kind) return normalizePotion(item, country);
      return ["water", "gold"].includes(kind)
        ? normalizeSpecial(item, country) : kind ? normalizePotion(item, country) : item;
    },
    roomPrice(kind) {
      return defaultPrice("japan", kind);
    },
    special(country, date, kind) {
      return normalizeSpecial({
        id: `${country}-${date}-${kind}`,
        country,
        specialKind: kind,
        price: defaultPrice(country, kind),
      }, country);
    },
    recordUse(data, item, causedHealthZero = false) {
      data.usageTotals = {
        holyWater: 0, goldenSacrament: 0, usaDrugs: 0, healthZeroFromSpecials: 0,
        ...data.usageTotals,
      };
      if (item.specialKind === "water") data.usageTotals.holyWater += 1;
      if (item.specialKind === "gold") data.usageTotals.goldenSacrament += 1;
      if (item.country === "usa") data.usageTotals.usaDrugs += 1;
      if (causedHealthZero) data.usageTotals.healthZeroFromSpecials += 1;
      if (item.roomCharacter && item.specialKind) {
        data.roomUsage = data.roomUsage || {};
        const usage = data.roomUsage[item.roomCharacter] || {};
        usage[item.specialKind] = Math.max(0, Number(usage[item.specialKind]) || 0) + 1;
        data.roomUsage[item.roomCharacter] = usage;
      }
    },
  };
})(window.LifeGame);
