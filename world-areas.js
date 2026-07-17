(function (LG) {
  const areas = [
    {
      id: "xia",
      name: "夏国",
      image: "qin",
      description: "熟悉的城市秩序被分成校园与社会两条街区，旧关系在不同年龄继续延伸。",
      sections: [
        { id: "campus", label: "校园", characters: ["qin", "shen"] },
        {
          id: "society",
          label: "社会",
          characters: ["lin", "su", "restaurantCouple", "agencyCouple"],
        },
      ],
    },
    {
      id: "island",
      name: "岛国",
      image: "reina",
      description: "语言学校、互助组织与企业公寓彼此相连，校园和社会各有自己的门禁。",
      sections: [
        { id: "campus", label: "校园", characters: ["reina", "mari"] },
        { id: "society", label: "社会", characters: ["miki", "kaori"] },
      ],
    },
    {
      id: "rice",
      name: "米国",
      image: "evelyn",
      description: "研究机构与高层职场分列两端，学术承诺和社会合同都等待重新审视。",
      sections: [
        { id: "campus", label: "校园", characters: ["evelyn"] },
        { id: "society", label: "社会", characters: ["claire", "ruth", "victoria"] },
      ],
    },
    {
      id: "blackStreet",
      name: "黑街",
      image: "streetThug",
      description: "后室、车站角落与地下仓库组成了没有公开招牌的交易街区。",
      sections: [{
        id: "street",
        label: "黑街房间",
        characters: ["japanOfficial", "usaOfficial", "streetThug", "beggar"],
      }],
    },
    {
      id: "sanctuary",
      name: "心灵净化机构园区",
      image: "qinghe",
      description: "三座虚构机构共享封闭园区，照护、纪律与个人边界在这里持续冲突。",
      sections: [{
        id: "campus",
        label: "园区房间",
        characters: ["qinghe", "ciyun", "agnes"],
      }],
    },
  ];

  function unlocked(id) {
    return LG.blackMarket.isCharacter(id)
      ? LG.blackMarket.roomUnlocked(id) : LG.achievements.isUnlocked(id);
  }

  LG.worldAreas = {
    all() {
      return areas;
    },
    get(id) {
      return areas.find((area) => area.id === id) || null;
    },
    progress(area) {
      const ids = area.sections.flatMap((section) => section.characters);
      return { count: ids.filter(unlocked).length, total: ids.length };
    },
  };
})(window.LifeGame);
