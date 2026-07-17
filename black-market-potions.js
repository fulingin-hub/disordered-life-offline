(function (LG) {
  const origin = (country) => country === "japan" ? "日本" : "美国";
  const effectText = (amount) => `健康${amount}`;
  const kindFrom = (item) => {
    if (item?.specialKind === "water" || item?.name?.includes("美味圣水")) return "water";
    if (item?.specialKind === "gold" || item?.name?.includes("美味黄金")) return "gold";
    return null;
  };
  const defaultPrice = (country, kind) => country === "japan"
    ? (kind === "gold" ? 40 : 20) : (kind === "gold" ? 20 : 10);

  function normalizeRoom(item) {
    const kind = kindFrom(item);
    const amount = kind === "water" ? -10 : -20;
    return {
      ...item,
      country: "room",
      source: "room",
      type: "potion",
      specialKind: kind,
      stat: "health",
      amount,
      effectKey: item.effectKey || `room-${item.roomCharacter}-${kind}`,
      description: item.description || `${effectText(amount)}；库存充足时可重复食用。`,
    };
  }

  function normalizeSpecial(item, country) {
    const kind = kindFrom(item);
    if (!kind) return item;
    const market = country || item.country || (item.id?.startsWith("japan-") ? "japan" : "usa");
    const amount = kind === "water" ? -10 : -20;
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
      amount,
      effectKey: `${market}-${kind}`,
      description: `${effectText(amount)}；库存充足时可重复食用。`,
      guaranteed: true,
    };
  }

  LG.blackMarketPotions = {
    normalize(item, country) {
      if (item?.source === "room" || item?.roomCharacter) return normalizeRoom(item);
      return kindFrom(item) ? normalizeSpecial(item, country) : item;
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
      if (item.roomCharacter && (item.specialKind === "water" || item.specialKind === "gold")) {
        data.roomUsage = data.roomUsage || {};
        const usage = data.roomUsage[item.roomCharacter] || { water: 0, gold: 0 };
        usage[item.specialKind] = Math.max(0, Number(usage[item.specialKind]) || 0) + 1;
        data.roomUsage[item.roomCharacter] = usage;
      }
    },
  };
})(window.LifeGame);
