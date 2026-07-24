(function (LG) {
  const ids = new Set([
    "fallen-saint-mindless",
    "queen-greed-livestock", "queen-lust-livestock",
    "queen-wrath-livestock", "queen-sloth-livestock",
    "queen-pride-livestock", "queen-envy-livestock",
    "queen-gluttony-livestock",
  ]);

  function source(id, gender) {
    if (id === "fallen-saint-mindless") {
      return LG.CONFIG.assets[gender === "female"
        ? "careerFallenSaintMindlessFemale"
        : "careerFallenSaintMindlessMale"];
    }
    const sin = /^queen-(greed|lust|wrath|sloth|pride|envy|gluttony)-livestock$/
      .exec(id)?.[1];
    const queen = sin ? LG.INFERNAL_CLUB_DATA?.byId?.[sin] : null;
    return queen ? LG.CONFIG.assets[
      gender === "female" ? queen.apostleFemale : queen.apostleMale] : null;
  }

  LG.restrictedCareerPortraits = { has: (id) => ids.has(id), source };
})(window.LifeGame);
