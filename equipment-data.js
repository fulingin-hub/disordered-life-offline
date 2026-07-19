(function (LG) {
  LG.EQUIPMENT_SLOTS = [
    { id: "head", label: "头部" },
    { id: "body", label: "身部" },
    { id: "crotch", label: "裆部" },
    { id: "hands", label: "手部" },
    { id: "feet", label: "脚部" },
  ];

  LG.EQUIPMENT_SETS = [
    {
      id: "discipline",
      prefix: "规训",
      trait: "control",
      names: {
        head: "覆眼饰",
        body: "高领制服",
        crotch: "束带",
        hands: "皮手套",
        feet: "长靴",
      },
    },
    {
      id: "tribute",
      prefix: "贡礼",
      trait: "tribute",
      names: {
        head: "金属额饰",
        body: "礼仪外套",
        crotch: "腰封",
        hands: "献礼腕饰",
        feet: "漆皮鞋",
      },
    },
    {
      id: "foreign",
      prefix: "异域",
      trait: "foreign",
      names: {
        head: "身份发饰",
        body: "翻领制服",
        crotch: "身份腰带",
        hands: "白手套",
        feet: "长袜靴",
      },
    },
    {
      id: "devotion",
      prefix: "足下",
      trait: "feet",
      names: {
        head: "低檐帽",
        body: "侍从服",
        crotch: "缎面腰封",
        hands: "服侍护腕",
        feet: "黑色长袜",
      },
    },
    {
      id: "realm-hunter",
      prefix: "异界的",
      separator: "",
      unlockReputation: {
        head: 100, body: 200, hands: 300, crotch: 400, feet: 500,
      },
      names: {
        head: "猎人隐蔽头带",
        body: "猎人隐蔽皮甲",
        hands: "猎人多功能腰带",
        crotch: "猎人隐蔽皮裤",
        feet: "猎人隐蔽皮靴",
      },
    },
    {
      id: "realm-black-knight",
      prefix: "魔境的",
      separator: "",
      unlockReputation: {
        head: 600, body: 700, hands: 800, crotch: 900, feet: 1000,
      },
      names: {
        head: "黑骑重甲头盔",
        body: "黑骑重甲胸凯",
        hands: "黑骑重甲腰带",
        crotch: "黑骑重甲护腿",
        feet: "黑骑重甲铁靴",
      },
    },
  ];

  LG.EQUIPMENT_ITEMS = LG.EQUIPMENT_SETS.flatMap((set) =>
    LG.EQUIPMENT_SLOTS.map((slot, index) => ({
      id: `${set.id}-${slot.id}`,
      setId: set.id,
      prefix: set.prefix,
      slot: slot.id,
      name: `${set.prefix}${set.separator ?? "·"}${set.names[slot.id]}`,
      shame: 20,
      unlockTrait: set.trait,
      unlockAt: set.unlockReputation?.[slot.id] || (index + 1) * 20,
      unlockReputation: set.unlockReputation?.[slot.id] || 0,
    })));
})(window.LifeGame);
