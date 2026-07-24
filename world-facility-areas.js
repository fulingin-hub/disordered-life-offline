(function (LG) {
  LG.worldFacilityAreas = [
    {
      id: "paradise",
      name: "终产者的乐园",
      image: "paradiseDistantView",
      cardImage: "paradiseDistantView",
      description: "黄金商业区、影狱与职业区域共同组成终产者专属领地。",
      sections: [
        {
          id: "eden", label: "伊甸园", image: "edenGoldenDistrict",
          description: "黄金餐厅与高定服装店分列大道两侧。",
          facility: "paradise-eden",
        },
        {
          id: "shadow", label: "影狱", image: "shadowPrisonComplex",
          description: "封闭任务区以赎罪卷记录服从、消费与角色认可。",
          facility: "paradise-shadow",
        },
        {
          id: "paradise", label: "乐园", image: "edenGoldenDistrict",
          description: "乐园职业角色的独立办公区。",
          faction: "paradise",
        },
      ],
    },
    {
      id: "infernalRealm",
      name: "异界魔境",
      image: "infernalRealmGate",
      cardImage: "infernalRealmGate",
      description: "位于两片大陆之间的魔境入口，七层地狱与无尽深渊在此展开。",
      sections: [{
        id: "frontier", label: "魔境前线", image: "infernalRealmGate",
        description: "临时阵地负责远征整备、悬赏与深渊挑战。",
        facility: "infernal-realm",
      }],
    },
    {
      id: "adventureGuild",
      name: "冒险者公会总部",
      image: "goldenHorizonCapital",
      cardImage: "goldenHorizonCapital",
      description: "异世界大陆的公会总部，负责战利品、职业装备和远征补给。",
      sections: [{
        id: "headquarters", label: "公会总部", image: "goldenHorizonCapital",
        description: "总会接待厅连接补给仓库、装备柜台与任务登记处。",
        facility: "adventure-guild",
      }],
    },
    {
      id: "infernalClub",
      name: "地狱俱乐部",
      image: "infernalClubEntrance",
      cardImage: "infernalClubEntrance",
      description: "位于世界与地狱交界处的俱乐部，开放七位魔王的专属房间。",
      sections: [{
        id: "entrance", label: "俱乐部入口", image: "infernalClubEntrance",
        description: "霓虹路牌之后是七间主题房、商城与对话区域。",
        facility: "infernal-club",
      }],
    },
    {
      id: "casino",
      name: "异域赌场",
      image: "roomCasino",
      cardImage: "roomCasino",
      description: "异世界大陆的赌局场所，资格、筹码与诱惑挑战在此结算。",
      sections: [{
        id: "hall", label: "赌场大厅", image: "roomCasino",
        description: "角色群像与大小赌桌围绕中央大厅展开。",
        facility: "casino",
      }],
    },
    {
      id: "goldenHorizon",
      name: "黄金都城",
      image: "goldenHorizonCapital",
      cardImage: "goldenHorizonCapital",
      description: "地图中下方的黄金国度，七日见证、竞技场与城市社交在此汇集。",
      sections: [{
        id: "capital", label: "黄金都城", image: "goldenHorizonCapital",
        description: "城门、竞技场、酒馆与商行共同组成黄金都城。",
        facility: "golden-horizon",
      }],
    },
  ];
})(window.LifeGame);
