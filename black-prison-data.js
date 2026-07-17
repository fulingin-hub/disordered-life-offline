(function (LG) {
  const services = [
    ["waiter-table", "人形餐桌", "由成年侍者完成戏剧化餐桌服务。", 500, "waiter"],
    ["waiter-chair", "人形座椅", "由成年侍者完成戏剧化座椅服务。", 500, "waiter"],
    ["waiter-feeding", "专人喂食", "侍者全程完成分餐与喂食礼仪。", 500, "waiter"],
    ["chef-live", "让厨师现场制作", "开放米国、岛国与夏国的顶级厨师菜单。", 500, "chef"],
    ["materials-menu", "让侍者送来原材料", "开放三国成年人物类型与性别选择名录。", 500, "materials"],
  ];
  const rareFoods = [
    ["rare-fish-steak", "奇珍鱼排"],
    ["rare-eight-treasure", "奇珍八宝菜"],
    ["rare-sashimi", "奇珍生切"],
    ["rare-meat-steak", "奇珍肉排"],
    ["rare-rib", "奇珍肋排"],
  ].map(([id, name]) => [id, name, "首次食用，当前人生健康 +10。", 500, "rare"]);
  const demonFoods = [
    ["demon-usa-male", "米国男星汉堡排", "米国成年男明星主题菜单。", 1000],
    ["demon-usa-female", "米国女星肋排", "米国成年女明星主题菜单。", 1000],
    ["demon-island-male", "岛国男网红生切", "岛国成年男网红主题菜单。", 1500],
    ["demon-island-female", "岛国女网红生切", "岛国成年女网红主题菜单。", 1500],
    ["demon-xia-male", "夏国男性肉排", "夏国成年无证移民主题菜单。", 2000],
    ["demon-xia-female", "夏国女性火腿", "夏国成年无证移民主题菜单。", 2000],
  ].map(([id, name, description, price]) =>
    [id, name, description, price, "demon"]);
  const luxury = [
    ["luxury-head", "权贵头饰"],
    ["luxury-coat", "权贵大衣"],
    ["luxury-gloves", "权贵手套"],
    ["luxury-trousers", "权贵下装"],
    ["luxury-shoes", "权贵鞋履"],
  ].map(([id, name]) => [id, name, "奇珍幻想皮革制作的奢华单品。", 1000, "luxury"]);
  const infernal = [
    ["infernal-crown", "白骨仪式王冠"],
    ["infernal-underwear", "金黑仪式内衣"],
    ["infernal-briefs", "金黑仪式下装"],
    ["infernal-socks", "金黑仪式长袜"],
    ["infernal-gloves", "金黑仪式手套"],
  ].map(([id, name]) =>
    [id, name, "以人材为底，用皮蜕做丝绸，化血骨点缀，万物之灵长逆练而成形。", 2000, "infernal"]);

  function item(raw) {
    return {
      id: raw[0], name: raw[1], description: raw[2],
      price: raw[3], group: raw[4],
    };
  }

  const groups = {
    services: services.map(item),
    rare: rareFoods.map(item),
    demon: demonFoods.map(item),
    luxury: luxury.map(item),
    infernal: infernal.map(item),
  };
  const all = Object.values(groups).flat();

  LG.BLACK_PRISON_DATA = {
    groups,
    all,
    byId: Object.fromEntries(all.map((entry) => [entry.id, entry])),
    requirements: { lives: 100, lifetimePoints: 2000 },
    demonCountries: [
      { id: "usa", name: "米国明星", price: 1000 },
      { id: "island", name: "岛国网红", price: 1500 },
      { id: "xia", name: "夏国无证移民", price: 2000 },
    ],
    achievements: [
      ["black-prison-dominator", "支配者"],
      ["black-prison-feast", "山珍海味"],
      ["black-prison-apex", "站在食物链顶端"],
      ["black-prison-demon", "似恶魔般痴狂"],
      ["black-prison-luxury", "顶奢人生"],
      ["black-prison-infernal", "似来自地狱的恶魔"],
    ],
  };
})(window.LifeGame);
