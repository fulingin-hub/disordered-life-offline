(function (global) {
  const names = {
    qin: "秦媚", lin: "林岚", su: "苏菲", shen: "沈静秋",
    reina: "高桥玲奈", miki: "佐藤美纪", mari: "神崎真理",
    evelyn: "伊芙琳", claire: "克莱尔", ruth: "露丝",
    qinghe: "清和", ciyun: "慈云", agnes: "艾格尼丝",
    kaori: "黑田香织", victoria: "维多利亚",
    streetThug: "街头恶女", beggar: "流浪女",
    japanOfficial: "岛国女高官", usaOfficial: "米国女高官",
    casinoBunny: "伊琳娜", casinoLead: "叶卡捷琳娜",
    casinoManager: "韩智妍", casinoOwner: "尹瑞英",
    edenChef: "塞拉菲娜", edenFashion: "奥蕾莉亚",
    penitentiarySupervisor: "顾寒霜", penitentiaryManager: "北条绫",
    penitentiaryInstructor: "维拉·科瓦奇",
    penitentiaryWarden: "塞西莉亚·格兰特",
    penitentiaryOwner: "伊莎贝拉·诺克斯",
    expoSaleswoman: "莉泽尔", guildReceptionist: "米蕾娅",
    guildManager: "维奥拉",
  };
  const replies = {
    regular: [
      "我听见了。先别急着解释，把真正想要的结果说清楚。",
      "选择已经摆在面前，态度比漂亮话更有用。",
      "你可以继续说，但我只会回应有分量的决定。",
    ],
    tribute: [
      "既然主动来到这里，就按照房间的规矩证明诚意。",
      "少说空话，先完成眼前的服侍，再谈你的请求。",
      "你的态度还不够明确，继续用行动回答。",
    ],
    market: [
      "交易讲究代价。你想得到什么，就先确认自己付得起。",
      "这里不接受侥幸，每一次选择都会留下记录。",
      "条件满足后我自然会放行，现在先看清自己的筹码。",
    ],
    casino: [
      "赌场只认结果。犹豫不会减少损失，只会暴露弱点。",
      "你可以下注，也可以离开，但别把冲动当成勇气。",
      "牌面不会同情任何人，决定之前先想清楚代价。",
    ],
    paradise: [
      "这里按收藏和消费记录说话。先确认你已经付清代价。",
      "伊甸园不会催促客人，但每项服务都留下永久记录。",
      "影狱只承认完成的任务，空泛的承诺没有赎罪卷。",
    ],
  };

  function category(id) {
    if (id === "streetThug" || id === "beggar") return "tribute";
    if (id === "japanOfficial" || id === "usaOfficial") return "market";
    if (String(id).startsWith("casino")) return "casino";
    if (String(id).startsWith("eden")
      || String(id).startsWith("penitentiary")) return "paradise";
    return "regular";
  }

  function translated(value) {
    return global.OfflineI18n?.translate?.(value) || value;
  }

  function format(name, text) {
    const locale = global.OfflineI18n?.locale?.() || "zh-CN";
    if (locale === "en") return `${translated(name)} looks at you. ${translated(text)}`;
    if (locale === "ja") return `${translated(name)}はあなたを見つめる。${translated(text)}`;
    return `${name}看着你。${text}`;
  }

  function reply(body) {
    const id = body?.characterId;
    const themed = global.OfflineDialogueText?.reply?.({
      characterId: id,
      userText: body?.userText,
    });
    if (themed?.text) return format(names[id] || "她", themed.text);
    const text = String(body?.userText || "");
    let hash = 0;
    for (const char of `${id}:${text}`) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    const pool = replies[category(id)];
    return format(names[id] || "她", pool[hash % pool.length]);
  }

  global.OfflineDialogueReplies = {
    characterIds: Object.keys(names),
    reply,
  };
})(window);
