(function (LG) {
  const scenes = {
    penitentiarySupervisor: [
      "一级巡逻", "顾寒霜在影狱走廊挥动警棍进行巡逻演练。",
      "galleryShadowPrisonSupervisor",
    ],
    penitentiaryManager: [
      "二级巡逻", "北条绫在管理区挥动警棍检查巡逻路线。",
      "galleryShadowPrisonManager",
    ],
    penitentiaryInstructor: [
      "三级巡逻", "维拉·科瓦奇在训练区挥动警棍进行执勤演练。",
      "galleryShadowPrisonInstructor",
    ],
    penitentiaryWarden: [
      "四级巡逻", "塞西莉亚·格兰特在监区挥动警棍执行夜间巡逻。",
      "galleryShadowPrisonWarden",
    ],
    penitentiaryOwner: [
      "办公室休息", "伊莎贝拉·诺克斯在影狱顶层办公室短暂休息。",
      "galleryShadowPrisonOwner",
    ],
  };
  LG.PENITENTIARY_DATA.roles.forEach((role) => {
    const [title, caption, asset] = scenes[role.id];
    LG.GALLERY_ASSETS[role.id] = {
      name: role.name,
      items: [
        {
          title: `${role.role}档案`,
          caption: `${role.name}在影狱任务体系中的人物立绘档案。`,
          src: role.portrait,
          alt: `${role.name}人物立绘`,
          fit: "contain",
          position: "center top",
        },
        {
          title, caption, src: LG.CONFIG.assets[asset],
          alt: `${role.name}${title}CG`,
          fit: "contain",
          position: "center",
        },
      ],
    };
  });
})(window.LifeGame);
