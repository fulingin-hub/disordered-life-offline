(function (LG) {
  const kinds = {
    water: { label: "美味圣水", container: "圣水瓶", amount: -10 },
    gold: { label: "黄金圣餐", container: "黄金盆", amount: -20 },
  };
  const tributePrices = { water: 40, gold: 80 };
  const tributeRequirement = 600;

  function characterName(character) {
    return LG.COLLECTIBLE_CHARACTERS[character]?.name || "";
  }

  function ownsContainer(character, kind) {
    const target = kinds[kind]?.container;
    const item = LG.collectibles.items(character)
      .find((entry) => entry.name.endsWith(target));
    return Boolean(item && LG.collectibles.owns(item.id));
  }

  function usage(character) {
    const value = LG.blackMarket._data()?.roomUsage?.[character];
    return {
      water: Math.max(0, Math.floor(Number(value?.water) || 0)),
      gold: Math.max(0, Math.floor(Number(value?.gold) || 0)),
    };
  }

  function makeItem(character, kind) {
    const meta = kinds[kind];
    const tribute = LG.tribute.isCharacter(character);
    const purchaseUnlocked = !tribute || LG.tribute.points(character) >= tributeRequirement;
    const discounted = !tribute && ownsContainer(character, kind);
    const effectKey = `room-${character}-${kind}`;
    const owned = LG.blackMarket._data().potions.find((item) => item.effectKey === effectKey);
    return {
      id: `room-potion-${character}-${kind}`,
      roomCharacter: character,
      country: "room",
      source: "room",
      type: "potion",
      specialKind: kind,
      effectKey,
      name: `${characterName(character)}的${meta.label}`,
      stat: "health",
      amount: meta.amount,
      description: `健康${meta.amount}；库存充足时可重复食用。`,
      price: tribute ? tributePrices[kind]
        : discounted ? 1 : LG.blackMarketPotions.roomPrice(kind),
      tribute,
      purchaseUnlocked,
      tributeRequirement,
      discounted,
      container: meta.container,
      quantity: Math.max(0, Math.floor(Number(owned?.quantity) || 0)),
      used: usage(character)[kind],
    };
  }

  LG.roomConsumables = {
    available(character) {
      return Boolean(characterName(character))
        && !LG.blackMarket.isCharacter(character)
        && LG.achievements.isUnlocked(character);
    },
    items(character) {
      return Object.keys(kinds).map((kind) => makeItem(character, kind));
    },
    usage,
    qualifiesForAddress(character) {
      const total = usage(character);
      return total.water > 10 && total.gold > 10;
    },
    buy(character, kind) {
      if (!this.available(character) || !kinds[kind]) {
        return { ok: false, message: "当前角色房间暂不提供私密餐饮。" };
      }
      const item = makeItem(character, kind);
      if (!item.purchaseUnlocked) {
        return { ok: false, message: `该贡金角色累计贡金达到${tributeRequirement}点后开放购买。` };
      }
      if (!LG.traits.spendPoints(item.price)) {
        return { ok: false, message: `属性点不足，需要${item.price}点。` };
      }
      const potions = LG.blackMarket._data().potions;
      const owned = potions.find((entry) => entry.effectKey === item.effectKey);
      if (owned) owned.quantity += 1;
      else potions.push({ ...item, quantity: 1, adult: true });
      return {
        ok: true,
        item,
        message: `已购买${item.name}，消耗${item.price}点属性点。`,
      };
    },
  };
})(window.LifeGame);
