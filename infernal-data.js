(function (LG) {
  const layers = [
    ["greed", "贪婪", "infernalGreedWitch", "infernalGreedQueen"],
    ["lust", "色欲", "infernalLustWitch", "infernalLustQueen"],
    ["wrath", "愤怒", "infernalWrathWitch", "infernalWrathQueen"],
    ["sloth", "懒惰", "infernalSlothWitch", "infernalSlothQueen"],
    ["pride", "傲慢", "infernalPrideWitch", "infernalPrideQueen"],
    ["envy", "嫉妒", "infernalEnvyWitch", "infernalEnvyQueen"],
    ["gluttony", "暴食", "infernalGluttonyWitch", "infernalGluttonyQueen"],
  ].map(([id, name, witch, queen]) => ({
    id, name, witch, queen,
    mobTitle: `${name}地狱的魔女`,
    bossTitle: `支配·${name}地狱的女魔王`,
  }));

  LG.INFERNAL_DATA = {
    layers,
    byId: Object.fromEntries(layers.map((item) => [item.id, item])),
    access: { personality: 1000, ending: "saint" },
    reputationRewards: [
      {
        id: "realm-hunter", title: "异界猎人套装", kind: "equipment",
        rewards: [
          [100, "异界的猎人隐蔽头带"],
          [200, "异界的猎人隐蔽皮甲"],
          [300, "异界的猎人多功能腰带"],
          [400, "异界的猎人隐蔽皮裤"],
          [500, "异界的猎人隐蔽皮靴"],
        ],
      },
      {
        id: "realm-black-knight", title: "魔境黑骑套装", kind: "equipment",
        rewards: [
          [600, "魔境的黑骑重甲头盔"],
          [700, "魔境的黑骑重甲胸凯"],
          [800, "魔境的黑骑重甲腰带"],
          [900, "魔境的黑骑重甲护腿"],
          [1000, "魔境的黑骑重甲铁靴"],
        ],
      },
      {
        id: "realm-mounts", title: "血色魔境坐骑", kind: "vehicle",
        rewards: [
          [1500, "魔境的血色狼王"],
          [2000, "魔境的血色虎王"],
          [3000, "魔境的血色霸王龙"],
        ],
      },
    ],
  };
})(window.LifeGame);
