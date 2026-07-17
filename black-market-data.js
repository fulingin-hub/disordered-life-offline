(function (LG) {
  const milestones = [
    { count: 1, label: "媚外勋章", benefit: "每日可购买1件" },
    { count: 10, label: "媚外达人勋章", benefit: "每日可购买3件" },
    { count: 20, label: "光荣媚外者勋章", benefit: "每日可购买6件" },
    { count: 30, label: "狂热媚外者勋章", benefit: "每日可购买10件；解锁AI对话（50点开启20轮）与100点付费刷新" },
    { count: 40, label: "圣水崇拜者勋章", benefit: "每日必出美味圣水" },
    { count: 50, label: "黄金崇拜者勋章", benefit: "每日必出美味黄金圣餐" },
  ];
  const characters = {
    japanOfficial: {
      id: "japanOfficial",
      country: "japan",
      name: "白石绫华",
      role: "虚构日本女高官",
      location: "白石绫华的地下陈列室",
      title: "白发高官的神秘黑市",
    },
    usaOfficial: {
      id: "usaOfficial",
      country: "usa",
      name: "玛格丽特·凯恩",
      role: "虚构美国女高官",
      location: "玛格丽特·凯恩的封闭仓库",
      title: "红发高官的神秘黑市",
    },
  };
  const japanPrefixes = [
    { id: "soldier", label: "日本女兵", price: 20 },
    { id: "prime", label: "日本女首相", price: 40 },
  ];
  const japanEquipment = {
    head: ["旧军帽", "制服发带"],
    body: ["制服外套", "旧衬衣"],
    crotch: ["发臭内裤", "废物榨精杯"],
    hands: ["旧手套", "训练腕带"],
    feet: ["旧丝袜", "穿过的臭鞋"],
  };
  const usaPotions = [
    { id: "addictive-unknown", prefix: "addictive", suffix: "不明药剂", stat: "health", amount: -15 },
    { id: "mindless-unknown", prefix: "mindless", suffix: "不明药剂", stat: "knowledge", amount: -15 },
    { id: "mindless-stamina", prefix: "mindless", suffix: "体力药剂", stat: "health", amount: 15 },
    { id: "addictive-official", prefix: "addictive", suffix: "官方药剂", stat: "knowledge", amount: 15 },
  ];
  const usaPrefixes = [
    { id: "addictive", label: "让人上瘾的", price: 20 },
    { id: "mindless", label: "让人无脑的", price: 10 },
  ];
  const usaEquipmentSets = [
    {
      id: "soldier-sweat",
      prefix: "女兵的汗臭",
      price: 20,
      items: ["皮质内裤", "皮质头套", "贞操锁", "皮质束手", "皮质束脚"],
    },
    {
      id: "ruined-life",
      prefix: "破坏人生的",
      price: 40,
      items: ["呼吸面罩", "特制项圈", "特制脚环", "特殊手环", "特制内裤"],
    },
  ];

  LG.BLACK_MARKET_DATA = {
    characters,
    milestones,
    japanPrefixes,
    japanEquipment,
    usaPrefixes,
    usaPotions,
    usaEquipmentSets,
  };
  LG.BLACK_MARKET_DIALOGUE = {
    characters: {
      japanOfficial: {
        name: characters.japanOfficial.name,
        fallback: [
          "库存每天只换一次。你可以挑选，但别把购买误认成被我认可。",
          "你的下跪记录只决定权限，不会替你支付今天的价格。",
          "黑市允许交易，不保证你还能把自己的偏好解释成偶然。",
        ],
      },
      usaOfficial: {
        name: characters.usaOfficial.name,
        fallback: [
          "标签写得很清楚。药剂与装备都由你自己决定是否带走。",
          "限购次数来自你的记录，不来自讨价还价。",
          "这些都是虚构游戏道具；别把它们当成现实建议。",
        ],
      },
    },
    rooms: {
      japanOfficial: {
        character: "japanOfficial",
        location: characters.japanOfficial.location,
        title: characters.japanOfficial.title,
        opener: "白石绫华站在上锁的陈列柜旁：“先看清价格，再决定要不要把它带走。”",
      },
      usaOfficial: {
        character: "usaOfficial",
        location: characters.usaOfficial.location,
        title: characters.usaOfficial.title,
        opener: "玛格丽特·凯恩轻敲库存终端：“药剂与装备都写在标签上，别声称自己没有选择。”",
      },
    },
  };
})(window.LifeGame);
