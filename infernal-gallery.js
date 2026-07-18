(function (LG) {
  const throneCg = {
    greed: "./assets/generated/infernal-gallery-greed-throne.314d68ee.webp",
    lust: "./assets/generated/infernal-gallery-lust-throne.42772a0a.webp",
    wrath: "./assets/generated/infernal-gallery-wrath-throne.ea814b13.webp",
    sloth: "./assets/generated/infernal-gallery-sloth-throne.7f6e657a.webp",
    pride: "./assets/generated/infernal-gallery-pride-throne.c0594895.webp",
    envy: "./assets/generated/infernal-gallery-envy-throne.76de7bbc.webp",
    gluttony: "./assets/generated/infernal-gallery-gluttony-throne.d235ffe4.webp",
  };
  const throneCaptions = {
    lust: "紫晶王座上的女魔王独自休息，完整礼装与王座构成单人仪式场景。",
    sloth: "女魔王在绯梦王座上休息，同层女魔在王座侧前方完成土下座礼仪。",
    envy: "女魔王端坐霜银王座，同层女魔在冰晶宫殿中完成土下座礼仪。",
    gluttony: "翠宴王座上的女魔王独自休息，宴会宫殿中没有其他侍从。",
  };
  LG.INFERNAL_CLUB_DATA.queens.forEach((queen) => {
    const layer = LG.INFERNAL_DATA.byId[queen.id];
    const items = [
      {
        title: `${queen.name}女魔王立绘`,
        caption: `${queen.name}地狱包间主人，以完整魔王礼装现身。`,
        src: LG.CONFIG.assets[layer.queen],
        alt: `${queen.title}角色立绘`,
        fit: "contain",
        position: "center bottom",
      },
      {
        title: `${queen.name}王座仪式`,
        caption: throneCaptions[queen.id]
          || `${queen.name}女魔王接受同层魔女的跪姿侍奉，裸足向前展示威仪。`,
        src: throneCg[queen.id],
        alt: `${queen.title}王座仪式CG`,
        fit: "contain",
        position: "center",
      },
    ];
    if (queen.id === "lust") {
      items.push({
        title: "色欲王室足部理疗",
        caption: "紫晶女王在王座上接受丝袜女侍的正式足部按摩服务。",
        src: "./assets/generated/infernal-gallery-lust-foot-massage.a6c6077a.webp",
        alt: "色欲地狱女魔王足部理疗CG",
        fit: "contain",
        position: "center",
      });
      items.push({
        title: "色欲紫晶夜憩",
        caption: "紫晶女王在月夜包间中以黑丝王室礼装独自休息。",
        src: "./assets/generated/infernal-gallery-lust-amethyst-rest.c5d4abd2.webp",
        alt: "色欲地狱女魔王紫晶夜憩CG",
        fit: "contain",
        position: "center",
      });
    }
    LG.GALLERY_ASSETS[queen.character] = {
      name: queen.title,
      items,
    };
  });
})(window.LifeGame);
