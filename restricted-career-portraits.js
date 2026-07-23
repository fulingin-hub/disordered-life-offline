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
      return gender === "female"
        ? "./assets/generated/career-special-university-xia-hound-female.a4c737e9.webp"
        : "./assets/generated/career-special-university-xia-hound-male.39a53bf0.webp";
    }
    const sin = /^queen-(greed|lust|wrath|sloth|pride|envy|gluttony)-livestock$/
      .exec(id)?.[1];
    const queen = sin ? LG.INFERNAL_CLUB_DATA?.byId?.[sin] : null;
    return queen ? LG.CONFIG.assets[
      gender === "female" ? queen.apostleFemale : queen.apostleMale] : null;
  }

  LG.restrictedCareerPortraits = { has: (id) => ids.has(id), source };
})(window.LifeGame);
