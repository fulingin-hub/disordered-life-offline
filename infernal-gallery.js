(function (LG) {
  const throneCg = {
    greed: "./assets/generated/infernal-gallery-greed-throne.0f2c7615.webp",
    lust: "./assets/generated/infernal-gallery-lust-throne.83ab5492.webp",
    wrath: "./assets/generated/infernal-gallery-wrath-throne.4c0ddf72.webp",
    sloth: "./assets/generated/infernal-gallery-sloth-throne.a53dc46b.webp",
    pride: "./assets/generated/infernal-gallery-pride-throne.a22eb384.webp",
    envy: "./assets/generated/infernal-gallery-envy-throne.c8251574.webp",
    gluttony: "./assets/generated/infernal-gallery-gluttony-throne.ec815a5d.webp",
  };
  const throneCaptions = {
    lust: "紫晶王座上的女魔王独自休息，完整礼装与王座构成单人仪式场景。",
    sloth: "女魔王在绯梦王座上休息，同层女魔在王座侧前方完成土下座礼仪。",
    envy: "女魔王端坐霜银王座，同层女魔在冰晶宫殿中完成土下座礼仪。",
    gluttony: "翠宴王座上的女魔王独自休息，宴会宫殿中没有其他侍从。",
  };
  const apostlePose = {
    greed: "./assets/generated/infernal-greed-queen-apostle-pose.e6f0947b.webp",
    lust: "./assets/generated/infernal-lust-queen-apostle-pose.caac3da8.webp",
    wrath: "./assets/generated/infernal-wrath-queen-apostle-pose.2d52a172.webp",
    sloth: "./assets/generated/infernal-sloth-queen-apostle-pose.9eb02fd6.webp",
    pride: "./assets/generated/infernal-pride-queen-apostle-pose.923b684a.webp",
    envy: "./assets/generated/infernal-envy-queen-apostle-pose.8ec77fa1.webp",
    gluttony: "./assets/generated/infernal-gluttony-queen-apostle-pose.6d5d15e3.webp",
  };
  LG.INFERNAL_CLUB_DATA.queens.forEach((queen) => {
    const layer = LG.INFERNAL_DATA.byId[queen.id];
    const assetName = queen.id[0].toUpperCase() + queen.id.slice(1);
    const seatedMale = LG.CONFIG.assets[
      `infernalClub${assetName}SeatedMale`];
    const seatedFemale = LG.CONFIG.assets[
      `infernalClub${assetName}SeatedFemale`];
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
      {
        title: `七罪使徒·${queen.name}女魔王单人图`,
        caption: `从七罪使徒仪式中单独收录的${queen.name}女魔王完整姿态。`,
        src: apostlePose[queen.id],
        alt: `七罪使徒${queen.name}女魔王单人CG`,
        fit: "contain",
        position: "center bottom",
      },
      {
        title: `${queen.name}使徒套装·男主`,
        caption: `${queen.name}女魔王与男主角共同展示完整使徒套装。`,
        src: LG.CONFIG.assets[queen.apostleMale],
        alt: `${queen.name}女魔王男主使徒套装CG`,
        fit: "contain",
        position: "center bottom",
      },
      {
        title: `${queen.name}使徒套装·女主`,
        caption: `${queen.name}女魔王与女主角共同展示完整使徒套装。`,
        src: LG.CONFIG.assets[queen.apostleFemale],
        alt: `${queen.name}女魔王女主使徒套装CG`,
        fit: "contain",
        position: "center bottom",
      },
    ];
    [
      ["男主", seatedMale, LG.CONFIG.assets[queen.apostleMale]],
      ["女主", seatedFemale, LG.CONFIG.assets[queen.apostleFemale]],
    ].forEach(([gender, src, original]) => {
      if (!src || src === original) return;
      items.push({
        title: `${queen.name}女王背负仪式·${gender}`,
        caption: `${queen.name}女魔王端坐于${gender}使徒背部的完整仪式CG。`,
        src,
        alt: `${queen.name}女魔王坐在${gender}使徒背部CG`,
        fit: "contain",
        position: "center bottom",
      });
    });
    if (queen.id === "lust") {
      items.push({
        title: "色欲王室足部理疗",
        caption: "紫晶女王在王座上接受丝袜女侍的正式足部按摩服务。",
        src: "./assets/generated/infernal-gallery-lust-foot-massage.4a1ef20c.webp",
        alt: "色欲地狱女魔王足部理疗CG",
        fit: "contain",
        position: "center",
      });
      items.push({
        title: "色欲紫晶夜憩",
        caption: "紫晶女王在月夜包间中以黑丝王室礼装独自休息。",
        src: "./assets/generated/infernal-gallery-lust-amethyst-rest.5dbc55c8.webp",
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
  LG.INFERNAL_DATA.layers.forEach((layer) => {
    LG.GALLERY_ASSETS[layer.witchCharacter] = {
      name: layer.mobTitle,
      items: [{
        title: `${layer.name}魔女立绘`,
        caption: `${layer.mobTitle}以完整魔境礼装现身，可回放五套画廊动画。`,
        src: LG.CONFIG.assets[layer.witch],
        alt: `${layer.mobTitle}角色立绘`,
        fit: "contain",
        position: "center bottom",
      }],
    };
  });
})(window.LifeGame);
