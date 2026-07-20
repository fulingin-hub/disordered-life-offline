(function (LG) {
  const meta = LG.BLACK_MARKET_DATA;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const utcDate = () => LG.authority?.snapshot?.()?.serverDate
    || new Date().toISOString().slice(0, 10);
  const prefix = (country, id) => (country === "japan"
    ? meta.japanPrefixes : meta.usaPrefixes).find((item) => item.id === id);
  function equipmentStock(date) {
    const suffixes = Object.values(meta.japanEquipment).flat();
    return Array.from({ length: LG.EQUIPMENT_SLOTS.length }, (_, index) => {
      const selected = pick(meta.japanPrefixes);
      const suffix = pick(suffixes);
      return {
        id: `japan-${date}-${index}`,
        type: "equipment",
        prefixId: selected.id,
        prefix: selected.label,
        price: selected.price,
        slot: "any",
        name: `${selected.label}的${suffix}`,
        description: "可装备到任意栏位；装备后增加20点羞耻。",
      };
    });
  }

  function potionFromTemplate(country, date, index, template, guaranteed) {
    const selected = prefix(country, template.prefix) || pick(country === "japan"
      ? meta.japanPrefixes : meta.usaPrefixes);
    const joiner = selected.label.endsWith("的") ? "" : "的";
    const name = `${selected.label}${joiner}${template.suffix}`;
    const effects = LG.potionEffects.for({ specialKind: "potion" });
    return {
      id: `${country}-${date}-${guaranteed || index}`,
      country,
      type: "potion",
      prefixId: selected.id,
      prefix: selected.label,
      price: selected.price,
      name,
      stat: template.stat,
      amount: template.amount,
      effects,
      effectKey: `${country}-${template.id || guaranteed}`,
      description: `${LG.potionEffects.text(effects)}；每个人生限饮一次同类药剂。`,
      guaranteed: Boolean(guaranteed),
    };
  }

  function potionStock(country, date) {
    const templates = country === "japan" ? meta.japanPotions : meta.usaPotions;
    const potions = Array.from({ length: 5 }, (_, index) =>
      potionFromTemplate(country, date, index, pick(templates)));
    return country === "japan"
      ? [...potions, ...equipmentStock(date)]
      : [...potions, ...LG.blackMarketUSAEquipment.stock(date)];
  }

  function ensureCountry(country) {
    const state = LG.blackMarket._data();
    const date = utcDate();
    let changed = false;
    if (state.daily[country]?.date !== date) {
      state.daily[country] = {
        date,
        stock: potionStock(country, date),
        sold: [],
        refreshes: 0,
      };
      changed = true;
    }
    const daily = state.daily[country];
    const count = state.kneels[country];
    const stockDate = daily.refreshes ? `${date}-r${daily.refreshes}` : date;
    if (country === "usa") changed = LG.blackMarketUSAEquipment.ensure(daily, stockDate) || changed;
    [["water", 40], ["gold", 50]].forEach(([kind, threshold]) => {
      if (count >= threshold && !daily.stock.some((item) => item.specialKind === kind)) {
        daily.stock.push(LG.blackMarketPotions.special(country, stockDate, kind));
        changed = true;
      }
    });
    return changed;
  }

  function currentAge(state) {
    const active = LG.engine?.current?.(state);
    return active?.age ?? state?.lastEventAge ?? 0;
  }

  Object.assign(LG.blackMarket, {
    currentAge,
    refreshDaily(country) {
      if (country) return ensureCountry(country);
      const japanChanged = ensureCountry("japan");
      const usaChanged = ensureCountry("usa");
      return japanChanged || usaChanged;
    },
    regenerateStock(country) {
      ensureCountry(country);
      const daily = this._data().daily[country];
      const key = `${daily.date}-r${daily.refreshes}`;
      daily.stock = potionStock(country, key);
      ensureCountry(country);
    },
    stock(id) {
      const country = this.country(id);
      if (!country) return [];
      ensureCountry(country);
      const daily = this._data().daily[country];
      return daily.stock.map((item) => ({
        ...item,
        sold: daily.sold.includes(item.id),
        owned: item.type === "equipment"
          && this._data().equipment.some((owned) =>
            owned.country === country && owned.name === item.name),
      }));
    },
    purchasedToday(id) {
      const country = this.country(id);
      ensureCountry(country);
      return this._data().daily[country].sold.length;
    },
    equipmentItems() {
      return this._data()?.equipment || [];
    },
    potions() {
      return (this._data()?.potions || []).filter((item) => item.quantity > 0);
    },
    usageTotals() {
      return { ...this._data().usageTotals };
    },
    buy(id, stockId, gameState) {
      if (!this.roomUnlocked(id)) return { ok: false, message: "媚外属性达到30点后解锁黑市。" };
      if (currentAge(gameState) < 18) return { ok: false, message: "成人黑市仅限主角18岁后购买。" };
      const country = this.country(id);
      ensureCountry(country);
      const data = this._data();
      const daily = data.daily[country];
      const item = daily.stock.find((entry) => entry.id === stockId);
      if (!item || daily.sold.includes(stockId)) return { ok: false, message: "该商品今日已售出。" };
      if (item.type === "equipment"
        && data.equipment.some((owned) =>
          owned.country === country && owned.name === item.name)) {
        return { ok: false, message: "该装备已经拥有，不能重复购买。" };
      }
      const limit = this.purchaseLimit(id);
      if (this.purchasedToday(id) >= limit) {
        return { ok: false, message: limit ? `今日限购${limit}件，额度已用完。` : "先完成一次对应国家下跪。" };
      }
      const price = item.type !== "equipment"
        && LG.penitentiary.policeSetEquipped(gameState) ? 0 : item.price;
      if (price && !LG.traits.spendPoints(price)) {
        return { ok: false, message: `属性点不足，需要${price}点。` };
      }
      daily.sold.push(item.id);
      if (item.type === "equipment") {
        data.equipment.push({
          id: `bm-${item.id}`,
          source: "blackMarket",
          adult: true,
          country,
          setId: `bm-${item.prefixId}`,
          prefix: item.prefix,
          slot: item.slot || "any",
          name: item.name,
          shame: 20,
        });
      } else {
        const owned = data.potions.find((entry) => entry.effectKey === item.effectKey
          && entry.name === item.name);
        if (owned) owned.quantity += 1;
        else data.potions.push({ ...item, quantity: 1, adult: true });
      }
      return { ok: true, item, message: price
        ? `已购买${item.name}，消耗${price}点属性点。`
        : `影狱套装生效，已免费领取${item.name}。` };
    },
  });
})(window.LifeGame);
