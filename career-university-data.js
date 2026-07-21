(function (LG) {
  const branches = {
    xia: {
      label: "夏国分校",
      asset: "worldXiaCampus",
      issuer: "国立大学夏国分校校务委员会",
      male: [
        "顾承泽", "林知远", "周明德",
      ],
      female: [
        "许清妍", "宋知夏", "唐静仪",
      ],
    },
    island: {
      label: "岛国分校",
      asset: "worldIslandCampus",
      issuer: "国立大学岛国分校校务委员会",
      male: [
        "佐藤悠真", "高桥健司", "中村正人",
      ],
      female: [
        "佐藤美咲", "高桥绫香", "中村奈绪",
      ],
    },
    rice: {
      label: "米国分校",
      asset: "worldRiceCampus",
      issuer: "国立大学米国分校校务委员会",
      male: [
        "伊森·卡特", "丹尼尔·布鲁克斯", "迈克尔·格兰特",
      ],
      female: [
        "艾米丽·卡特", "奥利维亚·布鲁克斯", "索菲娅·格兰特",
      ],
    },
  };
  const departments = ["本部"];
  const ranks = LG.careerRosterIdentity.rankLabels.university;

  function roster() {
    return Object.entries(branches).flatMap(([branch, meta]) =>
      departments.flatMap((department, departmentIndex) =>
        ranks.flatMap((rank, rankIndex) =>
          ["male", "female"].map((gender) => {
            const nameIndex = rankIndex;
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
