(function (LG) {
  const description = "可装备到任意栏位；装备后增加20点羞耻。";

  function stock(date) {
    return LG.BLACK_MARKET_DATA.usaEquipmentSets.flatMap((set) =>
      set.items.map((suffix, index) => ({
        id: `usa-${date}-equipment-${set.id}-${index}`,
        country: "usa",
        type: "equipment",
        prefixId: set.id,
        prefix: set.prefix,
        price: set.price,
        slot: "any",
        name: `${set.prefix}${suffix}`,
        description,
      })));
  }

  function ensure(daily, date) {
    const legacyIds = new Set(daily.stock
      .filter((item) => item.country === "usa" && item.type === "equipment"
        && (item.testFree || item.name?.startsWith("（")))
      .map((item) => item.id));
    daily.stock = daily.stock.filter((item) => !legacyIds.has(item.id));
    daily.sold = daily.sold.filter((id) => !legacyIds.has(id));
    const existing = new Set(daily.stock
      .filter((item) => item.type === "equipment" && item.country === "usa")
      .map((item) => item.name));
    const missing = stock(date).filter((item) => !existing.has(item.name));
    daily.stock.push(...missing);
    return legacyIds.size > 0 || missing.length > 0;
  }

  function normalizeOwned(item) {
    if (item.source !== "blackMarket" || item.country !== "usa") return item;
    const { testFree, ...owned } = item;
    const name = String(owned.name || "").replace(/^（([^）]+)）/, "$1")
      .replace("女兵的汗臭皮制内裤", "女兵的汗臭皮质内裤");
    return { ...owned, name };
  }

  LG.blackMarketUSAEquipment = { stock, ensure, normalizeOwned };
})(window.LifeGame);
