(function (LG) {
  const completed = (snapshot, endingId) =>
    snapshot?.lifeCinema?.simulation?.achievements?.includes(endingId)
    || ["male", "female"]
      .some((gender) => snapshot?.archive?.[gender]?.includes(endingId));
  const guides = {
    guildReceptionist: {
      id: "guildReceptionist", name: "米蕾娅",
      role: "异界冒险公会女接待",
      scene: "./assets/generated/gallery-otherworld-receptionist.692fafe9.webp",
    },
    guildManager: {
      id: "guildManager", name: "维奥拉",
      role: "异界冒险公会女管理者",
      scene: "./assets/generated/gallery-otherworld-manager.16d2f277.webp",
    },
    expoSaleswoman: {
      id: "expoSaleswoman", name: "莉泽尔",
      role: "万界战斗伙伴公会签约官",
      scene: "./assets/generated/gallery-otherworld-saleswoman.0cf54a9f.webp",
    },
    saint: {
      id: "saint", name: "圣徒",
      role: "圣光教团 · 上古史守望者",
      scene: "./assets/generated/protagonist-female-saint-set.7178996a.webp",
    },
    priestess: {
      id: "priestess", name: "七大欲女祭司",
      role: "魔纹教会 · 魔纹法术书保管者",
      scene: "./assets/generated/infernal-church-priestess.a0c2cd06.webp",
    },
    agencyCouple: {
      id: "agencyCouple", name: "杜衡与许曼",
      role: "中介公司夫妻 · 六大势力顾问",
      scene: "./assets/generated/agency-couple-portrait.ee5f0b66.webp",
    },
    restaurantCouple: {
      id: "restaurantCouple", name: "周启明与罗雯",
      role: "餐饮店夫妻 · 职业装备顾问",
      scene: "./assets/generated/restaurant-couple-portrait.ffeb13e8.webp",
    },
  };
  const topics = [
    ["cycle", "远征者每天到底在做什么？", "cycle"],
    ["shop", "远征物资从哪里来？", "shop"],
    ["corrupted", "深渊战利品会去哪里？", "corrupted"],
    ["frontline", "为什么所有人都在反攻深渊？", "frontline"],
    ["reputation", "别人为什么会认识我？", "reputation"],
    ["growth", "远征者怎么活着回来？", "growth"],
    ["vehicle", "谁会陪我穿过深渊？", "vehicleLead"],
    ["soul", "七色灵魂为什么能成神？", "soul"],
    ["magic", "魔纹为什么回应欲望？", "magic"],
    ["factions", "六大势力怎么接管灾后世界？", "factions"],
    ["careerEquipment", "职业者为什么要穿成套装备？", "careerEquipment"],
  ].map(([id, title, scene]) => ({ id, title, scene }));
  const back = { label: "回到公会大厅", next: "hub", quiet: true };
  const tour = (label, next) => ({ label, next });
  const scenes = {
    intro: {
      location: "异界魔境 · 冒险者公会",
      speaker: "guildReceptionist", cast: ["guildReceptionist", "guildManager"],
      title: "新远征者，先从一张悬赏开始",
      copy: "米蕾娅没有递来说明书，只把今天的悬赏登记册推到你面前。终局已经为你打开异界魔境，接下来带什么、和谁同行、能否活着带回战利品，都由你亲手决定。",
      tips: ["先认清悬赏、整备、伙伴与战利品如何连成一次远征。", "黄金都城要在七个不同日期留下萨卢卡斯见证，成功或失败都算。"],
      choices: [{ label: "先看今天的悬赏怎么运转", next: "cycle" }],
    },
    cycle: {
      topic: "cycle", location: "异界魔境 · 冒险者公会任务墙",
      speaker: "guildManager", cast: ["guildReceptionist", "guildManager"],
      title: "公会只认可活着带回来的结果",
      copy: "远征者先从任务墙接下悬赏，带着补给和伙伴进入深渊。击败目标只是第一步；把遗物带回鉴定、换成下一次远征的力量，才算完成一次循环。",
      tips: ["悬赏推动战线，战利品支撑下一次出发。", "每次归来都会留下记录，商人、酒馆居民和各方势力会据此改变对你的态度。"],
      choices: [tour("先去看看公会为远征准备了什么", "shop"), back],
    },
    shop: {
      topic: "shop", location: "异界魔境 · 冒险者公会",
      speaker: "guildReceptionist", cast: ["guildReceptionist", "guildManager"],
      title: "出发的人不能空着手",
      copy: "公会每天从各界商路调来食物、药剂和基础装备。远征者用过去积累的功绩换取物资；需求突然增加时，商队也能额外送来几批货。",
      tips: ["补给既能救命，也能交给职业委托换取长期成长。", "装备一旦登记，就会进入公会保管的个人仓库。"],
      choices: [{ label: "让米蕾娅配一份远征补给", action: "supply" },
        { label: "去装备架挑一件防身装备", action: "equipment" },
        tour("维奥拉说，回来时还有另一道手续", "corrupted"), back],
    },
    corrupted: {
      topic: "corrupted", location: "异界魔境 · 公会鉴定室",
      speaker: "guildManager", cast: ["guildReceptionist", "guildManager"],
      title: "深渊里的东西不会自己变成财富",
      copy: "魔物遗物会留下欲望、诅咒和战斗记忆。鉴定师把这些痕迹称为词缀。适合你的可以收藏，不适合的交给公会回收，换来的功绩会继续供养远征。",
      tips: ["稀有词缀会改变职业委托的收益。", "被卖出的遗物会流向研究所、教会或下一支远征队。"],
      choices: [{ label: "把遗物放上鉴定台", action: "corrupted" },
        { label: "把不需要的战利品卖给公会", action: "inventory" },
        tour("接着去检查我还能不能上战场", "growth"), back],
    },
    frontline: {
      topic: "frontline", location: "异界魔境 · 反攻作战室",
      speaker: "guildManager", cast: ["guildReceptionist", "guildManager"],
      title: "反攻不是一次冲锋，而是一条补给线",
      copy: "七层地狱是通往无尽深渊的前哨。每完成一批悬赏，公会就能把人员和物资往下推进一层；金色地平线负责把五界的道路接到同一条战线上。",
      tips: ["异界魔境进入终局后自动开放。", "黄金都城需七个不同日期见证，试炼失败也计数，但一天不能重复。"],
      choices: [{ label: "进入异界魔境接第一份悬赏", action: "infernal" },
        { label: "跟斯与卡留下今日见证", action: "golden" },
        tour("我明白了，准备开始第一场远征", "ready"), back],
    },
    reputation: {
      topic: "reputation", location: "异界魔境 · 冒险者公会荣誉墙",
      speaker: "guildManager", cast: ["guildReceptionist", "guildManager"],
      title: "公会记录会变成别人眼里的你",
      copy: "维奥拉见你和搭档仍一脸茫然，接过话头：异界声望会把每次悬赏、首领战和深渊推进累计下来。声望越高，酒馆居民越热情；完成魔境成就后，公会还会自动授予独立的异界礼仪称号。",
      tips: ["装备礼仪称号后，酒馆居民第一次招呼会按异界礼仪称你为“称号阁下”。", "声望1500 / 2000 / 3000点时，血色狼王、虎王与龙王会认可你，并留下三段英雄影像。"],
      choices: [{ label: "请维奥拉念出我的公会记录", action: "achievements" },
        { label: "请维奥拉核对我的异界礼仪称号", action: "infernalTitles" },
        { label: "看看三位伙伴留下的英雄影像", action: "vehicleCgs" },
        tour("最后带我去看看真正的战线", "frontline"), back],
    },
    growth: {
      topic: "growth", location: "异界魔境 · 备战登记台",
      speaker: "guildReceptionist", cast: ["guildReceptionist", "guildManager"],
      title: "活着回来，靠的不是英雄称号",
      copy: "远征前，接待员会核对身体、意志、装备、灵魂和同行伙伴。职业顾问则确认你的战斗方式是否与阵营、勋章和套装匹配。",
      tips: ["属性代表你长期承受危险后形成的倾向。", "装备、职业与伙伴互相配合，才会在深渊里产生真正的优势。"],
      choices: [{ label: "让米蕾娅检查我的远征状态", action: "traits" },
        { label: "请职业顾问重新核对整备", action: "career" },
        tour("接下来去找一位可靠的同行伙伴", "vehicleLead"), back],
    },
    vehicleLead: {
      topic: "vehicle", location: "异界魔境 · 冒险者公会门厅",
      speaker: "guildReceptionist", cast: ["guildReceptionist", "guildManager"],
      title: "拿好传单，去战斗伙伴公会馆",
      copy: "深渊里不能只靠两条腿，靠谱的伙伴能陪你赶路，也能改变战斗方式。拿着公会传单去找莉泽尔，她会替你登记访客优惠和后续会员折扣。",
      tips: ["先锋协同偏向战斗表现与特殊效果，跟随支援会让伙伴和主角同时出现在画面里。", "签约后可随时在职业系统的战斗伙伴页面切换。"],
      choices: [{ label: "接过传单，去见莉泽尔", next: "vehicleGuide" }, back],
    },
    vehicleGuide: {
      topic: "vehicle", location: "万界战斗伙伴公会馆",
      speaker: "expoSaleswoman", cast: ["expoSaleswoman", "guildReceptionist"],
      title: "先锋协同与跟随支援，由你决定",
      copy: "欢迎，英雄。普通伙伴负责同行，高阶伙伴还会提供终局效果。签约后去职业系统选择战斗伙伴，再在“先锋协同 / 跟随支援”之间切换；深渊出发前记得检查当前模式。",
      tips: ["先锋协同：部分异界伙伴可越过小怪直面首领。", "跟随支援：主角与伙伴并肩显示，通常不触发先锋专属效果。"],
      choices: [{ label: "请莉泽尔替我登记同行方式", action: "vehicleProfile" },
        { label: "看看伙伴公会通往哪些世界", action: "world" },
        tour("伙伴选好了，去听听灵魂的旧故事", "soul"), back],
    },
    soul: {
      topic: "soul", location: "圣光教团 · 圣徒据点",
      speaker: "saint", cast: ["saint", "guildReceptionist"],
      title: "上古历史与七色灵魂成神",
      copy: "上古诸神并非生来高踞天穹。灵魂先由黑、青、金三阶淬炼，再让红橙黄绿蓝银紫七色全部点燃，才拥有承载神格的可能。",
      tips: ["灵魂颜色来自一次次选择，会改变你能承受的魔气与命运。", "圣光教团相信七色完整之后，凡人也能成为新的神。"],
      choices: [{ label: "请圣徒点燃灵魂之火", action: "soulProfile" },
        { label: "听圣光教团讲完上古史", action: "holyLight" },
        tour("女祭司似乎有另一种说法", "magic"), back],
    },
    magic: {
      topic: "magic", location: "魔纹教会 · 女祭司祭祀所",
      speaker: "priestess", cast: ["priestess", "guildManager"],
      title: "欲望从来不是力量的反面",
      copy: "女祭司嘲笑圣光把力量说得太神圣。色欲、贪婪、嫉妒、愤怒、懒惰、暴食与傲慢各自保留一种古老语言，魔纹只是让灵魂承认自己真正想要什么。",
      tips: ["魔纹教会只公开他们认可的历史，七大语真正的起源仍被刻意隐藏。", "选择一种法术书，也是在选择本轮愿意付出的代价。"],
      choices: [{ label: "让女祭司翻开魔纹法术书", action: "spellbook" },
        { label: "追问灵魂为什么会回应魔纹", action: "soulProfile" },
        tour("离开教会，回现世看看老朋友", "factions"), back],
    },
    factions: {
      topic: "factions", location: "夏国 · 中介公司办公室",
      speaker: "agencyCouple", cast: ["agencyCouple", "guildReceptionist"],
      title: "回来看看我们，也把六大势力认清",
      copy: (snapshot) => completed(snapshot, "calamity-together")
        ? "杜衡与许曼还记得魔灾元年那天，你和搭档逆着人流回来找他们。多年后，你们仍会定期陪两位长辈；他们把灾后六大势力的聘用证明重新整理给你。"
        : "魔灾之后，你和搭档重新找到了杜衡与许曼，也开始承担两位长辈的养老责任。他们把灾后六大势力的聘用证明重新整理给你。",
      tips: ["六大势力在魔灾后接管了不同的道路、技术与生存方式。", "加入谁，不只是换一份工作，也是在决定把远征成果交给谁。"],
      choices: [{ label: "听杜叔和许姨讲六大势力近况", action: "careerFactions" },
        { label: "陪他们回忆魔灾后的城市", action: "world" },
        tour("再去餐饮店陪周叔和罗姨吃顿饭", "careerEquipment"), back],
    },
    careerEquipment: {
      topic: "careerEquipment", location: "夏国 · 餐饮店休息室",
      speaker: "restaurantCouple", cast: ["restaurantCouple", "guildManager"],
      title: "回来吃顿饭，再检查职业装备",
      copy: (snapshot) => completed(snapshot, "calamity-together")
        ? "周启明与罗雯一直留着当年逃难前那张桌子。你和搭档这些年照顾着两位长辈；每次出征，他们仍会把职业勋章和五件装备逐一摆好。"
        : "周启明与罗雯一直留着你们的位置。重逢后，你和搭档开始照顾两位长辈；每次出征，他们都会把职业勋章和五件装备逐一摆好。",
      tips: ["职业套装记录前人的战斗方法，勋章则证明你有资格承担那份职责。", "五个部位必须彼此兼容，否则再强的装备也只是一堆负担。"],
      choices: [{ label: "让周叔和罗姨检查职业套装", action: "careerLoadout" },
        { label: "把五件出征装备逐一摆上桌", action: "equipmentProfile" },
        tour("回公会看看大家还记不记得我", "reputation"), back],
    },
    ready: {
      location: "异界魔境 · 冒险者公会任务墙",
      speaker: "guildManager", cast: ["guildReceptionist", "guildManager"],
      title: "从今天起，记录由你自己写",
      copy: "维奥拉把第一张空白远征记录递给你。公会只记录你接下了什么、带回了什么；黄金都城则记录你是否真正走过七个不同日期。",
      tips: ["接悬赏 → 检查职业、装备与战斗伙伴 → 进入深渊 → 带回战利品。", "每天可做一次萨卢卡斯见证；第七个日期结束后，无论胜负都开放都城内部。"],
      choices: [{ label: "进入异界魔境接下悬赏", action: "infernal" },
        { label: "前往萨卢卡斯完成今日见证", action: "golden" }, back],
    },
  };
  LG.GUILD_ONBOARDING_DATA = { guides, topics, scenes };
})(window.LifeGame);
