(function (LG) {
  const kinds = {
    water: {
      label: "美味圣水", container: "圣水瓶", stat: "health",
      amount: -10, price: 20, repeatable: true,
    },
    gold: {
      label: "黄金圣餐", container: "黄金盆", stat: "health",
      amount: -20, price: 40, repeatable: true,
    },
    addictive: {
      label: "成瘾药剂", stat: "dependence", amount: 15,
      price: 20, seller: "evelyn", repeatable: false,
    },
  };
  const tributePrices = { water: 40, gold: 80 };
  const tributeRequirement = 600;
  const blackStreet = ["japanOfficial", "usaOfficial", "streetThug", "beggar"];

  function characterName(character) {
    return LG.COLLECTIBLE_CHARACTERS[character]?.name || "";
  }

  function ownsContainer(character, kind) {
    const target = kinds[kind]?.container;
    const item = LG.collectibles.items(character)
      .find((entry) => entry.name.endsWith(target));
    return Boolean(item && LG.collectibles.owns(item.id));
  }

  function usage(character, kind) {
    const value = LG.blackMarket._data()?.roomUsage?.[character];
    return Math.max(0, Math.floor(Number(value?.[kind]) || 0));
  }

  function makeItem(character, kind) {
    const meta = kinds[kind];
    const tribute = LG.tribute.isCharacter(character);
    const purchaseUnlocked = !tribute || LG.tribute.points(character) >= tributeRequirement;
    const discounted = !meta.seller && !tribute && ownsContainer(character, kind);
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
      stat: meta.stat,
      amount: meta.amount,
      description: meta.repeatable
        ? `健康${meta.amount}；库存充足时可重复饮用。`
        : `依赖+${meta.amount}；每轮人生限饮一次，恶魔神秘套装可额外饮用10次。`,
      price: LG.penitentiary.policeSetEquipped() && blackStreet.includes(character)
        ? 0 : meta.seller ? meta.price : tribute ? tributePrices[kind]
          : discounted ? 1 : LG.blackMarketPotions.roomPrice(kind),
      tribute,
      purchaseUnlocked,
      tributeRequirement,
      discounted,
      container: meta.container,
      quantity: Math.max(0, Math.floor(Number(owned?.quantity) || 0)),
      used: usage(character, kind),
    };
  }

  LG.roomConsumables = {
    available(character) {
      return Boolean(characterName(character))
        && !LG.blackMarket.isCharacter(character)
        && LG.achievements.isUnlocked(character);
    },
    items(character) {
      return Object.keys(kinds)
        .filter((kind) => !kinds[kind].seller || kinds[kind].seller === character)
        .map((kind) => makeItem(character, kind));
    },
    usage,
    qualifiesForAddress(character) {
      return usage(character, "water") > 10 && usage(character, "gold") > 10;
    },
    buy(character, kind) {
      if (!this.available(character) || !kinds[kind]
        || (kinds[kind].seller && kinds[kind].seller !== character)) {
        return { ok: false, message: "当前角色房间暂不提供该饮品。" };
      }
      const item = makeItem(character, kind);
      if (!item.purchaseUnlocked) {
        return { ok: false, message: `该贡金角色累计贡金达到${tributeRequirement}点后开放购买。` };
      }
      if (item.price && !LG.traits.spendPoints(item.price)) {
        return { ok: false, message: `属性点不足，需要${item.price}点。` };
      }
      const potions = LG.blackMarket._data().potions;
      const owned = potions.find((entry) => entry.effectKey === item.effectKey);
      if (owned) owned.quantity += 1;
      else potions.push({ ...item, quantity: 1, adult: true });
      return {
        ok: true,
        item,
        message: item.price
          ? `已购买${item.name}，消耗${item.price}点属性点。`
          : `影狱套装生效，已免费领取${item.name}。`,
      };
    },
  };
})(window.LifeGame);
