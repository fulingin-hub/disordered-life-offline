(function (LG) {
  function scene(src) {
    return { src, keepPortrait: true };
  }
  function assign(ids, src) {
    ids.forEach((id) => {
      LG.CG_ASSETS.events[id] = scene(src);
    });
  }

  assign(["shen-school", "shen-college", "shen-final"],
    LG.CONFIG.assets.worldXiaCampus);
  assign(["shen-company"], LG.CONFIG.assets.worldXiaSociety);
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
})(window.LifeGame);
