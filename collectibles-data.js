(function (LG) {
  const characters = [
    ["qin", "秦牧"], ["lin", "林岚"], ["su", "苏菲"], ["shen", "沈静秋"],
    ["reina", "高桥玲奈"], ["miki", "佐藤美纪"], ["mari", "沈崎真理"],
    ["evelyn", "伊芙琳·哈特"], ["claire", "克莱尔·摩根"],
    ["ruth", "露丝·卡特"], ["qinghe", "清和"], ["ciyun", "慈云"],
    ["agnes", "艾格尼丝"], ["restaurantCouple", "周启明与罗雯"],
    ["agencyCouple", "杜衡与许曼"], ["kaori", "黑田香织"],
    ["victoria", "维多利亚·海斯"], ["streetThug", "女混混"],
    ["beggar", "女乞丐"],
  ];
  const templates = [
    ["丝袜", "标志性的职业丝袜，仅作为虚构成年人房间收藏展示。"],
    ["擦鞋布", "留有角色风格印记的鞋履护理布，象征足边规则与服从。"],
    ["高跟鞋", "用于虚构成年人角色扮演的标志性鞋履收藏。"],
    ["圣水瓶", (name) => `装着圣水的瓶子，带着${name}的味道。`],
    ["黄金盆", (name) => `装着黄金的盆，带着${name}的味道。`],
  ];
  const tributeCatalog = {
    streetThug: [
      ["贡金凭证", "记录贡金关系与首个里程碑的虚构凭证。", 100],
      ["臭袜子", "女混混留在房间收藏柜中的旧袜子。", 200],
      ["臭内裤", "女混混专属房间中的成人衣物收藏。", 300],
      ["臭鞋", "女混混淘汰下来的旧鞋，作为贡金房间收藏展示。", 500],
      ["擦脚布", "女混混用过的旧布巾，作为贡金里程碑收藏展示。", 600],
    ],
    beggar: [
      ["贡金凭证", "记录贡金关系与首个里程碑的虚构凭证。", 100],
      ["臭袜子", "女乞丐留在房间收藏柜中的旧袜子。", 200],
      ["臭内裤", "女乞丐专属房间中的成人衣物收藏。", 300],
      ["臭鞋", "女乞丐换下的旧鞋，作为贡金房间收藏展示。", 500],
      ["擦脚布", "女乞丐留下的旧布巾，作为贡金里程碑收藏展示。", 600],
    ],
  };

  LG.COLLECTIBLE_CHARACTERS = Object.fromEntries(characters.map(([id, name]) =>
    [id, { id, name }]));
  LG.COLLECTIBLE_CATALOG = Object.fromEntries(characters.map(([id, name]) => [
    id,
    (tributeCatalog[id] || templates).map(([item, description, unlockAt], index) => ({
      id: `${id}-${index + 1}`,
      character: id,
      name: `${name}的${item}`,
      description: typeof description === "function" ? description(name) : description,
      price: tributeCatalog[id] ? 0 : 20,
      source: tributeCatalog[id] ? "tribute" : "shop",
      unlockAt: unlockAt || 0,
    })),
  ]));
})(window.LifeGame);
