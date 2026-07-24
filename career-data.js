(function (LG) {
  const stats = {
    knowledge: "学识", health: "健康", autonomy: "自主", dependence: "依赖",
    dignity: "尊严", social: "人际", money: "资金", shame: "羞耻",
  };
  const factions = {
    university: {
      name: "国立大学", proof: "国立大学入学证明",
      location: "夏国分校 / 岛国分校 / 米国分校",
      copy: "国立大学下设夏国分校、岛国分校、米国分校。加入后可进入三个分校本部，毕业即就业。",
      ranks: LG.careerRosterIdentity.rankLabels.university, asset: "worldXiaCampus",
    },
    sanctuary: {
      name: "机构园区", proof: "机构园区的机构认证书", location: "心灵净化机构园区",
      copy: "这里是信仰者的圣地，以论证的角度看待世界，收容被世界抛弃的孩子们，欢迎加入我们。",
      ranks: LG.careerRosterIdentity.rankLabels.sanctuary, asset: "worldSanctuaryCampus",
    },
    ranch: {
      name: "米国牧场", proof: "米国牧场的勋章", location: "米国 · 社会",
      copy: "自由者天堂，这里没有多余规则。欢迎强者、科学家与新的合作者。",
      ranks: LG.careerRosterIdentity.rankLabels.ranch, asset: "ruth",
    },
    paradise: {
      name: "乐园", proof: "乐园的契约合同", location: "终产者的乐园 · 乐园",
      copy: "我们拥有充足资金。富足、忠诚与可靠规则构成这里的契约，现在即可递交简历。",
      ranks: LG.careerRosterIdentity.rankLabels.paradise, asset: "edenGoldenDistrict",
    },
    domain: {
      name: "异域", proof: "异域的宣传手册", location: "异域赌场",
      copy: "初来者都会茫然。想加入就来找我们，这里用家人的默契接纳新的成员。",
      ranks: LG.careerRosterIdentity.rankLabels.domain, asset: "roomCasino",
    },
    otherworld: {
      name: "异界", proof: "异界的宣传手册", location: "灰色地带",
      copy: "想前往我们的故乡吗？加入后可免费学习异界知识，更快融入当地。",
      ranks: LG.careerRosterIdentity.rankLabels.otherworld, asset: "roomBlackStreet",
    },
    church: {
      name: "魔纹教会", proof: "七大欲的信仰契约", location: "灰色地带 · 魔纹教会",
      copy: "接受魔纹洗礼解锁魔纹贱畜，十万羞耻晋升魔纹使徒，再以七层地狱战绩成为魔纹领主。",
      ranks: [], asset: "infernalChurchSanctuary",
    },
    "holy-light": {
      name: "圣光教团", proof: "圣光追随者证明", location: "圣徒据点",
      copy: "由圣徒建立的圣光追随者教团。",
      ranks: [], asset: "worldSanctuaryCampus",
    },
  };

  function roster() {
    const domainNames = [
      ["小弟", "小妹"], ["大哥", "大姐"], ["男爹", "女爹"],
    ];
    const standard = Object.entries(factions)
      .filter(([faction]) => !["university", "church"].includes(faction))
      .flatMap(([faction, meta]) =>
      meta.ranks.flatMap((rank, rankIndex) => ["male", "female"].map((gender) => {
        const identity = LG.careerRosterIdentity.standardIdentity(
          faction, rankIndex, gender);
        return {
          id: `${faction}-${rankIndex + 1}-${gender}`,
          faction,
          rankIndex,
          gender,
          name: identity?.name || (faction === "domain"
            ? domainNames[rankIndex][gender === "male" ? 0 : 1]
            : `${gender === "male" ? "男" : "女"}${rank}`),
          role: identity?.role,
          pieces: [1, 2, 2][rankIndex],
          asset: meta.asset,
        };
      })));
    const doctrine = [
      {
        id: "church-priestess", faction: "church", rankIndex: 0,
        gender: "female", name: "七大欲女司祭", role: "魔纹教会·教主",
        pieces: 1, asset: "infernalChurchPriestess",
      },
      {
        id: "holy-light-saint", faction: "holy-light", rankIndex: 0,
        gender: "female", name: "圣徒", role: "圣光教团·建立者",
        pieces: 1, asset: "protagonistFemaleSaintSet",
      },
    ];
    return [...LG.CAREER_UNIVERSITY_DATA.roster, ...standard, ...doctrine];
  }

  const normalItems = [
    ["联系方式", "所属势力的正式联络方式。"],
    ["重点笔记", "记录职业训练重点的内部笔记。"],
    ["考核资料", "用于晋升与职业考核的完整资料。"],
    ["优秀证明", "由所属势力签发的优秀证明。"],
    ["大师勋章", "第五件普通收藏。装备后每轮人生六大属性值各增加600点。"],
  ];
  const privateItems = [
    ["私密丝袜", "角色房间中保存的私密衣物收藏。"],
    ["擦鞋布", "带有角色个人印记的鞋履护理布。"],
    ["私人高跟鞋", "仅在私密商城记录的鞋履收藏。"],
    ["服从记录", "记录主角与角色之间私密规则的档案。"],
  ];

  function specialItem(character) {
    if (character.rankIndex === 0) return [
      "令人上瘾的足踏面部按摩",
      "不小心闻到了结果不出意外地上瘾了。不能继续闻了，再闻一会，就一会……",
    ];
    if (character.rankIndex === 1) return [
      "恶意的戒断治疗",
      `${character.name}知道症状后主动帮助戒断，每次只能闻一小会。应该已经痊愈了。`,
    ];
    return [
      "脚底契约",
      `自愿签署契约，为神圣高贵的${character.name}在其脚下服务一生。`,
    ];
  }

  function items(character, privacy) {
    const source = privacy === "normal"
      ? normalItems : [...privateItems, specialItem(character)];
    return source.map(([name, description], index) => ({
      id: `${character.id}-${privacy}-${index + 1}`,
      character: character.id, privacy, index: index + 1,
      name: `${character.name}的${name}`, description,
    }));
  }

  function characterLabel(character) {
    return character.role ? `${character.name} · ${character.role}` : character.name;
  }

  LG.CAREER_DATA = {
    stats, factions, roster: roster(), items, characterLabel,
    universityBranches: LG.CAREER_UNIVERSITY_DATA.branches,
  };
})(window.LifeGame);
