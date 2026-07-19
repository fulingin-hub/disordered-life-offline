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
  };
  const vipTiers = [
    ["青铜", 10000, 5], ["白银", 50000, 10], ["黄金", 100000, 15],
    ["钻石", 300000, 20], ["银钻", 500000, 25], ["金钻", 600000, 30],
    ["黑钻", 800000, 35], ["璀璨", 1000000, 40],
  ].map(([name, threshold, discount]) => ({ name, threshold, discount }));
  const colorNames = {
    black: "黑色", white: "白色", red: "红色", silver: "银色", gold: "金色",
  };
  const achievementMountEffect = {
    title: "异界魔境祝福",
    bonuses: [
      "七层地狱/深渊事件胜利：属性点 +500、人格值 +1000",
      "每完成一轮挑战：属性点 +500、人格值 +500",
      "任务奖励 ×3，可与当前套装效果乘法叠加",
      "挑战七层地狱时自动跳过全部小怪事件",
    ],
  };
  const items = [];

  function variants(store, family, names, price, asset, tier) {
    names.forEach(([tone, label]) => items.push({
      id: `${store}-${family}-${tone}`, store, family, tone,
      name: `${colorNames[tone]}${label}`, price, asset, tier,
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
      tone: "base", name: "异界公畜", price: 5000, asset: "vehicleOtherworldMale", tier: 4,
      note: "在异界是最常见的载具，不值钱。",
    },
    {
      id: "points-otherworld-female", store: "points", family: "otherworld",
      tone: "base", name: "异界母畜", price: 5000, asset: "vehicleOtherworldFemale", tier: 4,
      note: "在异界是最常见的载具，不值钱。",
    },
    {
      id: "achievement-lost-griffin", store: "achievement", family: "griffin",
      tone: "base", name: "迷失方向的狮鹫", price: 500,
      asset: "vehicleLostGriffin", tier: 1,
      effect: achievementMountEffect,
      note: "异界事件胜利：属性点+500、人格值+1000；每轮完成再奖励属性点+500、人格值+500；任务奖励×3，可与套装叠加；七层地狱自动跳过小怪事件。",
    },
    {
      id: "achievement-reborn-phoenix", store: "achievement", family: "phoenix",
      tone: "base", name: "涅槃重生的玄凤", price: 500,
      asset: "vehicleRebornPhoenix", tier: 1,
      effect: achievementMountEffect,
      note: "异界事件胜利：属性点+500、人格值+1000；每轮完成再奖励属性点+500、人格值+500；任务奖励×3，可与套装叠加；七层地狱自动跳过小怪事件。",
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
