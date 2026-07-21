(function (LG) {
  const faiths = [
    ["lust", "色欲", "#d84b88", "所有商品价格减少50%。"],
    ["greed", "贪婪", "#d9a928", "所有任务道具奖励获得数量×2。"],
    ["envy", "嫉妒", "#42a66b", "魔气攻击时不掉人格，每秒败北+10。"],
    ["wrath", "愤怒", "#d54a3f", "魔气攻击时不掉人格，每秒败北+10。"],
    ["sloth", "懒惰", "#6677c8", "任务的败北与羞耻类收益×10。"],
    ["gluttony", "暴食", "#c06b35", "魔气攻击时不掉人格，每秒败北+10。"],
    ["pride", "傲慢", "#8c62d4", "魔气攻击时不掉人格，每秒败北+10。"],
  ].map(([id, name, color, effect]) => ({ id, name, color, effect }));
  const common = {
    id: "common", name: "通用魔纹法术书", color: "#b8c1ca",
    effect: "魔气攻击时不掉人格，每秒败北+100。",
  };
  const soulLore = {
    black: "灵魂已经被腐化，在魔纹贱畜眼里是毫无价值的残火。",
    cyan: "健康而充满活力，是魔纹贱畜最喜欢腐化的灵魂。",
    gold: "人格高尚的凡世圣人，只有以漫长岁月筹划的魔王才会接近。",
    rainbow: "古籍记载神明拥有彩色灵魂；金色仍只是善良人格的凡世顶点。",
  };
  LG.INFERNAL_CHURCH_DATA = {
    faiths,
    books: [common, ...faiths.map((item) => ({
      id: item.id,
      name: `${item.name}的魔纹法术书`,
      color: item.color,
      effect: item.effect,
    }))],
    soulLore,
    assets: {
      sanctuary: "./assets/generated/infernal-church-sanctuary.33f2c5bc.webp",
      priestess: "./assets/generated/infernal-church-priestess.6afa716d.webp",
    },
  };
})(window.LifeGame);
