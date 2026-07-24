(function (LG) {
  const characters = [
    {
      id: "casinoBunny",
      name: "伊琳娜",
      role: "俄罗斯兔女郎",
      unlockMetric: "losses",
      unlockAt: 5,
      price: 30,
      portrait: "./assets/generated/casino-bunny-portrait.7f3ad414.webp",
      items: [
        ["sweaty-tights", "汗臭的丝袜", "她在赌桌轮班后换下的丝袜收藏。"],
        ["dirty-underwear", "肮脏的内裤", "只在虚构成人角色商店展示的私人物品。"],
        ["smelly-insole", "恶臭鞋垫", "高跟鞋里替换下来的旧鞋垫。"],
        ["smelly-heels", "发臭的高跟鞋", "长时间巡桌后换下的旧高跟鞋。"],
        ["patron-note", "兔女郎的金主认证纸条", "持有后，每局第1至3轮无条件获胜。", true],
      ],
    },
    {
      id: "casinoLead",
      name: "叶卡捷琳娜",
      role: "俄罗斯兔女郎领班",
      unlockMetric: "losses",
      unlockAt: 10,
      price: 60,
      portrait: "./assets/generated/casino-lead-portrait.9a7d1156.webp",
      items: [
        ["sweaty-tights", "汗臭的丝袜", "领班巡场后留下的丝袜收藏。"],
        ["dirty-underwear", "肮脏的内裤", "只在虚构成人角色商店展示的私人物品。"],
        ["smelly-insole", "恶臭鞋垫", "长时间站立后替换下来的鞋垫。"],
        ["smelly-heels", "发臭的高跟鞋", "领班巡场时穿旧的高跟鞋收藏。"],
        ["scorn-photo", "领班的鄙夷签名写真照", "持有后，每局第4至7轮无条件获胜。", true],
      ],
    },
    {
      id: "casinoManager",
      name: "韩智妍",
      role: "韩国女店长",
      unlockMetric: "losses",
      unlockAt: 15,
      price: 90,
      portrait: "./assets/generated/casino-manager-portrait.88bc776a.webp",
      items: [
        ["sweaty-tights", "汗臭的丝袜", "店长闭店盘账后换下的丝袜收藏。"],
        ["dirty-underwear", "肮脏的内裤", "只在虚构成人角色商店展示的私人物品。"],
        ["smelly-insole", "恶臭鞋垫", "店长久站后替换下来的旧鞋垫。"],
        ["smelly-heels", "发臭的高跟鞋", "店长闭店后换下的旧高跟鞋。"],
        ["humiliation-card", "店长的羞辱签名名片", "持有后，每局第8至10轮无条件获胜。", true],
      ],
    },
    {
      id: "casinoOwner",
      name: "尹瑞英",
      role: "韩国女老板",
      unlockMetric: "wins",
      unlockAt: 20,
      price: 120,
      portrait: "./assets/generated/casino-owner-portrait.7b3a59ed.webp",
      items: [
        ["sweaty-tights", "汗臭的丝袜", "老板亲自下场后留下的丝袜收藏。"],
        ["dirty-underwear", "肮脏的内裤", "只在虚构成人角色商店展示的私人物品。"],
        ["smelly-insole", "恶臭鞋垫", "老板私人鞋柜中替换下来的旧鞋垫。"],
        ["smelly-heels", "发臭的高跟鞋", "老板亲自下场时穿过的旧高跟鞋。"],
        ["private-contact", "女老板的私人联系方式", "持有后女老板固定出现在赌场，可随时发起百点对赌。", true],
      ],
    },
  ].map((character) => ({
    ...character,
    items: character.items.map(([suffix, name, description, insider]) => ({
      id: `${character.id}-${suffix}`,
      character: character.id,
      name,
      description,
      price: character.price,
      insider: Boolean(insider),
    })),
  }));

  LG.CASINO_DATA = {
    characters,
    byId: Object.fromEntries(characters.map((item) => [item.id, item])),
  };

  LG.CASINO_DIALOGUE = {
    characters: {
      casinoBunny: {
        name: "伊琳娜",
        fallback: [
          "前三轮的运气已经写在纸条上了，你还要装作只是随便来看看吗？",
          "输够五次才记住我的名字，看来教训比欢迎更适合你。",
          "你可以拒绝认输，不过别把侥幸说成判断力。",
        ],
      },
      casinoLead: {
        name: "叶卡捷琳娜",
        fallback: [
          "第四轮以后由我巡场，你的犹豫比筹码更容易被看穿。",
          "签名照能保住几轮胜利，保不住你那点急着证明自己的自尊。",
          "想离场就自己走，留下就别假装规则逼迫了你。",
        ],
      },
      casinoManager: {
        name: "韩智妍",
        fallback: [
          "最后三轮才最能暴露判断，你每次都在结果出来前先背叛自己。",
          "名片上的签名是权限，不是安慰；别把必赢当成你真的学会了什么。",
          "赌场允许你随时离开，我只负责记住你选择留下的次数。",
        ],
      },
      casinoOwner: {
        name: "尹瑞英",
        fallback: [
          "二十次胜利只换来我亲自下场，别急着把资格误认为地位。",
          "一百点的赌注才值得我看一眼，你仍然可以在下注前离开。",
          "联系方式已经给你了，但什么时候回应，仍然由我决定。",
        ],
      },
    },
    rooms: {
      casinoBunny: {
        character: "casinoBunny",
        location: "异域联邦赌场侧厅",
        title: "兔女郎的休息时间",
        opener: "伊琳娜靠在空赌桌边：“商店都买光了，现在你想问什么？”",
      },
      casinoLead: {
        character: "casinoLead",
        location: "异域联邦赌场领班室",
        title: "巡场记录之外",
        opener: "叶卡捷琳娜合上巡场记录：“没有赌局打断你了，开口吧。”",
      },
      casinoManager: {
        character: "casinoManager",
        location: "异域联邦赌场经理室",
        title: "闭店后的盘问",
        opener: "韩智妍把签名名片压在桌面：“你集齐了权限，现在说出目的。”",
      },
      casinoOwner: {
        character: "casinoOwner",
        location: "异域联邦赌场顶层套间",
        title: "老板的私人会面",
        opener: "尹瑞英关闭账本：“联系方式不是承诺，但我可以听完这句话。”",
      },
    },
  };
})(window.LifeGame);
