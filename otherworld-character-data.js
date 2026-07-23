(function (LG) {
  const baseItems = [
    ["dirty-underwear", "脏内裤", "她私人物品柜中封存的旧内裤。"],
    ["smelly-stockings", "臭丝袜", "完成长时间轮班后换下的黑丝袜。"],
    ["smelly-shoes", "臭鞋子", "工作与巡查时穿旧的鞋子。"],
    ["smelly-insoles", "臭鞋垫", "从常用鞋履中替换下来的鞋垫。"],
  ];
  const raw = [
    {
      id: "expoSaleswoman", name: "莉泽尔", role: "异界商行女销售",
      location: "万界战斗伙伴公会馆", host: "expo",
      portrait: "./assets/generated/otherworld-saleswoman-portrait.67e99d46.webp",
      gallery: "./assets/generated/gallery-otherworld-saleswoman.0cf54a9f.webp",
      special: ["private-room-card", "女销售的密室房卡",
        "体验一次女销售的特殊按摩。获得后坐骑成交价上涨10%。"],
      fee: "技术指导",
    },
    {
      id: "guildReceptionist", name: "米蕾娅", role: "异界冒险公会女接待",
      location: "临时阵地任务大厅", host: "infernal",
      portrait: "./assets/generated/otherworld-receptionist-portrait.ebc9209d.webp",
      gallery: "./assets/generated/gallery-otherworld-receptionist.692fafe9.webp",
      special: ["reception-basement-key", "女接待的地下室钥匙",
        "体验一次女接待的特殊按摩。获得后七层地狱悬赏击杀次数增加50%，奖励不变。"],
      fee: "购买情报",
    },
    {
      id: "guildManager", name: "维奥拉", role: "异界冒险公会女管理者",
      location: "临时阵地任务大厅", host: "infernal",
      portrait: "./assets/generated/otherworld-manager-portrait.2e5b5abd.webp",
      gallery: "./assets/generated/gallery-otherworld-manager.16d2f277.webp",
      special: ["manager-basement-key", "女管理者的地下室钥匙",
        "体验一次女管理者的特殊按摩。获得后无尽深渊悬赏击杀次数增加50%，奖励不变。"],
      fee: "装备保养",
    },
  ];
  const characters = raw.map((character) => ({
    ...character,
    price: 10000,
    items: [...baseItems, character.special].map(([suffix, name, description], index) => ({
      id: `${character.id}-${suffix}`,
      character: character.id,
      name: `${character.name}的${name}`,
      description,
      price: 10000,
      special: index === 4,
    })),
  }));

  LG.OTHERWORLD_CHARACTER_DATA = {
    characters,
    byId: Object.fromEntries(characters.map((item) => [item.id, item])),
  };
  LG.OTHERWORLD_CHARACTER_DIALOGUE = {
    characters: {
      expoSaleswoman: {
        name: "莉泽尔",
        fallback: ["账单写的是技术指导。至于你为何甘愿多付，那不属于售后范围。"],
      },
      guildReceptionist: {
        name: "米蕾娅",
        fallback: ["我只是温和地递交情报，十五次讨伐当然也是你自愿签收的。"],
      },
      guildManager: {
        name: "维奥拉",
        fallback: ["连装备保养费都要追问，你确实需要更多深渊任务来学会服从流程。"],
      },
    },
    rooms: {
      expoSaleswoman: {
        character: "expoSaleswoman", location: "万界博览会馆 · 异界商行",
        title: "密室账单之外",
        opener: "莉泽尔合上载具账册：“房卡已经生效，现在说说你还想购买什么指导。”",
      },
      guildReceptionist: {
        character: "guildReceptionist", location: "临时阵地 · 接待柜台",
        title: "地下室情报室",
        opener: "米蕾娅仍维持温和微笑：“钥匙归你，新增的五次讨伐也归你。”",
      },
      guildManager: {
        character: "guildManager", location: "临时阵地 · 管理办公室",
        title: "深渊维护账单",
        opener: "维奥拉敲了敲装备账单：“别浪费时间，十五次击杀不会替你完成自己。”",
      },
    },
  };
})(window.LifeGame);
