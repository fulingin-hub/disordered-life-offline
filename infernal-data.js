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
  };
})(window.LifeGame);
