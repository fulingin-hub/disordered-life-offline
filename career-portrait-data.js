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
  const specialAssets = {
    "university-xia-hound": {
      male: "./assets/generated/career-special-university-xia-hound-male.0371e221.webp",
      female: "./assets/generated/career-special-university-xia-hound-female.78b203d3.webp",
    },
    "university-island-hound": {
      male: "./assets/generated/career-special-university-island-hound-male.ae875a56.webp",
      female: "./assets/generated/career-special-university-island-hound-female.940b83fb.webp",
    },
    "university-rice-hound": {
      male: "./assets/generated/career-special-university-rice-hound-male.8003edc2.webp",
      female: "./assets/generated/career-special-university-rice-hound-female.5555a128.webp",
    },
    "ranch-livestock": {
      male: "./assets/generated/career-special-ranch-livestock-respirator-male.9ecaf8b8.webp",
      female: "./assets/generated/career-special-ranch-livestock-respirator-female.ec106369.webp",
    },
    "sanctuary-essence": {
      male: "./assets/generated/career-special-sanctuary-essence-ritual-male.b55a3ece.webp",
      female: "./assets/generated/career-special-sanctuary-essence-ritual-female.2f1deb60.webp",
    },
    "paradise-foot": {
      male: "./assets/generated/career-special-paradise-foot-soul-male.e258c981.webp",
      female: "./assets/generated/career-special-paradise-foot-soul-female.cd406732.webp",
    },
    "domain-toilet": {
      male: "./assets/generated/career-special-domain-toilet-alchemy-male.eca9c359.webp",
      female: "./assets/generated/career-special-domain-toilet-alchemy-female.4dd7a4d7.webp",
    },
    "otherworld-tribute": {
      male: "./assets/generated/career-special-otherworld-tribute-command-male.4b31cebc.webp",
      female: "./assets/generated/career-special-otherworld-tribute-command-female.371c2d14.webp",
    },
  };
  const specialIds = new Set([
    "ranch-livestock", "sanctuary-essence",
    "paradise-foot", "domain-toilet", "otherworld-tribute",
  ]);
  const universityJobs = {
    "本部": ["scholar", "doctor", "engineer"],
    "异界学科": ["adventurer", "cultivator", "scholar"],
    "职业学院": ["mechanic", "agent", "engineer"],
  };
  const factionJobs = {
    sanctuary: ["scholar", "cultivator", "doctor"],
    ranch: ["mercenary", "gene", "engineer"],
    paradise: ["agent", "engineer", "doctor"],
    domain: ["assassin", "agent", "mercenary"],
    otherworld: ["adventurer", "mechanic", "cultivator"],
  };
  const rosterRanks = {
    university: ["guide", "director", "leader"],
    sanctuary: ["guide", "mentor", "leader"],
    ranch: ["herder", "owner", "leader"],
    paradise: ["employee", "teamlead", "leader"],
    domain: ["follower", "senior", "leader"],
    otherworld: ["captain", "manager", "leader"],
  };

  function category(id) {
    if (id?.startsWith("first-")) return "advanced";
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
    if (category(id) === "advanced") {
      return LG.careerAdvancements?.source?.(id, gender) || null;
    }
    if (category(id) === "special") {
      return specialAssets[id]?.[gender === "female" ? "female" : "male"]
        || LG.CONFIG.assets[`protagonist${genderKey(gender)}PenitentiarySet`]
        || null;
    }
    const key = normalKey(id);
    return normalAssets[key]?.[gender === "female" ? "female" : "male"] || null;
  }

  function previewSource(id, gender) {
    return mainSource(id, gender);
  }

  function characterSource(character) {
    const rank = rosterRanks[character.faction]?.[character.rankIndex];
    const prefix = character.faction === "university"
      ? `university-${character.branch}` : character.faction;
    const gender = character.gender === "female" ? "female" : "male";
    const rosterAsset = rank
      ? LG.careerRosterAssets?.[`${prefix}-${rank}`]?.[gender] : null;
    const jobs = character.faction === "university"
      ? universityJobs[character.department]
      : factionJobs[character.faction];
    const key = jobs?.[character.rankIndex];
    return rosterAsset || normalAssets[key]?.[gender]
      || LG.CONFIG.assets[character.asset]
      || LG.CONFIG.assets.background;
  }

  function bonus(job) {
    if (!job) return "尚未装备职业。";
    if (job.tier === 1) {
      const label = (id) => LG.CAREER_DATA.stats[id] || id;
      return `人生事件${label(job.base)}获得量×10；职业大师套装使${
        label(job.mode)}获得量×7；职业耗材套装使羞耻获得量×7。专精：${
        job.mastery || "进阶职业能力"}。`;
    }
    if (job.specialFaction) {
      return "可装备对应势力的特殊图鉴职业勋章，并解锁职业耗材套装装备资格。";
    }
    const label = (id) => LG.CAREER_DATA.stats[id] || id;
    return `人生事件${label(job.base)}获得量×5；职业大师套装使${
      label(job.mode)}获得量×5；职业耗材套装使羞耻获得量×5。`;
  }

  LG.careerPortraits = {
    category,
    characterSource,
    mainSource,
    previewSource,
    bonus,
    normalReady: true,
  };
})(window.LifeGame);
