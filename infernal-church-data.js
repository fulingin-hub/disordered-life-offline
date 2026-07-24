(function (LG) {
  const faiths = [
    ["lust", "色欲", "#d84b88", "所有商品价格减少50%。"],
    ["greed", "贪婪", "#d9a928", "所有任务道具奖励获得数量×2。"],
    ["envy", "嫉妒", "#42a66b", "魔气攻击时不掉人格，每秒败北值平衡+10。"],
    ["wrath", "愤怒", "#d54a3f", "魔气攻击时不掉人格，每秒败北值平衡+10。"],
    ["sloth", "懒惰", "#6677c8", "任务的败北与羞耻类收益×10。"],
    ["gluttony", "暴食", "#c06b35", "魔气攻击时不掉人格，每秒败北值平衡+10。"],
    ["pride", "傲慢", "#8c62d4", "魔气攻击时不掉人格，每秒败北值平衡+10。"],
  ].map(([id, name, color, effect]) => ({ id, name, color, effect }));
  const common = {
    id: "common", name: "通用魔纹法术书", color: "#b8c1ca",
    effect: "魔气攻击时不掉人格，每秒败北值平衡+100。",
  };
  const soulLore = {
    black: "现实世界本来就存在。天生恶种、主动拥抱恶意者可以拥有，是“人性本恶”的具象体现。",
    cyan: "现实世界绝大多数普通人的状态。它代表“人性本善”的可能性，不等于这个人永远善良，而是仍然拥有同情、克制、爱与选择善的能力。",
    gold: "极少数人才可能抵达。不是单纯“做好事很多”，而是经历欲望、苦难和诱惑后，依旧主动选择善。圣人、真正意义上的英雄可以拥有这种灵魂。",
    rainbow: "古籍描述神明拥有彩色灵魂；本轮颜色从彩虹七色池中随机锁定。",
  };
  const blackTruth = `黑色灵魂并不是七大欲留下的残渣。

它们是祂们的食粮。

黑色灵魂汇入魔界，供养七大欲；
七大欲因众生之恶而壮大，又将欲望重新投向人间。

欲望催生新的堕落。
堕落孕育新的黑色灵魂。
黑色灵魂再次回归祂们。

循循相生。

而某些在人间被尊称为“教会”的人，早已学会如何让这个循环变得更加高效。

——他们并不满足于等待灵魂自行堕落。`;
  const soulTiers = [
    { id: "black", color: "black", name: "黑色",
      title: "黑色灵魂——恶欲之魂", range: "累计人格 0-999",
      lore: soulLore.black, effect: "重开：败北值平衡+100、羞耻+100、属性点+1000。" },
    { id: "cyan", color: "cyan", name: "青色",
      title: "青色灵魂——凡人之魂", range: "累计人格 1000-9999",
      lore: soulLore.cyan, effect: "重开：人格值平衡+100、尊严+100、属性点+1000。" },
    { id: "gold", color: "gold", name: "金色",
      title: "金色灵魂——高贵之魂", range: "累计人格 1万-99999",
      lore: soulLore.gold,
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
    soulLore, blackTruth, soulTiers, soulColors,
    assets: {
      sanctuary: "./assets/generated/infernal-church-sanctuary.550ab617.webp",
      priestess: "./assets/generated/infernal-church-priestess.a0c2cd06.webp",
    },
  };
})(window.LifeGame);
