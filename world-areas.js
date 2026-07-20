(function (LG) {
  const areas = [
    {
      id: "xia",
      name: "夏国",
      image: "worldXiaCampus",
      cardImage: "roomXiaFlag",
      description: "熟悉的城市秩序被分成校园与社会两条街区，旧关系在不同年龄继续延伸。",
      sections: [
        {
          id: "campus",
          label: "校园",
          image: "worldXiaCampus",
          description: "大学街区、教务室与校友会客厅相连，帮助和指导都可能附带长期条件。",
          characters: ["qin", "shen"],
        },
        {
          id: "university",
          label: "国立大学·夏国分校",
          image: "worldXiaCampus",
          description: "国立大学夏国分校，设有本部、异界学科与职业学院，共十八名职业角色和三十六间正常、丧志个人房间。",
          characters: [],
          faction: "university",
          branch: "xia",
        },
        {
          id: "society",
          label: "社会",
          image: "worldXiaSociety",
          description: "写字楼、直播公司、餐饮店与中介机构组成一条不眠的城市工作线。",
          characters: ["lin", "su", "restaurantCouple", "agencyCouple"],
        },
      ],
    },
    {
      id: "island",
      name: "岛国",
      image: "worldIslandCampus",
      cardImage: "roomIslandFlag",
      description: "语言学校、互助组织与企业公寓彼此相连，校园和社会各有自己的门禁。",
      sections: [
        {
          id: "campus",
          label: "校园",
          image: "worldIslandCampus",
          description: "语言学校与封闭互助会藏在密集街巷里，归属感和判断力在此反复拉扯。",
          characters: ["reina", "mari"],
        },
        {
          id: "university",
          label: "国立大学·岛国分校",
          image: "worldIslandCampus",
          description: "国立大学岛国分校，设有本部、异界学科与职业学院，共十八名职业角色和三十六间正常、丧志个人房间。",
          characters: [],
          faction: "university",
          branch: "island",
        },
        {
          id: "society",
          label: "社会",
          image: "worldIslandSociety",
          description: "公寓管理室与企业合规楼隔着一站铁路，生活规则和职场规则同样严密。",
          characters: ["miki", "kaori"],
        },
      ],
    },
    {
      id: "rice",
      name: "米国",
      image: "worldRiceCampus",
      cardImage: "roomRiceFlag",
      description: "研究机构与高层职场分列两端，学术承诺和社会合同都等待重新审视。",
      sections: [
        {
          id: "campus",
          label: "校园",
          image: "worldRiceCampus",
          description: "研究楼、讲堂与研究生宿舍围绕中央校园展开，署名和前途都被写进项目表。",
          characters: ["evelyn"],
        },
        {
          id: "university",
          label: "国立大学·米国分校",
          image: "worldRiceCampus",
          description: "国立大学米国分校，设有本部、异界学科与职业学院，共十八名职业角色和三十六间正常、丧志个人房间。",
          characters: [],
          faction: "university",
          branch: "rice",
        },
        {
          id: "society",
          label: "社会",
          image: "worldRiceSociety",
          description: "高层办公室通向城外庄园，合同、担保和劳动记录决定每一扇门如何打开。",
          characters: ["claire", "ruth", "victoria"],
        },
        {
          id: "ranch",
          label: "米国牧场",
          image: "worldRiceSociety",
          description: "米国牧场职业角色的独立庄园区，设有十二间正常与丧志个人房间。",
          characters: [],
          faction: "ranch",
        },
      ],
    },
    {
      id: "blackStreet",
      name: "黑街",
      image: "worldBlackStreet",
      cardImage: "roomBlackStreet",
      description: "后室、车站角落与地下仓库组成了没有公开招牌的交易街区。",
      sections: [{
        id: "street",
        label: "黑街房间",
        image: "worldBlackStreet",
        description: "地下陈列室、封闭仓库与车站后室共享一条湿冷暗巷，每扇门都有自己的价码。",
        characters: ["japanOfficial", "usaOfficial", "streetThug", "beggar"],
      }, {
        id: "otherworld",
        label: "异界",
        image: "worldBlackStreet",
        description: "异界公会在黑街设置的职业角色区域，设有十二间正常与丧志个人房间。",
        characters: [],
        faction: "otherworld",
      }],
    },
    {
      id: "sanctuary",
      name: "心灵净化机构园区",
      image: "worldSanctuaryCampus",
      cardImage: "roomSanctuaryCampus",
      description: "三座虚构机构共享封闭园区，照护、纪律与个人边界在这里持续冲突。",
      sections: [{
        id: "campus",
        label: "园区房间",
        image: "worldSanctuaryCampus",
        description: "静修楼、慈善接待处与封闭谈话室围绕中庭排列，平静外观下藏着严格边界。",
        characters: ["qinghe", "ciyun", "agnes"],
      }, {
        id: "faction",
        label: "机构园区",
        image: "worldSanctuaryCampus",
        description: "机构园区职业角色的独立认证区域，设有十二间正常与丧志个人房间。",
        characters: [],
        faction: "sanctuary",
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
