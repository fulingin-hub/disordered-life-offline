(function (LG) {
  const normalAssets = {
    doctor: "TraitSet", scholar: "TraitSet",
    agent: "JapanSet", assassin: "JapanSet",
    mercenary: "InfernalSet", adventurer: "InfernalSet",
    engineer: "LuxurySet", mechanic: "LuxurySet",
    gene: "EdenSet", cultivator: "EdenSet",
  };
  const specialIds = new Set([
    "university-hound", "ranch-livestock", "sanctuary-essence",
    "paradise-foot", "domain-toilet", "otherworld-tribute",
  ]);

  function category(id) {
    return specialIds.has(id) ? "special" : "normal";
  }

  function genderKey(gender) {
    return gender === "female" ? "Female" : "Male";
  }

  function mainSource(id, gender) {
    if (!id) return null;
    const suffix = category(id) === "special"
      ? "PenitentiarySet" : normalAssets[id] || "TraitSet";
    return LG.CONFIG.assets[`protagonist${genderKey(gender)}${suffix}`] || null;
  }

  function previewSource(id, gender) {
    if (category(id) === "special") {
      return LG.CG_ASSETS?.genderEndings?.[gender]
        ?.["otherworld-pair-slaughterhouse"] || mainSource(id, gender);
    }
    return mainSource(id, gender);
  }

  function bonus(job) {
    if (!job) return "尚未装备职业。";
    if (job.specialFaction) {
      return "可装备对应势力的特殊图鉴职业勋章，并解锁职业耗材套装装备资格。";
    }
    const label = (id) => LG.CAREER_DATA.stats[id] || id;
    return `人生事件${label(job.base)}获得量×5；职业大师套装使${
      label(job.mode)}获得量×5；职业耗材套装使羞耻获得量×5。`;
  }

  LG.careerPortraits = {
    category,
    mainSource,
    previewSource,
    bonus,
    pending: true,
  };
})(window.LifeGame);
