(function (LG) {
  const meta = LG.BLACK_MARKET_DATA;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const utcDate = () => LG.authority?.snapshot?.()?.serverDate
    || new Date().toISOString().slice(0, 10);
  const prefix = (country, id) => (country === "japan"
    ? meta.japanPrefixes : meta.usaPrefixes).find((item) => item.id === id);
  const effectText = (stat, amount) =>
    `${LG.CONFIG.statMeta[stat]}${amount > 0 ? "+" : ""}${amount}`;

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
      effectKey: `${country}-${template.id || guaranteed}`,
      description: `${effectText(template.stat, template.amount)}；每个人生限用一次同类药剂。`,
      guaranteed: Boolean(guaranteed),
    };
  }

  function usaStock(date) {
    const potions = Array.from({ length: 5 }, (_, index) =>
      potionFromTemplate("usa", date, index, pick(meta.usaPotions)));
    return [...potions, ...LG.blackMarketUSAEquipment.stock(date)];
  }

  function ensureCountry(country) {
    const state = LG.blackMarket._data();
    const date = utcDate();
    let changed = false;
    if (state.daily[country]?.date !== date) {
      state.daily[country] = {
        date,
        stock: country === "japan" ? equipmentStock(date) : usaStock(date),
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
      daily.stock = country === "japan" ? equipmentStock(key) : usaStock(key);
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
      if (!LG.traits.spendPoints(item.price)) {
        return { ok: false, message: `属性点不足，需要${item.price}点。` };
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
      return { ok: true, item, message: `已购买${item.name}，消耗${item.price}点属性点。` };
    },
    usePotion(itemId, gameState) {
      if (currentAge(gameState) < 18) return { ok: false, message: "成人道具仅限主角18岁后使用。" };
      if (gameState.endingId) return { ok: false, message: "本次人生已经结束，无法使用药剂。" };
      const data = this._data();
      const item = data.potions.find((entry) => entry.id === itemId && entry.quantity > 0);
      if (!item) return { ok: false, message: "药剂库存不足。" };
      const unlimitedSpecial = item.specialKind === "water" || item.specialKind === "gold";
      const used = Array.isArray(data.uses[gameState.runId]) ? data.uses[gameState.runId] : [];
      if (!unlimitedSpecial && used.includes(item.effectKey)) {
        return { ok: false, message: "本次人生已经使用过同类药剂。" };
      }
      const previous = Number(gameState.stats[item.stat]) || 0;
      const next = Math.max(0, Math.min(100, previous + item.amount));
      gameState.stats[item.stat] = next;
      item.quantity -= 1;
      const causedHealthZero = unlimitedSpecial && item.stat === "health" && previous > 0 && next === 0;
      LG.blackMarketPotions.recordUse(data, item, causedHealthZero);
      if (!unlimitedSpecial) {
        data.uses[gameState.runId] = [...used, item.effectKey];
        const runIds = Object.keys(data.uses);
        if (runIds.length > 40) runIds.slice(0, runIds.length - 40).forEach((id) => delete data.uses[id]);
      }
      return { ok: true, item, message: `已使用${item.name}：${effectText(item.stat, item.amount)}。` };
    },
  });
})(window.LifeGame);
