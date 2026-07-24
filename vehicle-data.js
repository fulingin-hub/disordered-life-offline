(function (LG) {
  const stores = {
    points: {
      label: "属性点", short: "属性点商城",
      copy: "食用美国庄园主特供饲料的精选品种，以及从地狱俱乐部引进的新品种。",
      rider: { male: "protagonistMaleLuxurySet", female: "protagonistFemaleLuxurySet" },
      outfit: "权贵奢华套装",
    },
    achievement: {
      label: "成就点", short: "成就点商城",
      copy: "意外捕获的唯一种。",
      rider: { male: "protagonistMaleSaintSet", female: "protagonistFemaleSaintSet" },
      outfit: "圣徒礼赞套装",
    },
    coupons: {
      label: "赎罪卷", short: "赎罪卷商城",
      copy: "黑狱公司制造。",
      rider: {
        male: "protagonistMalePenitentiaryPoliceSet",
        female: "protagonistFemalePenitentiaryPoliceSet",
      },
      outfit: "黑狱套装",
    },
    personality: {
      label: "人格值", short: "人格值商城",
      copy: "由机构园区技术培育的神话生物。",
      rider: { male: "vehiclePersonalityMale", female: "vehiclePersonalityFemale" },
      outfit: "重甲骑士 / 皮甲骑士",
    },
    reputation: {
      label: "异界声望", short: "声望奖励",
      copy: "达到异界魔境声望里程碑后自动获得。",
      rider: { male: "protagonistMaleInfernalSet", female: "protagonistFemaleInfernalSet" },
      outfit: "恶魔的神秘套装",
    },
    champion: {
      label: "冠军奖状", short: "黄金都城冠军奖励",
      copy: "只能在六大势力角斗场的冠军奖状商城兑换。",
      rider: { male: "protagonistMaleLuxurySet", female: "protagonistFemaleLuxurySet" },
      outfit: "黄金都城远征装",
    },
  };
  const vipTiers = [
    ["青铜", 10000, 5], ["白银", 50000, 10], ["黄金", 100000, 15],
    ["钻石", 300000, 20], ["银钻", 500000, 25], ["金钻", 600000, 30],
    ["黑钻", 800000, 35], ["璀璨", 1000000, 40],
  ].map(([name, threshold, discount]) => ({ name, threshold, discount }));
  const colorNames = {
    black: "黑色", white: "白色", red: "红色", silver: "银色", gold: "金色",
  };
  const rideSkipBonus =
    "先锋协同时可跳过七层地狱小怪事件，直接面对本层Boss；跟随支援时不生效";
  const standardMountEffect = {
    title: "直面首领",
    bonuses: [rideSkipBonus],
  };
  const achievementMountEffect = {
    title: "异界魔境祝福",
    bonuses: [
      "七层地狱/深渊事件胜利：属性点 +500、人格值 +1000",
      "每完成一轮挑战：属性点 +500、人格值 +500",
      "任务奖励 ×3，可与当前套装效果乘法叠加",
      rideSkipBonus,
    ],
  };
  const otherworldMountEffect = {
    title: "异界通行",
    bonuses: [rideSkipBonus],
  };
  const reputationMountEffects = {
    wolf: {
      title: "血色狼王祝福",
      bonuses: [
        "七层地狱/深渊事件胜利：声望 +10、属性点 +200、人格值 +500",
        "完整一轮挑战：属性点 +6000、人格值 +6000",
        "获得的声望值 ×3，可与套装效果叠加",
        rideSkipBonus,
      ],
    },
    tiger: {
      title: "血色虎王祝福",
      bonuses: [
        "七层地狱/深渊事件胜利：声望 +50、属性点 +500、人格值 +1000",
        "完整一轮挑战：属性点 +8000、人格值 +8000",
        "获得的声望值 ×3，可与套装效果叠加",
        rideSkipBonus,
      ],
    },
    dragon: {
      title: "血色龙王祝福",
      bonuses: [
        "七层地狱/深渊事件胜利：声望 +100、属性点 +1000、人格值 +1500",
        "完整一轮挑战：属性点 +10000、人格值 +10000",
        "获得的任务奖励 ×3，可与套装效果叠加",
        rideSkipBonus,
      ],
    },
  };
  const items = [];

  function variants(store, family, names, price, asset, tier) {
    names.forEach(([tone, label]) => items.push({
      id: `${store}-${family}-${tone}`, store, family, tone,
      name: `${colorNames[tone]}${label}`, price, asset, tier,
      effect: standardMountEffect, skipMobsOnRide: true,
      note: "先锋协同时可跳过小怪事件直面Boss；跟随支援时不生效。",
    }));
  }

  variants("points", "horse",
    [["black", "马"], ["white", "马"], ["red", "马"]], 10000, "vehicleHorse", 1);
  variants("points", "wolf",
    [["black", "狼"], ["silver", "狼"], ["red", "狼"]], 50000, "vehicleWolf", 2);
  variants("points", "tiger",
    [["gold", "虎"], ["white", "虎"], ["red", "虎"]], 100000, "vehicleTiger", 3);
  items.push(
    {
      id: "points-otherworld-male", store: "points", family: "otherworld",
      tone: "base", name: "异界公畜", price: 0, rewardOnly: true,
      asset: "vehicleOtherworldMale", tier: 4, effect: otherworldMountEffect, skipMobsOnRide: true,
      note: "魔气入脑过度产生的特殊产物，但很意外的深受贵族与上层人士们的喜欢，供不应求。",
      unlockText: "完成魔纹教会周常或成功攻打圣光教团1次后获得。",
    },
    {
      id: "points-otherworld-female", store: "points", family: "otherworld",
      tone: "base", name: "异界母畜", price: 0, rewardOnly: true,
      asset: "vehicleOtherworldFemale", tier: 4, effect: otherworldMountEffect, skipMobsOnRide: true,
      note: "魔气入脑过度产生的特殊产物，但很意外的深受贵族与上层人士们的喜欢，供不应求。",
      unlockText: "成功攻打圣光教团累计10次后获得。",
    },
    {
      id: "achievement-lost-griffin", store: "achievement", family: "griffin",
      tone: "base", name: "迷失方向的狮鹫", price: 500,
      asset: "vehicleLostGriffin", tier: 1,
      effect: achievementMountEffect, skipMobsOnRide: true,
      note: "异界奖励与任务奖励×3；先锋协同时可跳过小怪直面Boss。",
    },
    {
      id: "achievement-reborn-phoenix", store: "achievement", family: "phoenix",
      tone: "base", name: "涅槃重生的玄凤", price: 500,
      asset: "vehicleRebornPhoenix", tier: 1,
      effect: achievementMountEffect, skipMobsOnRide: true,
      note: "异界奖励与任务奖励×3；先锋协同时可跳过小怪直面Boss。",
    },
    {
      id: "reputation-blood-wolf", store: "reputation", family: "blood-wolf",
      tone: "base", name: "魔境的血色狼王", price: 0,
      asset: "vehicleBloodWolf", tier: 1, rewardAt: 1500,
      effect: reputationMountEffects.wolf, skipMobsOnRide: true,
      note: "声望达到1500点获得；先锋协同时可跳过小怪直面Boss。",
    },
    {
      id: "reputation-blood-tiger", store: "reputation", family: "blood-tiger",
      tone: "base", name: "魔境的血色虎王", price: 0,
      asset: "vehicleBloodTiger", tier: 2, rewardAt: 2000,
      effect: reputationMountEffects.tiger, skipMobsOnRide: true,
      note: "声望达到2000点获得；先锋协同时可跳过小怪直面Boss。",
    },
    {
      id: "reputation-blood-trex", store: "reputation", family: "blood-dragon",
      tone: "base", name: "魔境的血色龙王", price: 0,
      asset: "vehicleBloodDragon", tier: 3, rewardAt: 3000,
      effect: reputationMountEffects.dragon, skipMobsOnRide: true,
      note: "声望达到3000点获得；先锋协同时可跳过小怪直面Boss。",
    },
    {
      id: "champion-salukas-sky-dragon", store: "champion",
      family: "salukas-sky-dragon", tone: "base",
      name: "萨卢卡斯的天空龙", price: 100000,
      asset: "vehicleSalukasSkyDragon", tier: 5, followOnly: true,
      effect: {
        title: "无视地形",
        bonuses: ["萨卢卡斯每日挑战选错门时不会失败", "天空龙只能跟随支援"],
      },
      note: "冠军奖状商城限定战斗伙伴；无视萨卢卡斯地形与错误界门。",
    },
  );
  [
    ["shadow-bike", "影狱摩托", 100000, "vehicleShadowMotorcycle", ["black", "red", "gold"]],
    ["mech-horse", "机械战马", 200000, "vehicleMechHorse", ["black", "silver", "red"]],
    ["mech-tiger", "机械战虎", 400000, "vehicleMechTiger", ["black", "silver", "red"]],
    ["mech-trex", "机械霸王龙", 600000, "vehicleMechTrex", ["black", "silver", "red"]],
  ].forEach(([family, label, price, asset, tones], index) =>
    variants("coupons", family, tones.map((tone) => [tone, label]),
      price, asset, index + 1));
  [
    ["unicorn", "独角兽", 400000, "vehicleUnicorn"],
    ["pegasus", "神界天马", 600000, "vehiclePegasus"],
    ["heaven-dragon", "八部天龙", 800000, "vehicleHeavenDragon"],
    ["xuanwu", "镇域玄武", 1000000, "vehicleXuanwu"],
  ].forEach(([family, label, price, asset], index) =>
    variants("personality", family,
      ["white", "gold", "black"].map((tone) => [tone, label]),
      price, asset, index + 1));

  LG.VEHICLE_DATA = {
    stores, vipTiers, items,
    byId: Object.fromEntries(items.map((item) => [item.id, item])),
  };
})(window.LifeGame);
