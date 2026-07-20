(function (LG) {
  const normalAssets = {
    doctor: {
      male: "./assets/generated/career-doctor-male.d40e54e7.webp",
      female: "./assets/generated/career-doctor-female.dd2c2958.webp",
    },
    scholar: {
      male: "./assets/generated/career-scholar-male.8c2ee468.webp",
      female: "./assets/generated/career-scholar-female.f238ab8f.webp",
    },
    agent: {
      male: "./assets/generated/career-agent-male.479579a4.webp",
      female: "./assets/generated/career-agent-female.5002c0ca.webp",
    },
    assassin: {
      male: "./assets/generated/career-assassin-male.8b1bc41e.webp",
      female: "./assets/generated/career-assassin-female.325247f8.webp",
    },
    mercenary: {
      male: "./assets/generated/career-mercenary-male.66b9b671.webp",
      female: "./assets/generated/career-mercenary-female.d821274d.webp",
    },
    adventurer: {
      male: "./assets/generated/career-adventurer-male.1b5ba1e3.webp",
      female: "./assets/generated/career-adventurer-female.af71003d.webp",
    },
    engineer: {
      male: "./assets/generated/career-engineer-male.a6d95a11.webp",
      female: "./assets/generated/career-engineer-female.ed602995.webp",
    },
    mechanic: {
      male: "./assets/generated/career-mechanic-male.606361c3.webp",
      female: "./assets/generated/career-mechanic-female.731233e4.webp",
    },
    gene: {
      male: "./assets/generated/career-gene-male.d461c690.webp",
      female: "./assets/generated/career-gene-female.fd0cf7ae.webp",
    },
    cultivator: {
      male: "./assets/generated/career-cultivator-male.7b51144e.webp",
      female: "./assets/generated/career-cultivator-female.91a542a2.webp",
    },
  };
  const specialIds = new Set([
    "ranch-livestock", "sanctuary-essence",
    "paradise-foot", "domain-toilet", "otherworld-tribute",
  ]);

  function category(id) {
    return specialIds.has(id) || /^university-(xia|island|rice)-hound$/.test(id)
      ? "special" : "normal";
  }

  function genderKey(gender) {
    return gender === "female" ? "Female" : "Male";
  }

  function normalKey(id) {
    if (/^university-(xia|island|rice)-doctor$/.test(id)) return "doctor";
    if (/^university-(xia|island|rice)-agent$/.test(id)) return "agent";
    return normalAssets[id] ? id : null;
  }

  function mainSource(id, gender) {
    if (!id) return null;
    if (category(id) === "special") {
      return LG.CONFIG.assets[
        `protagonist${genderKey(gender)}PenitentiarySet`
      ] || null;
    }
    const key = normalKey(id);
    return normalAssets[key]?.[gender === "female" ? "female" : "male"] || null;
  }

  function previewSource(id, gender) {
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
    normalReady: true,
  };
})(window.LifeGame);
