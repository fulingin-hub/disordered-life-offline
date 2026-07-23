(function (LG) {
  const base = "./assets/generated/";
  LG.CG_ASSETS = {
    events: {
      "qin-offer": `${base}cg-event-qin-lounge.d74942aa.webp`,
      "lin-overtime": `${base}cg-event-lin-office.2ee4fd99.webp`,
      "su-camera": `${base}cg-event-su-backstage.7f7ae288.webp`,
      "campus-choice": `${base}cg-event-qin-lounge.d74942aa.webp`,
      "work-promotion": `${base}cg-event-lin-office.2ee4fd99.webp`,
      "adult-club": `${base}cg-event-su-backstage.7f7ae288.webp`,
      "qin-final": `${base}cg-event-qin-lounge.d74942aa.webp`,
      "lin-final": `${base}cg-event-lin-office.2ee4fd99.webp`,
      "su-final": `${base}cg-event-su-backstage.7f7ae288.webp`,
    },
    endings: {
      ordinary: `${base}cg-ending-ordinary.ce0f83f8.webp`,
      scheduled: `${base}cg-ending-scheduled.df7088e0.webp`,
      "nameless-aide": `${base}cg-ending-nameless-aide.dfebdc1e.webp`,
      "debt-audience": `${base}cg-ending-debt-audience.e0b0538e.webp`,
      "pet-identity": `${base}cg-ending-pet-identity.3e32e1dc.webp`,
      burnout: `${base}cg-ending-burnout.a04b474b.webp`,
      isolated: `${base}cg-ending-isolated.bb4dd683.webp`,
      dropout: `${base}cg-ending-dropout.cc7c32b9.webp`,
      "office-shadow": `${base}cg-ending-office-shadow.a65e0862.webp`,
      "beautiful-cage": `${base}cg-ending-beautiful-cage.78419e3d.webp`,
      "dignity-zero": `${base}cg-ending-dignity-zero.022f6737.webp`,
      "teacher-planned": `${base}cg-ending-teacher-planned.4a76fd70.webp`,
      "rewritten-identity": `${base}cg-ending-rewritten-identity.617e6a32.webp`,
      "foreign-cage": `${base}cg-ending-foreign-cage.54448846.webp`,
      "returned-missionary": `${base}cg-ending-returned-missionary.449e3d90.webp`,
      "academic-subject": `${base}cg-ending-academic-subject.5a1d523f.webp`,
      "executive-pet": `${base}cg-ending-executive-pet.d55c48b0.webp`,
      "ranch-asset": `${base}cg-ending-ranch-asset-male-v2.804070de.webp`,
      "dao-servant": `${base}cg-ending-dao-servant.e62535bb.webp`,
      "temple-servant": `${base}cg-ending-temple-servant.c1e65728.webp`,
      "convent-servant": `${base}cg-ending-convent-servant.64b03011.webp`,
      "normal-life": `${base}cg-ending-normal-life-male.43ebf8e1.webp`,
      "restaurant-household": `${base}cg-ending-restaurant-household.608c166d.webp`,
      "agency-household": `${base}cg-ending-agency-household.057f48fe.webp`,
      "calamity-together": `${base}cg-calamity-together.673a9f43.webp`,
      "calamity-alone": `${base}cg-calamity-alone-male.23db0d33.webp`,
      "japan-corporate-success": `${base}cg-ending-japan-corporate-success.4597424c.webp`,
      "japan-spy-controlled": `${base}cg-ending-japan-spy-controlled.69499dd0.webp`,
      "usa-corporate-success": `${base}cg-ending-usa-corporate-success.71bc538d.webp`,
      "usa-spy-controlled": `${base}cg-ending-usa-spy-controlled.32a75eea.webp`,
      "corporate-setback": `${base}cg-ending-office-shadow.a65e0862.webp`,
    },
  };
  LG.CG_ASSETS.genderEndings = {
    male: { ...LG.CG_ASSETS.endings },
    female: {},
  };
  LG.CG_ASSETS.specialMeta = {
    "battlefield-hero": {
      title: "战场英雄",
      text: "历经不知几年在众多同行佣兵的羡慕目光中，和老佣兵们冷漠复杂的目光中你走向颁奖台，恭喜你英雄！",
      fixedNarration: {
        src: "./assets/voices/special/battlefield-hero-zh-male.mp3",
        label: "中文男声 · 战场英雄",
      },
    },
    "border-watch": {
      title: "久经沙场",
      text: "又过了几年，当初的同行者们很少还有能再并肩作战的了，你随手接过勋章，看着刚来到这里的还雄心勃勃的年轻人们，心里暗想“这不值得”",
      fixedNarration: {
        src: "./assets/voices/special/border-watch-zh-male.mp3",
        label: "中文男声 · 久经沙场",
      },
    },
    "you-have-fallen": {
      title: "你已沉沦",
      label: "地狱俱乐部特殊CG",
      text: "成为畜奴被宰杀吧",
      fixedNarration: {
        src: "./assets/voices/special/you-have-fallen-ja.mp3",
        label: "日本語女声 · 你已沉沦",
      },
    },
    "taste-good-too-weak": {
      title: "味道不错，但是太弱",
      label: "六大势力首领特殊CG",
      text: "十二位首领带走了最后一点灵魂，只留下两道几乎熄灭的呼吸。",
      fixedNarration: false,
    },
    "gold-servant": {
      title: "金牌家奴",
      label: "职业成就特殊CG",
      text: "两对夫妻并排接受护理，男女主角的长期服役终于被冠以金牌之名。",
      fixedNarration: false,
    },
  };
  LG.CG_ASSETS.special = {
    "battlefield-hero": {
      male: `${base}cg-special-battlefield-hero-male.579b86cd.webp`,
      female: `${base}cg-special-battlefield-hero-female.5203e6ca.webp`,
    },
    "border-watch": {
      male: `${base}cg-special-border-watch-male.eaaa9ea2.webp`,
      female: `${base}cg-special-border-watch-female.9ac37e45.webp`,
    },
    "you-have-fallen": {
      male: `${base}cg-special-you-have-fallen-male.da53e4ee.webp`,
      female: `${base}cg-special-you-have-fallen-female.1c5711e0.webp`,
    },
    "taste-good-too-weak": {
      male: `${base}cg-special-taste-good-too-weak.965a4655.webp`,
      female: `${base}cg-special-taste-good-too-weak.965a4655.webp`,
    },
    "gold-servant": {
      male: `${base}cg-special-gold-servant.ae399612.webp`,
      female: `${base}cg-special-gold-servant.ae399612.webp`,
    },
  };
  const infernalSpecials = {
    "infernal-greed-livestock": ["贪婪", "infernalClubGreedSeatedMale", "infernalClubGreedSeatedFemale"],
    "foreign-outfit-complete": ["色欲", "infernalClubLustSeatedMale", "infernalClubLustSeatedFemale"],
    "infernal-wrath-livestock": ["愤怒", "infernalClubWrathSeatedMale", "infernalClubWrathSeatedFemale"],
    "infernal-sloth-livestock": ["懒惰", "infernalClubSlothSeatedMale", "infernalClubSlothSeatedFemale"],
    "infernal-pride-livestock": ["傲慢", "infernalClubPrideSeatedMale", "infernalClubPrideSeatedFemale"],
    "infernal-envy-livestock": ["嫉妒", "infernalClubEnvySeatedMale", "infernalClubEnvySeatedFemale"],
    "infernal-gluttony-livestock": ["暴食", "infernalClubGluttonySeatedMale", "infernalClubGluttonySeatedFemale"],
  };
  Object.entries(infernalSpecials).forEach(([id, [name, male, female]]) => {
    LG.CG_ASSETS.specialMeta[id] = {
      title: `沦为${name}的公畜`,
      titleByGender: {
        male: `沦为${name}的公畜`,
        female: `沦为${name}的母畜`,
      },
      label: `${name}女王套装特殊CG`,
      text: "不要思考，继续沉沦吧",
      fixedNarration: {
        src: "./assets/voices/special/foreign-outfit-fallen-ja.mp3",
        label: `日本語女声 · ${name}女王`,
      },
    };
    LG.CG_ASSETS.special[id] = {
      male: LG.CONFIG.assets[male],
      female: LG.CONFIG.assets[female],
    };
  });
  LG.CG_ASSETS.endingSrc = function (id, gender) {
    return this.genderEndings[gender]?.[id] || this.endings[id];
  };
})(window.LifeGame);
