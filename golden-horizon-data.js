(function (LG) {
  const gates = [
    ["moon", "月之门"], ["sun", "日之门"], ["earth", "土之门"],
    ["metal", "金之门"], ["water", "水之门"], ["wood", "木之门"],
    ["fire", "火之门"],
  ].map(([id, name]) => ({ id, name }));
  const maps = {
    "mist-forest": ["迷雾森林", "木之门", "树影会改变来路的方向。"],
    "primeval-swamp": ["原始沼泽", "水之门", "古老水脉吞没错误的脚印。"],
    "barren-desert": ["贫瘠沙漠", "金之门", "沙丘下埋着旧时代的矿道。"],
    "abandoned-plain": ["荒废平原", "土之门", "废弃路标仍指向两界边境。"],
    "scorching-volcano": ["炙热火山", "日之门", "熔岩照亮唯一可通行的山脊。"],
    "desolate-snowfield": ["荒凉雪原", "月之门", "月光会在雪幕中留下安全线。"],
    "blazing-sea": ["赤炎火海", "火之门", "隐藏地图，火浪会吞没迟疑者。"],
    "frozen-hell": ["极冰地狱", "水之门", "隐藏地图，寒冰封存失败者的回声。"],
    "endless-mountains": ["无尽群山", "土之门", "隐藏地图，山路会不断折回自身。"],
    "black-iron-forest": ["黑铁石林", "金之门", "隐藏地图，铁石会干扰方向感。"],
    "ancient-forest": ["远古森林", "木之门", "隐藏地图，古树只认可完整的路线。"],
    "fallen-land": ["陨落之地", "日之门", "隐藏地图，天空仍燃烧着旧日余烬。"],
    "despair-plain": ["绝望平原", "月之门", "隐藏地图，沉默会放大每一次犹豫。"],
  };
  const arenas = LG.GOLDEN_ARENA_DATA.arenas;
  const setPieces = [
    ["salukas-crown", "萨卢卡斯远望冠",
      "最初没有门也没有路只有一个念头想让失序拥有可以选择的人生"],
    ["salukas-coat", "萨卢卡斯开拓大衣",
      "一个旅人把念头披成天地另一个旅人替天地记下边界与方向"],
    ["salukas-gloves", "萨卢卡斯引路手套",
      "一双手不断提出新的可能另一双手把每个愿望整理成能够运行的规则"],
    ["salukas-belt", "萨卢卡斯商旅腰带",
      "世界越长越大两位旅人便用约定束住彼此不让故事在岔路中散失"],
    ["salukas-boots", "萨卢卡斯越境长靴",
      "他们踏过最后一道界门没有留下真名只在金色地平线上刻下斯与卡"],
  ];
  const collectibles = [
    ["moon-frost", "月门霜晶",
      "霜晶背面反复出现神界语卢古籍认为它可能接近凡世语中的有"],
    ["sun-ember", "日门余烬",
      "余烬灼痕组成神界语萨边境学者猜测它可能描述碰触与相遇"],
    ["earth-tablet", "土门路碑",
      "石碑上有些模糊的词看起来像是两个小孩一起刻下的Salut旧大陆语言学者说那是一句亲近的问候发音近似萨卢"],
    ["metal-ore", "金门黑矿",
      "黑矿内部刻着卡的旧商记像是有人先想到了黄金都城"],
    ["water-pearl", "水门古珠",
      "古珠映出斯整理门路的背影每条路线都像经过无数次校正"],
    ["wood-seed", "木门远古种",
      "种壳记载世界并非一次长成而是在一句句愿望中不断抽枝"],
    ["fire-crystal", "火门赤晶",
      "赤晶保存着两个声音一个负责追问还有什么另一个回答可以做到"],
    ["fog-compass", "迷雾罗盘",
      "罗盘边缘写着萨卢卡斯也许不是姓名而是一句被误读的神界语"],
    ["swamp-amber", "沼泽琥珀",
      "琥珀封存两枚重叠指纹没人知道哪一枚先触碰了这片世界"],
    ["desert-hourglass", "沙漠时漏",
      "时漏每翻转一次就多出一条规则仿佛世界仍在被悄悄修订"],
    ["plain-banner", "平原残旗",
      "残旗只有半句让想象先行让秩序随后"],
    ["volcano-glass", "火山琉璃",
      "火山琉璃倒映出两名看不清面容的同行者正争论下一扇门"],
    ["snowfield-bell", "雪原银铃",
      "银铃只在新故事诞生时作响因此从来没有真正安静过"],
  ];
  const exchanges = [
    ["supplies", "黄金都城补给箱", 100, "兑换1000属性点，可重复购买。"],
    ["route-map", "两界航路图", 500, "永久收藏斯整理的完整航路。"],
    ["peace-medal", "和平贸易勋章", 1500, "成为黄金都城首批认证开拓者。"],
  ].map(([id, name, cost, text]) => ({ id, name, cost, text }));
  const professions = [
    {
      id: "gate-arbiter", name: "界门裁定官", guide: "斯",
      portrait:
        "./assets/generated/career-gate-arbiter-mounted.f6a73b2d.webp",
      equipment: "界律裁定甲 · 七门罗盘冠 · 折界裁决杖",
      vehicle: "专属坐骑：折光獬豸 · 可沿七道界门进行短距折跃巡航。",
      requirement: "与斯成功通过7次试炼，并持有两界航路图。",
      effect: "每周第一次选错门时自动修正路线，保住七日全通资格。",
    },
    {
      id: "golden-frontier-lord", name: "黄金开拓领主", guide: "卡",
      portrait:
        "./assets/generated/career-golden-frontier-lord-mounted.d7c6440a.webp",
      equipment: "黄金开拓大衣 · 商旅领主护臂 · 地平线旗枪",
      vehicle: "专属载具：黄金陆行舰“开拓一号” · 携带移动商栈与勘路仪。",
      requirement: "与卡成功通过7次试炼，并持有和平贸易勋章。",
      effect: "与卡同行成功时，额外获得1000属性点与100商行点数。",
    },
  ];
  const socialChoices = [
    ["trust-si", "相信斯的隐藏任务"],
    ["follow-ka", "跟卡去真正淘金"],
    ["sock-club", "袜子也是稀有收藏"],
    ["real-gold", "我只接受真金"],
  ].map(([id, name]) => ({ id, name }));
  const characters = {
    si: {
      name: "斯", role: "两界航路记录官", image: "goldenHorizonSi",
      copy: "相信规律与可验证的记录。同行时会明确标记安全门，奖励稳定。",
    },
    ka: {
      name: "卡", role: "黄金都城开拓商", image: "goldenHorizonKa",
      copy: "相信判断与行动的价值，同行成功时奖励更高。",
    },
  };
  const tavernResidents = LG.goldenHorizonResidents.all;
  LG.GOLDEN_HORIZON_DATA = {
    gates, maps, arenas, setPieces, collectibles, exchanges, professions,
    socialChoices, characters, tavernResidents,
    gate(id) { return gates.find((item) => item.id === id); },
    map(id) {
      const item = maps[id] || ["未知地图", "未知门", "道路仍未被记录。"];
      return { id, name: item[0], gate: item[1], text: item[2] };
    },
  };
})(window.LifeGame);
