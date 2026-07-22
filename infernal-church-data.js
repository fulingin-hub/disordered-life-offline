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
    black: "灵魂已经被腐化，在魔纹使徒眼里是毫无价值的垃圾。",
    cyan: "健康且充满活力，是魔纹使徒最喜欢腐化的存在。",
    gold: "人格高尚的存在，凡世的圣人。魔纹使徒一般不会轻易暴露在其眼皮下。",
    rainbow: "古籍描述神明拥有彩色灵魂；本轮颜色从彩虹七色池中随机锁定。",
  };
  const soulTiers = [
    { id: "black", color: "black", name: "黑色", range: "累计人格 0-999",
      lore: soulLore.black, effect: "重开：败北+100、羞耻+100、属性点+1000。" },
    { id: "cyan", color: "cyan", name: "青色", range: "累计人格 1000-9999",
      lore: soulLore.cyan, effect: "重开：人格+100、尊严+100、属性点+1000。" },
    { id: "gold", color: "gold", name: "金色", range: "累计人格 1万-99999",
      lore: `${soulLore.gold}只有以千百万年为筹划的魔王，才可能让圣人堕落。`,
      effect: "重开：除败北、羞耻外的所有属性各+5000。" },
  ];
  const soulColors = [
    ["red", "红", "所有任务中除败北、羞耻外的属性类奖励×10。"],
    ["orange", "橙", "所有任务的道具奖励数量×2。"],
    ["yellow", "黄", "所有商品购买价格减少50%。"],
    ["green", "绿", "本轮遭受魔气攻击时，前1200秒不掉人格值。"],
    ["blue", "蓝", "本轮遭受魔气攻击时，前1800秒不掉人格值。"],
    ["silver", "银", "本轮遭受魔气攻击时，前3600秒不掉人格值。"],
    ["purple", "紫", "本轮遭受魔气攻击时，前600秒不掉人格值。"],
  ].map(([id, name, effect]) => ({ id, name, effect }));
  LG.INFERNAL_CHURCH_DATA = {
    faiths,
    books: [common, ...faiths.map((item) => ({
      id: item.id,
      name: `${item.name}的魔纹法术书`,
      color: item.color,
      effect: item.effect,
    }))],
    soulLore, soulTiers, soulColors,
    assets: {
      sanctuary: "./assets/generated/infernal-church-sanctuary.550ab617.webp",
      priestess: "./assets/generated/infernal-church-priestess.a0c2cd06.webp",
    },
  };
})(window.LifeGame);
