(function (LG) {
  const entries = [
    ["qin", "秦玫", "qin"], ["lin", "林岚", "lin"], ["su", "苏绯", "su"],
    ["shen", "沈静秋", "shen"], ["reina", "高桥玲奈", "reina"],
    ["miki", "佐藤美纪", "miki"], ["mari", "神崎真理", "mari"],
    ["evelyn", "伊芙琳·哈特", "evelyn"], ["claire", "克莱尔·摩根", "claire"],
    ["ruth", "露丝·卡特", "ruth"], ["qinghe", "清和", "qinghe"],
    ["ciyun", "慈云", "ciyun"], ["agnes", "艾格尼丝", "agnes"],
    ["restaurantCouple", "周启明与罗雯", "restaurantCouple"],
    ["agencyCouple", "杜衡与许曼", "agencyCouple"],
    ["kaori", "黑田香织", "kaori"], ["victoria", "维多利亚·海斯", "victoria"],
    ["streetThug", "街头女混混", "streetThug"], ["beggar", "女乞丐", "beggar"],
    ["japanOfficial", "白石绫华", "japanOfficial"],
    ["usaOfficial", "玛格丽特·凯恩", "usaOfficial"],
    ["casinoBunny", "伊琳娜", null], ["casinoLead", "叶卡捷琳娜", null],
    ["casinoManager", "韩智妍", null], ["casinoOwner", "尹瑞英", null],
    ["edenChef", "塞拉菲娜", "edenChefClerk"],
    ["edenFashion", "奥蕾莉亚", "edenFashionClerk"],
    ["penitentiarySupervisor", "顾寒霜", "shadowPrisonSupervisor"],
    ["penitentiaryManager", "北条绫", "shadowPrisonManager"],
    ["penitentiaryInstructor", "维拉·科瓦奇", "shadowPrisonInstructor"],
    ["penitentiaryWarden", "塞西莉亚·格兰特", "shadowPrisonWarden"],
    ["penitentiaryOwner", "伊莎贝拉·诺克斯", "shadowPrisonOwner"],
    ["protagonistMaleBase", "男主角", "protagonistMaleBase"],
    ["protagonistFemaleBase", "女主角", "protagonistFemaleBase"],
  ].map(([id, name, asset]) => ({
    id, name,
    portrait: asset ? LG.CONFIG.assets[asset] : LG.CASINO_DATA.byId[id]?.portrait,
  }));

  LG.ABYSS_DATA = {
    bosses: entries,
    byId: Object.fromEntries(entries.map((item) => [item.id, item])),
    unlockClears: 2,
    segments: [1, 21, 41, 61, 81],
    expeditionTeam: [
      {
        id: "tavernExplorer", name: "赫克托", role: "队长",
        duty: "负责整队判断与撤离命令",
      },
      {
        id: "tavernMedic", name: "赛琳", role: "战地医师",
        duty: "负责伤势控制与恢复窗口",
      },
      {
        id: "tavernRuneSmith", name: "塔维", role: "魔导器匠",
        duty: "负责破除楼层封锁与装备维护",
      },
      {
        id: "tavernScout", name: "凯恩", role: "异界斥候",
        duty: "负责侦察下一层的欲望集成体",
      },
      {
        id: "player", name: "你", role: "第五席队员",
        duty: "服从队长分配并完成个人负责区段",
      },
    ],
  };
})(window.LifeGame);
