(function (LG) {
  const branches = {
    xia: {
      label: "夏国分校",
      asset: "worldXiaCampus",
      issuer: "国立大学夏国分校校务委员会",
      male: [
        "顾承泽", "林知远", "周明德",
        "沈砚舟", "陆景行", "韩启文",
        "赵修远", "苏怀瑾", "秦正则",
      ],
      female: [
        "许清妍", "宋知夏", "唐静仪",
        "叶书宁", "江晚晴", "程雅君",
        "温若兰", "白清越", "谢明薇",
      ],
    },
    island: {
      label: "岛国分校",
      asset: "worldIslandCampus",
      issuer: "国立大学岛国分校校务委员会",
      male: [
        "佐藤悠真", "高桥健司", "中村正人",
        "伊藤拓海", "山本直树", "小林诚",
        "渡边修司", "加藤雅人", "吉田隆之",
      ],
      female: [
        "佐藤美咲", "高桥绫香", "中村奈绪",
        "伊藤春香", "山本千寻", "小林优子",
        "渡边玲奈", "加藤真纪", "吉田由美",
      ],
    },
    rice: {
      label: "米国分校",
      asset: "worldRiceCampus",
      issuer: "国立大学米国分校校务委员会",
      male: [
        "伊森·卡特", "丹尼尔·布鲁克斯", "迈克尔·格兰特",
        "诺亚·米勒", "亚历山大·里德", "本杰明·沃克",
        "卢卡斯·摩根", "亨利·贝克", "塞缪尔·库珀",
      ],
      female: [
        "艾米丽·卡特", "奥利维亚·布鲁克斯", "索菲娅·格兰特",
        "艾娃·米勒", "夏洛特·里德", "阿米莉亚·沃克",
        "米娅·摩根", "哈珀·贝克", "伊芙琳·库珀",
      ],
    },
  };
  const departments = ["本部", "异界学科", "职业学院"];
  const ranks = LG.careerRosterIdentity.rankLabels.university;

  function roster() {
    return Object.entries(branches).flatMap(([branch, meta]) =>
      departments.flatMap((department, departmentIndex) =>
        ranks.flatMap((rank, rankIndex) =>
          ["male", "female"].map((gender) => {
            const nameIndex = departmentIndex * ranks.length + rankIndex;
            const identity = LG.careerRosterIdentity.universityIdentity(
              branch, meta.label, department, rankIndex, gender);
            const originalRole = `${meta.label}·${department}${
              gender === "male" ? "男" : "女"}${rank}`;
            return {
              id: `university-${branch}-${departmentIndex + 1}-${rankIndex + 1}-${gender}`,
              faction: "university",
              branch,
              branchLabel: meta.label,
              department,
              rankIndex,
              gender,
              name: identity?.name || meta[gender][nameIndex],
              role: identity?.role || LG.careerRosterIdentity.universityRole(
                meta.label, department, rankIndex) || originalRole,
              specialKey: `university-${branch}`,
              pieces: [1, 2, 2][rankIndex],
              asset: meta.asset,
            };
          }))));
  }

  LG.CAREER_UNIVERSITY_DATA = { branches, departments, ranks, roster: roster() };
})(window.LifeGame);
