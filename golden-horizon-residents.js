(function (LG) {
  const residents = [
    ["tavernKeeper", "奥伦老板", "酒馆老板", "记得每一位常客的职业，也最爱讨论《黄金日报》的头条。", ["all"], [], 58],
    ["tavernCourier", "米娅", "两界信使", "刚从东部要塞回来，邮袋里总有未经刊印的消息。", ["morning", "day", "evening"], ["agent", "adventurer"], 34],
    ["tavernExplorer", "赫克托", "退役探索者", "更关心深渊远征与职业者，而不是贵族们的宴会。", ["evening", "night"], ["adventurer", "mercenary"], 67],
    ["tavernGateClerk", "伊莱亚斯", "界门轮值员", "下班后仍会把七道界门的通行异动记在杯垫背面。", ["day", "evening"], ["scholar", "agent"], 46],
    ["tavernAccountant", "诺拉", "商队账房", "替跨界商队核对货单，对异常价格和失踪货箱格外敏锐。", ["day", "evening"], ["engineer", "agent"], 51],
    ["tavernMedic", "赛琳", "角斗场医师", "结束夜班后会来喝热汤，只谈真实伤情与恢复进度。", ["evening", "night"], ["doctor", "gene"], 42],
    ["tavernHandler", "布兰", "异兽驯养员", "负责安置商旅坐骑，能从蹄印判断队伍来自哪条路。", ["morning", "evening"], ["mercenary", "adventurer"], 55],
    ["tavernRuneSmith", "塔维", "魔导器匠", "修理界门罗盘与机械载具，衣袖上常留着新鲜金属屑。", ["day", "night"], ["mechanic", "engineer"], 61],
    ["tavernArchivist", "闻溪", "大学档案员", "来核对旧大陆文献，习惯先确认来源再相信传闻。", ["morning", "day"], ["scholar", "cultivator"], 49],
    ["tavernPilgrim", "露西亚", "园区巡礼者", "往返机构园区与都城，关注仪式纪律和普通人的选择。", ["morning", "evening"], ["cultivator", "doctor"], 44],
    ["tavernQuartermaster", "露丝·卡特", "牧场补给官", "负责饲料、护具与远征口粮，对浪费物资的人毫不客气。", ["day", "evening"], ["mercenary", "gene"], 57],
    ["tavernBuyer", "阿黛尔", "乐园采购员", "替餐厅和时装店寻找稀有货源，擅长判断一笔交易是否体面。", ["evening", "night"], ["agent", "engineer"], 39],
    ["tavernBroker", "马可", "异域联邦掮客", "替家族商队撮合临时护送，不碰来路不明的违禁货物。", ["evening", "night"], ["assassin", "agent"], 53],
    ["tavernScout", "凯恩", "异界联盟斥候", "只在深夜现身，带来灰色地带外缘与深渊入口的可靠见闻。", ["night"], ["adventurer", "mechanic"], 48],
    ["tavernPrinter", "艾琳", "日报印刷工", "清晨交完报纸后短暂停留，知道哪些标题刚被撤下。", ["morning", "day"], ["scholar", "engineer"], 36],
  ].map(([id, name, role, intro, slots, professions, baseAge]) => ({
    id, name, role, intro, slots, professions, baseAge,
  }));

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function slotForHour(hour) {
    if (hour < 5 || hour >= 23) return "night";
    if (hour < 11) return "morning";
    if (hour < 17) return "day";
    return "evening";
  }

  const reputationTiers = [
    {
      min: 3000, label: "深渊传奇",
      intro: "认出你后立刻起身迎接，连邻桌也在等你讲远征故事。",
      welcome: "一眼认出你，整间酒馆随即举杯致意：“传奇回来了，英雄这边请！”",
      slogan: "杯盏停了一瞬，随后整间酒馆都在向你举杯。",
      reply: "郑重记下你的话，周围几桌也安静下来听这位传奇开口。",
    },
    {
      min: 1500, label: "前线英雄",
      intro: "把你当作真正的前线英雄，主动留出最好的座位。",
      welcome: "热情地迎上来：“英雄，给你留的位置还热着，快坐！”",
      slogan: "你的名字刚传到门口，常客们已经开始招手。",
      reply: "笑着应下你的话，又招呼伙计把英雄的杯子添满。",
    },
    {
      min: 1000, label: "可靠远征者",
      intro: "知道你在异界联盟魔境的战绩，交谈时明显多了敬意。",
      welcome: "主动挪开身边的椅子：“是你啊，远征者，今天想听什么？”",
      slogan: "不少居民已经认得这位可靠的远征者。",
      reply: "认真回应你的问题，并把你的判断当作前线见闻记下。",
    },
    {
      min: 500, label: "崭露头角",
      intro: "听说过你最近的战绩，态度比对普通旅人亲近许多。",
      welcome: "认出了你的徽记：“原来是最近那位冒险者，坐吧。”",
      slogan: "你的战绩已经成为几张酒桌上的新话题。",
      reply: "带着几分好奇回应，也追问起你最近的魔境见闻。",
    },
    {
      min: 0, label: "初来乍到",
      intro: "暂时只把你当作新面孔，保持礼貌而克制的距离。",
      welcome: "礼貌地点头，示意你坐下聊聊今天的新闻。",
      slogan: "这里仍在观察每一位刚踏入魔境的冒险者。",
      reply: "礼貌回应你的话，并提醒真正的名声要从一次次远征积累。",
    },
  ];

  function reputationTier(value) {
    const score = Math.max(0, Math.floor(Number(value) || 0));
    return reputationTiers.find((item) => score >= item.min);
  }

  function select({ date, hour, professionId, residentState = {} }) {
    const slot = slotForHour(Number.isFinite(hour) ? hour : new Date().getHours());
    const key = `${date || "unknown"}:${slot}:${professionId || "none"}`;
    const keeper = residents[0];
    const eligible = residents.slice(1)
      .filter((item) => residentState[item.id]?.alive !== false)
      .filter((item) => item.slots.includes(slot))
      .map((item) => ({
        item,
        score: hash(`${key}:${item.id}`)
          + (item.professions.includes(professionId) ? 0x100000000 : 0),
      }))
      .sort((left, right) => right.score - left.score);
    const count = Math.min(5, 1 + (hash(key) % 5), eligible.length + 1);
    return {
      date, slot, count,
      residents: [keeper, ...eligible.slice(0, count - 1).map(({ item }) => item)],
    };
  }

  LG.goldenHorizonResidents = {
    all: residents,
    select,
    reputationTier,
    status(item) {
      const stored = LG.goldenHorizon?.data?.()?.tavern?.residents?.[item.id];
      return stored || {
        age: item.baseAge,
        alive: true,
        bond: 0,
        relation: "初见",
      };
    },
    label(item) {
      const status = this.status(item);
      return [item.name, item.role, `${status.age}岁`, status.relation]
        .filter(Boolean).join(" · ");
    },
    warmIntro(item, reputation) {
      return `${item.intro} 你们目前是${this.status(item).relation}。${
        reputationTier(reputation).intro}`;
    },
    welcome(item, reputation, title) {
      const greeting = `${item.name}${reputationTier(reputation).welcome}`;
      return typeof title === "string" && title.trim()
        ? `${item.name}依照异界联盟礼仪先称你为“${title.trim()}阁下”，随后${
          reputationTier(reputation).welcome}`
        : greeting;
    },
    localReply(item, text, reputation) {
      return `${item.name}${reputationTier(reputation).reply}“${text.slice(0, 36)}”`;
    },
    tavernSlogan(schedule, reputation) {
      const score = Math.max(0, Math.floor(Number(reputation) || 0));
      const tier = reputationTier(score);
      return `${this.slotLabel(schedule.slot)}到访 · ${schedule.count}位居民正在交换消息`
        + ` · 异界联盟声望 ${score} · ${tier.label}。${tier.slogan}`;
    },
    slotLabel(slot) {
      return { morning: "清晨", day: "白昼", evening: "傍晚", night: "深夜" }[slot]
        || "今日";
    },
  };
})(window.LifeGame);
