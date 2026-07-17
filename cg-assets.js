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
  LG.CG_ASSETS.endingSrc = function (id, gender) {
    return this.genderEndings[gender]?.[id] || this.endings[id];
  };
})(window.LifeGame);
