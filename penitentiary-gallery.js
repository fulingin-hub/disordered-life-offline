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
  const extraScenes = {
    penitentiarySupervisor: [
      ["走廊督察", "顾寒霜在影狱走廊执行近距离纪律督察。",
        "./assets/generated/penitentiary-supervisor-foot.1c41c710.webp"],
      ["黄金封锁", "顾寒霜以黄金封锁阵列接管证物库。",
        "./assets/generated/penitentiary-supervisor-gold.201d887d.webp"],
      ["圣水检查", "顾寒霜在检查室启动蓝色圣水净化程序。",
        "./assets/generated/penitentiary-supervisor-water.0f943767.webp"],
      ["灵魂供奉", "顾寒霜在仪式平台记录上交的灵魂之火。",
        "./assets/generated/penitentiary-supervisor-offering.e2fb8583.webp"],
      ["监控支配", "顾寒霜在监控室收束所有指令权限。",
        "./assets/generated/penitentiary-supervisor-control.fe6a8b50.webp"],
    ],
    penitentiaryManager: [
      ["管理督察", "北条绫沿检查网格核对影狱管理记录。",
        "./assets/generated/penitentiary-manager-foot.72f95f92.webp"],
      ["黄金账本", "北条绫在会计库中启动黄金封锁账本。",
        "./assets/generated/penitentiary-manager-gold.ec3d27fc.webp"],
      ["净化流程", "北条绫在净化关卡执行蓝色圣水检查。",
        "./assets/generated/penitentiary-manager-water.9c562b78.webp"],
      ["钥匙供奉", "北条绫将灵魂之火收束到影狱钥匙环。",
        "./assets/generated/penitentiary-manager-offering.6b3c1769.webp"],
      ["门禁支配", "北条绫在中央门禁台下达统一封锁指令。",
        "./assets/generated/penitentiary-manager-control.74f4ac62.webp"],
    ],
    penitentiaryInstructor: [
      ["训练督察", "维拉·科瓦奇在训练场执行近距离纪律考核。",
        "./assets/generated/penitentiary-instructor-foot.33ee9fc9.webp"],
      ["黄金考核", "维拉·科瓦奇以黄金训练器材检验服从纪律。",
        "./assets/generated/penitentiary-instructor-gold.bc064876.webp"],
    ],
  };
  LG.PENITENTIARY_DATA.roles.forEach((role) => {
    const [title, caption, asset] = scenes[role.id];
    const extras = (extraScenes[role.id] || []).map(
      ([extraTitle, extraCaption, src]) => ({
        title: extraTitle,
        caption: extraCaption,
        src,
        alt: `${role.name}${extraTitle}CG`,
        fit: "contain",
        position: "center",
      }));
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
        ...extras,
      ],
    };
  });
})(window.LifeGame);
