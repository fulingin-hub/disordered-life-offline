(function (LG) {
  const standard = {
    sanctuary: [
      {
        male: { name: "阿拉夫·梅塔", role: "机构园区·跨宗教见习引导师" },
        female: { name: "韩瑞妍", role: "机构园区·跨宗教见习引导师" },
      },
      {
        male: { name: "裴玄真", role: "机构园区·高级仪轨导师" },
        female: { name: "伊琳娜·沃尔科娃", role: "机构园区·教义研究导师" },
      },
    ],
    ranch: [
      {
        male: { name: "马特奥·里维拉", role: "米国牧场·巡场牛仔" },
        female: { name: "妮娅·卡特", role: "米国牧场·畜群巡护员" },
      },
      {
        male: { name: "科尔·惠特克", role: "米国牧场·经营庄主" },
        female: { name: "阿比盖尔·里德", role: "米国牧场·经营庄主" },
      },
    ],
    paradise: [
      {
        male: { name: "姜珉宇", role: "乐园·客户契约专员" },
        female: { name: "沈嘉宁", role: "乐园·行政事务专员" },
      },
      {
        male: { name: "黑川慎一", role: "乐园·企业运营组长" },
        female: { name: "艾莉丝·洛朗", role: "乐园·战略项目组长" },
      },
    ],
    domain: [
      {
        male: { name: "韩道允", role: "异域·海外招募宣讲员" },
        female: { name: "雨宫凛", role: "异域·组织联络专员" },
      },
      {
        male: { name: "维克托·奥尔洛夫", role: "异域·跨境事务高级干事" },
        female: { name: "苏绯", role: "异域·区域组织高级干事" },
      },
    ],
    otherworld: [
      {
        male: { name: "凯尔·夜风", role: "异界·游侠剑队长" },
        female: { name: "莉拉·白枝", role: "异界·边境游侠队长" },
      },
      {
        male: { name: "瓦伦·烬痕", role: "异界·战斗法术管理官" },
        female: { name: "塞琳·幽幕", role: "异界·秘法战团管理官" },
      },
    ],
  };
  const leaders = {
    sanctuary: {
      male: {
        name: "阿南达·维伦",
        role: "机构园区·跨宗教议会首席教祖",
      },
      female: {
        name: "塞拉菲娜·沃斯",
        role: "机构园区·圣约议会首席教祖",
      },
    },
    ranch: {
      male: {
        name: "奥古斯特·惠特克",
        role: "米国牧场·北境牧区总牧大领主",
      },
      female: {
        name: "维多利亚·卡特",
        role: "米国牧场·联邦牧区总牧大领主",
      },
    },
    paradise: {
      male: {
        name: "高桥慎司",
        role: "乐园·终产集团执行总主管",
      },
      female: {
        name: "沈知恩",
        role: "乐园·契约事务执行总主管",
      },
    },
    domain: {
      male: {
        name: "九条玄真",
        role: "异域·四境宗亲议会总领袖",
      },
      female: {
        name: "叶卡捷琳娜·沃尔科娃",
        role: "异域·跨境家族议会总领袖",
      },
    },
    otherworld: {
      male: {
        name: "阿尔德里克·黑曜",
        role: "异界·黑曜战团界域大统领",
      },
      female: {
        name: "塞蕾娜·星渊",
        role: "异界·星渊议会界域大统领",
      },
    },
  };
  const universityLeaders = {
    xia: {
      "本部": {
        male: { name: "周明德", title: "常务校长" },
        female: { name: "唐静仪", title: "校务总长" },
      },
    },
    island: {
      "本部": {
        male: { name: "中村正人", title: "学园长" },
        female: { name: "中村奈绪", title: "校务执行长" },
      },
    },
    rice: {
      "本部": {
        male: { name: "迈克尔·格兰特", title: "校务总监" },
        female: { name: "索菲娅·格兰特", title: "执行校长" },
      },
    },
  };
  const universityTitles = {
    "本部": ["学术辅导员", "教务主任"],
  };
  const rankLabels = {
    university: ["学术导员", "教务主任", "校长"],
    sanctuary: ["见习引导师", "高级导师", "首席教祖"],
    ranch: ["巡场牛仔", "经营庄主", "总牧大领主"],
    paradise: ["事务专员", "运营组长", "执行总主管"],
    domain: ["招募专员", "高级干事", "宗族总领袖"],
    otherworld: ["游侠队长", "战团管理官", "界域大统领"],
  };

  function standardIdentity(faction, rankIndex, gender) {
    if (rankIndex === 2) return leaders[faction]?.[gender] || null;
    return standard[faction]?.[rankIndex]?.[gender] || null;
  }

  function universityRole(branchLabel, department, rankIndex) {
    if (rankIndex >= 2) return null;
    const title = universityTitles[department]?.[rankIndex];
    return title ? `${branchLabel}·${department}·${title}` : null;
  }

  function universityIdentity(branch, branchLabel, department, rankIndex, gender) {
    if (rankIndex !== 2) return null;
    const profile = universityLeaders[branch]?.[department]?.[gender];
    return profile ? {
      name: profile.name,
      role: `${branchLabel}·${department}·${profile.title}`,
    } : null;
  }

  LG.careerRosterIdentity = {
    rankLabels,
    standardIdentity,
    universityIdentity,
    universityRole,
  };
})(window.LifeGame);
