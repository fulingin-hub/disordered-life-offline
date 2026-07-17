(function (LG) {
  const base = "./assets/generated/";
  const meta = {
    tights: ["黑丝正装", "角色标志性的黑丝职业造型"],
    barefoot: ["裸足休息", "房间内自然放松的裸足造型"],
    lingerie: ["缎面私房装", "大众级缎面睡衣与长袍造型"],
    bodysuit: ["黑丝连体舞台装", "不透明连体服与黑丝的背身时装造型"],
    footDetail: ["步履造型细节", "大众级鞋履与自然站姿构图"],
  };
  const customMeta = {
    su: {
      footDetail: ["裸足踩踏", "苏绯在私人影棚做出无接触的裸足踩踏动作。"],
    },
    shen: {
      footDetail: ["裸足踩踏", "沈静秋在私人备课室做出无接触的裸足踩踏动作。"],
    },
    reina: {
      footDetail: ["裸足踩踏", "高桥玲奈在语言教室做出无接触的裸足踩踏动作。"],
    },
    miki: {
      footDetail: ["裸足踩踏", "佐藤美纪在公寓管理室做出无接触的裸足踩踏动作。"],
    },
    restaurantCouple: {
      lingerie: ["夫妻睡袍相拥", "闭店后的夫妻轻吻相拥，睡袍与裸足前景造型。"],
    },
    agencyCouple: {
      lingerie: ["夫妻睡袍相拥", "办公室夜晚的夫妻轻吻相拥，睡袍与裸足前景造型。"],
    },
  };
  const sources = {
    lin: {
      tights: "gallery-lin-tights.73477b8a.webp",
      barefoot: "gallery-lin-barefoot.131e8d0a.webp",
      lingerie: "gallery-lin-lingerie.8039ee4c.webp",
      bodysuit: "gallery-lin-bodysuit.c68476b6.webp",
      footDetail: "gallery-lin-foot-detail.80b14a01.webp",
    },
    qin: {
      tights: "gallery-qin-tights.fbb8dd49.webp",
      barefoot: "gallery-qin-barefoot.e7537103.webp",
      lingerie: "gallery-qin-lingerie.4a86aea2.webp",
      bodysuit: "gallery-qin-bodysuit.9765dc7c.webp",
      footDetail: "gallery-qin-foot-detail.30d0bc44.webp",
    },
    su: {
      tights: "gallery-su-tights.540d5151.webp",
      barefoot: "gallery-su-barefoot.8cb4a96f.webp",
      lingerie: "gallery-su-lingerie.d24200a1.webp",
      bodysuit: "gallery-su-bodysuit.c045c280.webp",
      footDetail: "gallery-su-foot-detail.73fec513.webp",
    },
    shen: {
      tights: "gallery-shen-tights.b3367765.webp",
      barefoot: "gallery-shen-barefoot.15d62f2c.webp",
      lingerie: "gallery-shen-lingerie.489226b1.webp",
      bodysuit: "gallery-shen-bodysuit.60312643.webp",
      footDetail: "gallery-shen-foot-detail.1538910e.webp",
    },
    reina: {
      tights: "gallery-reina-tights.d89459a4.webp",
      barefoot: "gallery-reina-barefoot.b065c7c2.webp",
      lingerie: "gallery-reina-lingerie.09c8f963.webp",
      bodysuit: "gallery-reina-bodysuit.c599f099.webp",
      footDetail: "gallery-reina-foot-detail.c5dec8c3.webp",
    },
    miki: {
      tights: "gallery-miki-tights.8888ffd4.webp",
      barefoot: "gallery-miki-barefoot.8161353f.webp",
      lingerie: "gallery-miki-lingerie.d0ea7264.webp",
      bodysuit: "gallery-miki-bodysuit.5a642ea7.webp",
      footDetail: "gallery-miki-foot-detail.e63dd4d1.webp",
    },
    mari: {
      tights: "gallery-mari-tights.db0f67f0.webp",
      barefoot: "gallery-mari-barefoot.61ab4ad0.webp",
      lingerie: "gallery-mari-lingerie.fd58c546.webp",
      bodysuit: "gallery-mari-bodysuit.d3af96e6.webp",
      footDetail: "gallery-mari-foot-detail.6e983aab.webp",
    },
    evelyn: {
      tights: "gallery-evelyn-tights.c43445a9.webp",
      barefoot: "gallery-evelyn-barefoot.d55ad4dd.webp",
      lingerie: "gallery-evelyn-lingerie.dcbff485.webp",
      bodysuit: "gallery-evelyn-bodysuit.0f609ed5.webp",
      footDetail: "gallery-evelyn-foot-detail.28212f89.webp",
    },
    claire: {
      tights: "gallery-claire-tights.8f1c59f7.webp",
      barefoot: "gallery-claire-barefoot.96a9a855.webp",
      lingerie: "gallery-claire-lingerie.32ec905f.webp",
      bodysuit: "gallery-claire-bodysuit.9ed65c76.webp",
      footDetail: "gallery-claire-foot-detail.69dceada.webp",
    },
    ruth: {
      tights: "gallery-ruth-tights.d0aacb2f.webp",
      barefoot: "gallery-ruth-barefoot.802520e1.webp",
      lingerie: "gallery-ruth-lingerie.5b68a736.webp",
      bodysuit: "gallery-ruth-bodysuit.62b6ec56.webp",
      footDetail: "gallery-ruth-foot-detail.18918d7d.webp",
    },
    qinghe: {
      tights: "gallery-qinghe-tights.ccca8e78.webp",
      barefoot: "gallery-qinghe-barefoot.09c91b8c.webp",
      lingerie: "gallery-qinghe-lingerie.263a4f91.webp",
      bodysuit: "gallery-qinghe-bodysuit.5949650d.webp",
      footDetail: "gallery-qinghe-foot-detail.aaeca14e.webp",
    },
    ciyun: { tights: "gallery-ciyun-tights-rear.60e0833e.webp", barefoot: "gallery-ciyun-barefoot-rear-rest.20e33d79.webp", bodysuit: "gallery-ciyun-bodysuit.e210c496.webp" },
    agnes: { tights: "gallery-agnes-formal-tights.c17b549c.webp", barefoot: "gallery-agnes-barefoot-rest.11cb441f.webp", bodysuit: "gallery-agnes-bodysuit.42096e51.webp" },
    restaurantCouple: {
      lingerie: "gallery-restaurant-couple-romance.6a5ee4af.webp",
      bodysuit: "gallery-restaurantCouple-bodysuit.9452815c.webp",
    },
    agencyCouple: {
      lingerie: "gallery-agency-couple-romance.a83c40c7.webp",
      bodysuit: "gallery-agencyCouple-bodysuit.8a4e9f87.webp",
    },
  };
  const storyGalleries = {
    kaori: [
      ["黑丝连体舞台装", "不透明连体服与黑丝的背身时装造型。", `${base}gallery-kaori-bodysuit.cdff7dfd.webp`],
      ["沙发裸足前压", "黑田香织坐在公司沙发上，以裸足向前压近镜头。", `${base}gallery-kaori-barefoot-press.27ca7842.webp`],
    ],
    victoria: [
      ["黑丝连体舞台装", "不透明连体服与黑丝的背身时装造型。", `${base}gallery-victoria-bodysuit.cc53570f.webp`],
      ["沙发裸足前压", "维多利亚坐在公司沙发上，以裸足向前压近镜头。", `${base}gallery-victoria-barefoot-press-v2.93457ae8.webp`],
    ],
    streetThug: [
      ["裸足休息", "女混混在后室卸下战术靴后的完整着装休息造型。", `${base}gallery-street-thug-barefoot.3c13fe13.webp`],
      ["钱包踩踏", "女混混在后室赤足踩住主角的钱包，展示贡金关系中的财物控制。", `${base}gallery-street-thug-wallet-stomp.a883d755.webp`],
    ],
    beggar: [
      ["裸足休息", "女乞丐在夜间车站卸下旧鞋后的完整着装休息造型。", `${base}gallery-beggar-barefoot.7c5fa3d8.webp`],
      ["跪地乞讨", "女乞丐在车站以背侧跪姿伸出纸杯，展示完整着装轮廓与裸足造型。", `${base}gallery-beggar-kneeling-barefoot.77745118.webp`],
    ],
  };
  const marketGalleries = {
    japanOfficial: [
      ["军装裸足", "白石绫华在地下陈列室卸下长靴后的完整着装裸足造型。", `${base}gallery-japan-official-barefoot.68748fe5.webp`],
      ["黑丝踩踏", "白石绫华以黑丝军装造型从低位视角施加无伤害的地位压迫。", `${base}gallery-japan-official-tights-trample.96928e7b.webp`],
    ],
    usaOfficial: [
      ["军装裸足", "玛格丽特·凯恩在封闭办公室卸下长靴后的完整着装裸足造型。", `${base}gallery-usa-official-barefoot.37bac03b.webp`],
      ["黑丝踩踏", "玛格丽特·凯恩以黑丝军装造型从低位视角施加无伤害的地位压迫。", `${base}gallery-usa-official-tights-trample.4db392f3.webp`],
    ],
  };
  const extraGalleries = {
    qinghe: [["宗教跪坐", "清和在清虚观以完整道袍后侧跪坐，展示服装轮廓与裸足。", `${base}gallery-qinghe-religious-kneeling-barefoot.0806de5d.webp`]],
    ciyun: [
      ["宗教跪坐", "慈云在慈莲院以完整礼袍后侧跪坐，展示服装轮廓与裸足。", `${base}gallery-ciyun-religious-kneeling-barefoot.58f47a9e.webp`],
      ["连体舞台装·侧影", "慈云身着不透明连体舞台装，在静室中展示完整服装侧影。", `${base}gallery-ciyun-bodysuit.510add14.webp`],
      ["黑丝跪坐", "慈云身着黑丝礼装在静室跪坐，展示完整服装轮廓。", `${base}gallery-ciyun-tights-kneeling.a6bc6deb.webp`],
    ],
    agnes: [["宗教跪坐", "艾格尼丝在晨光修院以完整制服后侧跪坐，展示服装轮廓与裸足。", `${base}gallery-agnes-religious-kneeling-barefoot.ba247f46.webp`]],
    restaurantCouple: [
      ["周启明裸足踩踏", "周启明在闭店后的餐厅以裸足向镜头做出无接触踩踏动作。", `${base}gallery-restaurant-couple-male-barefoot-stomp.1905a28e.webp`],
      ["罗雯黑丝踩踏", "罗雯在闭店后的餐厅以黑丝向镜头做出无接触踩踏动作。", `${base}gallery-restaurant-couple-female-tights-stomp.456bcb2a.webp`],
    ],
    agencyCouple: [
      ["杜衡黑丝短袜踩踏", "杜衡在中介办公室以透明黑色短袜向镜头做出无接触踩踏动作。", `${base}gallery-agency-couple-male-sheer-socks-stomp.8483d424.webp`],
      ["许曼裸足踩踏", "许曼在中介办公室以裸足向镜头做出无接触踩踏动作。", `${base}gallery-agency-couple-female-barefoot-stomp.a22b952d.webp`],
    ],
  };
  LG.GALLERY_ASSETS = {};
  Object.values(LG.COLLECTIBLE_CHARACTERS).forEach(({ id, name }) => {
    if (storyGalleries[id]) {
      const items = storyGalleries[id].map(([title, caption, src]) => ({
        title, caption, src, alt: `${name}${title}CG`,
        fit: LG.tribute?.isCharacter(id) ? "contain" : "cover", position: "center",
      }));
      LG.GALLERY_ASSETS[id] = { name, items };
      return;
    }
    const items = ["tights", "barefoot", "lingerie", "bodysuit", "footDetail"]
      .filter((variant) => sources[id]?.[variant]).map((variant) => {
      const dedicated = sources[id]?.[variant];
      const itemMeta = customMeta[id]?.[variant] || meta[variant];
      const isFootDetail = variant === "footDetail";
      const isCoupleRomance = variant === "lingerie" && Boolean(customMeta[id]);
      return {
        title: itemMeta[0],
        caption: itemMeta[1],
        src: `${base}${dedicated}`,
        alt: `${name}${itemMeta[0]}CG`,
        fit: isCoupleRomance ? "contain" : isFootDetail ? "cover" : "contain",
        position: isCoupleRomance ? "center bottom" : "center",
      };
    });
    (extraGalleries[id] || []).forEach(([title, caption, src]) => {
      items.push({ title, caption, src, alt: `${name}${title}CG`, fit: "cover", position: "center" });
    });
    LG.GALLERY_ASSETS[id] = { name, items };
  });
  Object.values(LG.BLACK_MARKET_DATA.characters).forEach(({ id, name }) => {
    const items = marketGalleries[id].map(([title, caption, src]) => ({
      title, caption, src, alt: `${name}${title}CG`, fit: "contain", position: "center",
    }));
    LG.GALLERY_ASSETS[id] = { name, items };
  });
})(window.LifeGame);
