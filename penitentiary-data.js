(function (LG) {
  const portraits = [
    "shadowPrisonSupervisor", "shadowPrisonManager", "shadowPrisonInstructor",
    "shadowPrisonWarden", "shadowPrisonOwner",
  ].map((id) => LG.CONFIG.assets[id]);
  const roles = [
    ["penitentiarySupervisor", "顾寒霜", "影狱女监督者", 40, 0, 0],
    ["penitentiaryManager", "北条绫", "影狱女管理者", 80, 200, 200],
    ["penitentiaryInstructor", "维拉·科瓦奇", "影狱女教官", 160, 400, 400],
    ["penitentiaryWarden", "塞西莉亚·格兰特", "影狱女监狱长", 200, 800, 800],
    ["penitentiaryOwner", "伊莎贝拉·诺克斯", "影狱幕后女老板", 250, 1000, 1000],
  ].map(([id, name, role, price, lifetime, spend], index) => ({
    id, name, role, price, lifetime, spend, stage: index + 1, portrait: portraits[index],
    certificate: `${id}-certificate`,
  }));
  const regular = [
    ["dirty-underwear", "脏内裤", "角色商店收录的虚构成人私人物品。"],
    ["smelly-stockings", "臭丝袜", "影狱长时间执勤后封存的制服收藏。"],
    ["smelly-shoes", "臭鞋子", "任务发布者替换下来的旧制式鞋。"],
    ["smelly-insoles", "臭鞋垫", "旧鞋中封存的个人收藏品。"],
  ];
  const outfitNames = [
    "人格丧志头套", "人格丧志皮制束缚衣", "人格丧志手铐",
    "人格丧志脚铐", "人格丧志按摩器",
  ];
  const consumables = [
    ["holy-water", "美味圣水", "健康 -10，可重复购买与饮用。"],
    ["golden-sacrament", "黄金圣餐", "健康 -20，可重复购买与饮用。"],
    ["despair-drug", "丧志药物", "自主 -15，每轮人生限饮一次。"],
  ];
  roles.forEach((character, index) => {
    character.items = regular.map(([suffix, name, description]) => ({
      id: `${character.id}-${suffix}`, name: `${character.name}的${name}`,
      description, price: character.price, type: "regular",
    }));
    character.items.push({
      id: character.certificate, name: `被${character.name}认可的奖状`,
      description: "可装备的影狱套装部件；同时解锁人物画廊、AI对话和特殊任务。",
      price: character.price, type: "certificate",
    });
    character.consumables = consumables.map(([suffix, name, description]) => ({
      id: `${character.id}-${suffix}`, name: `${character.name}的${name}`,
      description, price: 500, type: "consumable", repeatable: true,
    }));
    character.outfit = {
      id: `penitentiary-outfit-${["head", "body", "hands", "feet", "device"][index]}`,
      name: `影狱的${outfitNames[index]}`, price: 1000, type: "outfit",
      description: "获得该角色奖状后开放。集齐五件并首次装备时触发人格毁灭结局；穿戴后套装跨人生显示。来自无尽的欲望：羞耻度直接达到满值250点。",
    };
  });
  LG.PENITENTIARY_DATA = {
    roles, byId: Object.fromEntries(roles.map((item) => [item.id, item])),
    requirements: { zeroedPoints: 50, edenPurchases: 10 },
    prices: { item: 500, premium: 1000, chat: 200, chatPremium: 400 },
    endingId: "penitentiary-personality-destroyed",
  };
})(window.LifeGame);
