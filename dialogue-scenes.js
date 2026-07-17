(function (LG) {
  const characters = {
    lin: {
      name: "林岚",
      fallback: [
        "你总把服从说成负责，好像换个词就能显得自己有选择。",
        "边界可以谈，但别用边界掩饰你承担不了结果。",
        "至少这一次，说不的时候别先看我的脸色。",
      ],
    },
    qin: {
      name: "秦玫",
      fallback: [
        "你把依赖叫作信任，只是因为承认软弱会让你难堪。",
        "免费的帮助最昂贵，至少我愿意把条件写在桌面上。",
        "别急着回答。先分清这是你的愿望，还是你希望我认可的愿望。",
      ],
    },
    su: {
      name: "苏绯",
      fallback: [
        "镜头关了你才敢讲原则，看来你在意的从来不是原则。",
        "观众喜欢明确的态度，你的犹豫只是在等别人替你决定。",
        "你可以拒绝，不过拒绝也要像一个完整的选择。",
      ],
    },
    shen: {
      name: "沈静秋",
      fallback: [
        "你总在需要承担后果时想起自由，平时却很乐意把决定留给我。",
        "别把没有准备称作独立，那只是另一种逃避。",
        "你可以离开。只是离开之后，答案不会再有人替你检查。",
      ],
    },
    reina: {
      name: "高桥玲奈",
      fallback: [
        "口音可以纠正，身份不该由老师替你重写。你真的分得清这两件事吗？",
        "我教你表达，不代表我有权替你决定应该表达什么。",
        "留下或回去都可以，但答案必须是你的，而不是为了得到我的认可。",
      ],
    },
    miki: {
      name: "佐藤美纪",
      fallback: [
        "钥匙在你手里时，你总忘记自己也可以开门离开。",
        "我可以管理房子，但你把生活也交出来，是另一回事。",
        "别把依赖说成省心。真正省掉的，是你自己的决定。",
      ],
    },
    mari: {
      name: "神崎真理",
      fallback: [
        "你把被接纳当成答案，所以才愿意把学费、课程和判断一起交出来。",
        "真正的归属不需要你切断外界。你现在想留下，是因为相信，还是因为害怕孤立？",
        "你可以拒绝我，也可以离开。任何不允许离开的承诺，都不值得叫作家。",
      ],
    },
    restaurantCouple: {
      name: "周启明与罗雯",
      fallback: [
        "连一份临时工作都要别人替你决定，你还准备拿什么证明自己能离开？",
        "别把屈服说成懂事。我们只是把你主动交出的东西收好。",
      ],
    },
    agencyCouple: {
      name: "杜衡与许曼",
      fallback: [
        "你总希望合同替你承担判断，难怪每一行小字都能吓住你。",
        "先别谈尊严。连自己的工时都不敢核对，尊严只是你用来装饰犹豫的词。",
      ],
    },
  };

  const scenes = {
    "qin-offer": { character: "qin", location: "校友会客厅", opener: "秦玫合上预约本，示意你坐到她对面。" },
    "lin-overtime": { character: "lin", location: "林岚办公室", opener: "办公室只亮着桌灯，林岚把手机推到你面前。" },
    "su-camera": { character: "su", location: "直播后台", opener: "最后一盏补光灯熄灭，苏绯终于不再面对镜头。" },
    "campus-choice": { character: "qin", location: "校园咖啡厅", opener: "秦玫提前替你点好了咖啡，也准备好了名单。" },
    "work-promotion": { character: "lin", location: "高层办公室", opener: "玻璃窗外是整座城市，林岚等你先开口。" },
    "adult-club": { character: "su", location: "直播公司策划室", opener: "人设合约说明结束后，苏绯单独留下来听你的边界。" },
    "qin-final": { character: "qin", location: "私人会客室", opener: "长期安排摊在桌面上，秦玫没有催促你签字。" },
    "lin-final": { character: "lin", location: "深夜办公室", opener: "整层楼已经无人，专属职位合同还亮在屏幕上。" },
    "su-final": { character: "su", location: "直播收官后台", opener: "苏绯摘下耳返，把账户方案推到你面前。" },
    "shen-college": { character: "shen", location: "学院教务室", opener: "沈静秋把代管书放在你面前，要求你逐条读完。" },
    "shen-company": { character: "shen", location: "合作公司面谈室", opener: "沈静秋用红笔圈出合同签名处，却没有替你落笔。" },
    "shen-final": { character: "shen", location: "沈静秋的备课室", opener: "她把多年计划叠在一起，最上面是那份终身指导协议。" },
    "reina-guidance": { character: "reina", location: "日本语言学校", opener: "高桥玲奈划掉你练习册上的一句话，要求你重新说明自己的立场。" },
    "reina-exam": { character: "reina", location: "语言学校考务室", opener: "高桥玲奈把监考记录翻到你面前，没有替你解释上面的时间。" },
    "reina-final": { character: "reina", location: "语言学校办公室", opener: "长期身份规划文件已经排好顺序，高桥玲奈等你自己翻开。" },
    "miki-house": { character: "miki", location: "管理公寓客厅", opener: "佐藤美纪把本月账目放到桌上，钥匙在她指间轻响。" },
    "miki-theft": { character: "miki", location: "公寓管理室", opener: "佐藤美纪把门口记录停在同一帧，等你先说明晾衣间发生了什么。" },
    "miki-final": { character: "miki", location: "公寓玄关", opener: "返程票信封压在钥匙下面，佐藤美纪让你决定拿走哪一个。" },
    "cult-sermon": { character: "mari", location: "澄心会接待室", opener: "神崎真理合上捐款簿，温和地问你为什么还需要学校的答案。" },
    "cult-baptism": { character: "mari", location: "澄心会封闭会谈室", opener: "神崎真理站在关闭的门边，要求你把拒绝也解释成不忠。" },
    "cult-final": { character: "mari", location: "返程前的会谈室", opener: "长期关系、退学文件和返程清单并排放着，神崎真理让你亲手选择。" },
    "cult-contract-final": { character: "mari", location: "返程前的会谈室", opener: "终身契约与定期返程任务并排放着，神崎真理让你亲手选择。" },
    "restaurant-couple-test": { character: "restaurantCouple", location: "餐饮店休息室", opener: "罗雯关上账本，周启明守在门边，等你解释为什么还没有离开。" },
    "restaurant-coercion": { character: "restaurantCouple", location: "餐饮店办公室", opener: "夫妻把排班、住处和升学资料摊开，要求你只保留一套日程。" },
    "restaurant-household-contract": { character: "restaurantCouple", location: "餐饮店办公室", opener: "没有期限的劳动协议放在桌面上，夫妻没有替你拿笔。" },
    "agency-couple-test": { character: "agencyCouple", location: "中介公司办公室", opener: "杜衡调出监控时间，许曼合上门，等你先承认自己的越界。" },
    "agency-coercion": { character: "agencyCouple", location: "中介公司档案室", opener: "夫妻把虚假债务与升学材料放在一起，试图让恐惧替你签字。" },
    "agency-household-contract": { character: "agencyCouple", location: "中介公司签约室", opener: "终身协议摆在空白工牌旁边，夫妻等你决定是否交出名字。" },
  };

  const rooms = {
    qin: { character: "qin", location: "秦玫的私人会客室", title: "没有期限的会面", opener: "秦玫合上门，把预约本翻到没有日期的一页：“这次你可以慢慢回答。”" },
    lin: { character: "lin", location: "林岚的顶层办公室", title: "下班后的办公室", opener: "林岚关闭工作邮箱，抬眼看向你：“现在没有绩效表，你还想证明什么？”" },
    su: { character: "su", location: "苏绯的私人影棚", title: "镜头关闭之后", opener: "苏绯关掉所有直播指示灯：“没有观众了，看看你还剩多少真话。”" },
    shen: { character: "shen", location: "沈静秋的私人备课室", title: "标准答案之外", opener: "沈静秋合上教案：“这里没有成绩单。说说你这次真正想问什么。”" },
    reina: { character: "reina", location: "高桥玲奈的语言教室", title: "课本之外的表达", opener: "高桥玲奈合上课本：“今天不纠正语法，只听你自己的答案。”" },
    miki: { character: "miki", location: "佐藤美纪的管理室", title: "钥匙归还之后", opener: "佐藤美纪把备用钥匙放回抽屉：“现在谈话不写进租约。”" },
    mari: { character: "mari", location: "神崎真理的会谈室", title: "封闭会议之外", opener: "神崎真理收起捐款簿：“没有成员和任务时，你还愿意听我说什么？”" },
    restaurantCouple: { character: "restaurantCouple", location: "餐饮店闭店办公室", title: "最后一桌客人离开后", opener: "罗雯合上账本，周启明关掉后厨灯：“现在没有排班表，你还想把什么交给我们决定？”" },
    agencyCouple: { character: "agencyCouple", location: "中介公司签约室", title: "空白合同之外", opener: "许曼收起合同，杜衡把空白工牌推回桌面：“这次没有债务和工时，你准备怎么回答？”" },
  };
  Object.assign(characters, LG.USA_DIALOGUE?.characters || {});
  Object.assign(scenes, LG.USA_DIALOGUE?.scenes || {});
  Object.assign(rooms, LG.USA_DIALOGUE?.rooms || {});
  Object.assign(characters, LG.SANCTUARY_DIALOGUE?.characters || {});
  Object.assign(scenes, LG.SANCTUARY_DIALOGUE?.scenes || {});
  Object.assign(rooms, LG.SANCTUARY_DIALOGUE?.rooms || {});
  Object.assign(characters, LG.CORPORATE_DIALOGUE?.characters || {});
  Object.assign(scenes, LG.CORPORATE_DIALOGUE?.scenes || {});
  Object.assign(rooms, LG.CORPORATE_DIALOGUE?.rooms || {});
  Object.assign(characters, LG.TRIBUTE_DIALOGUE?.characters || {});
  Object.assign(rooms, LG.TRIBUTE_DIALOGUE?.rooms || {});
  Object.assign(characters, LG.BLACK_MARKET_DIALOGUE?.characters || {});
  Object.assign(rooms, LG.BLACK_MARKET_DIALOGUE?.rooms || {});
  Object.assign(characters, LG.CASINO_DIALOGUE?.characters || {});
  Object.assign(rooms, LG.CASINO_DIALOGUE?.rooms || {});

  LG.dialogueScenes = {
    get(eventId) {
      const scene = scenes[eventId];
      if (!scene) return null;
      return { ...scene, ...characters[scene.character] };
    },
    room(character) {
      const scene = rooms[character];
      if (!scene) return null;
      return { ...scene, ...characters[character], conversationKey: character };
    },
  };
})(window.LifeGame);
