(function (LG) {
  LG.ADVENTURE_GUILD_DATA = {
    characters: [
      {
        id: "guildReceptionist",
        name: "米蕾娅",
        role: "异界冒险公会女接待",
        age: 28,
        portrait: "./assets/generated/otherworld-receptionist-portrait.ebc9209d.webp",
        scene: "./assets/generated/gallery-otherworld-receptionist.692fafe9.webp",
        copy: "负责登记社会区域委托、每日补给和战利品宝箱。",
      },
      {
        id: "guildManager",
        name: "维奥拉",
        role: "异界冒险公会女管理者",
        age: 36,
        portrait: "./assets/generated/otherworld-manager-portrait.2e5b5abd.webp",
        scene: "./assets/generated/gallery-otherworld-manager.16d2f277.webp",
        copy: "负责一阶职业装备、堕落收藏鉴定和公会回收。",
      },
      {
        id: "tavernExplorer",
        name: "赫克托",
        role: "百层深渊五人远征队长",
        age: 67,
        portrait: "./assets/generated/career-adventurer-male.1b5ba1e3.webp",
        scene: "./assets/generated/career-adventurer-male.1b5ba1e3.webp",
        copy: "老冒险者，负责给五名队员分配二十层区段；玩家固定为第五席队员。",
      },
    ],
    kindLabels: {
      supply: "食物与药剂",
      equipment: "一阶职业装备",
      corrupted: "今日堕落收藏",
      inventory: "公会仓库",
      rewards: "远征授勋",
    },
    supplies: {
      "field-ration": { name: "异界野战口粮", type: "food" },
      "monster-stew": { name: "魔境炖肉罐头", type: "food" },
      "recovery-potion": { name: "公会恢复药剂", type: "potion" },
      "focus-potion": { name: "公会专注药剂", type: "potion" },
    },
    statLabels: {
      knowledge: "学识", money: "资金", health: "健康", social: "人际",
      autonomy: "自主", dependence: "依赖", dignity: "尊严", shame: "羞耻",
    },
  };
})(window.LifeGame);
