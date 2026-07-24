(function (LG) {
  function scene(src) {
    return { src, safe: true };
  }
  function assign(ids, src) {
    ids.forEach((id) => {
      LG.CG_ASSETS.events[id] = scene(src);
    });
  }

  assign(["shen-school", "shen-college", "shen-final"],
    LG.CONFIG.assets.worldXiaCampus);
  assign(["shen-company"], LG.CONFIG.assets.worldXiaSociety);
  assign(["magic-calamity-year-one"],
    "./assets/generated/cg-calamity-global-news.0fc4908b.webp");
  assign(["endgame-guild-hub"],
    "./assets/generated/gallery-otherworld-receptionist.945c408a.webp");
  assign(["reina-guidance", "reina-exam", "reina-final"],
    LG.CONFIG.assets.worldIslandCampus);
  assign(["miki-house", "miki-theft", "miki-final"],
    LG.CONFIG.assets.worldIslandSociety);
  assign(["cult-sermon", "cult-baptism", "cult-final",
    "cult-contract-final"], LG.CONFIG.assets.infernalChurchSanctuary);
  assign(["evelyn-lab", "evelyn-stimulant", "evelyn-final"],
    LG.CONFIG.assets.worldRiceCampus);
  assign(["claire-contract", "claire-leverage", "claire-final",
    "ruth-invitation", "ruth-conditioning", "ruth-final"],
    LG.CONFIG.assets.worldRiceSociety);

  ["qinghe", "ciyun", "agnes"].forEach((name) => {
    assign(["indoctrination", "tribute", "privacy", "property", "records",
      "normal", "final"].map((suffix) => `${name}-${suffix}`),
      LG.CONFIG.assets.worldSanctuaryCampus);
  });

  const portraitScenes = {
    shen: "worldXiaCampus",
    restaurantCouple: "worldXiaSociety",
    agencyCouple: "worldXiaSociety",
    qin: "worldXiaSociety",
    lin: "worldXiaSociety",
    su: "worldXiaSociety",
    streetThug: "worldBlackStreet",
    beggar: "worldBlackStreet",
    japanOfficial: "worldIslandSociety",
    reina: "worldIslandCampus",
    miki: "worldIslandSociety",
    mari: "infernalChurchSanctuary",
    usaOfficial: "worldRiceSociety",
    evelyn: "worldRiceCampus",
    claire: "worldRiceSociety",
    ruth: "worldRiceSociety",
    kaori: "worldXiaSociety",
    victoria: "worldXiaSociety",
    qinghe: "worldSanctuaryCampus",
    ciyun: "worldSanctuaryCampus",
    agnes: "worldSanctuaryCampus",
  };

  function inferred(event) {
    const id = event?.id || "";
    const text = `${id} ${event?.chapter || ""} ${event?.title || ""}`;
    if (/birth|first-boundary|frail-refuge|降生|童年/.test(text)) {
      return LG.CONFIG.assets.playerRoom;
    }
    if (/mari|cult|church|魔纹|教会/.test(text)) {
      return LG.CONFIG.assets.infernalChurchSanctuary;
    }
    if (/qinghe|ciyun|agnes|sanctuary|机构|清修/.test(text)) {
      return LG.CONFIG.assets.worldSanctuaryCampus;
    }
    if (/reina|island|japan|岛国/.test(text)) {
      return /exam|college|campus|大学|校园|教师/.test(text)
        ? LG.CONFIG.assets.worldIslandCampus : LG.CONFIG.assets.worldIslandSociety;
    }
    if (/evelyn|claire|ruth|rice|usa|米国/.test(text)) {
      return /lab|college|campus|大学|实验|教授/.test(text)
        ? LG.CONFIG.assets.worldRiceCampus : LG.CONFIG.assets.worldRiceSociety;
    }
    if (/street|beggar|official|黑市|街头|团伙/.test(text)) {
      return LG.CONFIG.assets.worldBlackStreet;
    }
    if (/school|college|exam|graduation|campus|学校|大学|考试|毕业|补习/.test(text)) {
      return LG.CONFIG.assets.worldXiaCampus;
    }
    return LG.CONFIG.assets.worldXiaSociety;
  }

  function resolve(event, { safeOnly = false } = {}) {
    const explicit = LG.CG_ASSETS.events[event?.id];
    if (!safeOnly && typeof explicit === "string") return { src: explicit };
    if (explicit?.src && (!safeOnly || explicit.safe)) return explicit;
    const asset = portraitScenes[event?.portrait];
    return scene(asset ? LG.CONFIG.assets[asset] : inferred(event));
  }

  LG.eventSceneAssets = { resolve };
})(window.LifeGame);
