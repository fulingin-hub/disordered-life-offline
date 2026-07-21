(function (LG) {
  const faiths = () => LG.INFERNAL_CHURCH_DATA.faiths;
  let previousRandom = -1;
  const previousPortrait = {};
  const fallbackJobs = {
    normal: [
      "doctor", "scholar", "agent", "assassin", "mercenary",
      "adventurer", "engineer", "mechanic", "gene", "cultivator",
    ],
    advanced: [
      "first-element-scholar", "first-special-force", "first-imperial-guard",
      "first-soldier-king", "first-commander", "first-war-master",
      "first-mecha-master", "first-extreme-evolution",
      "first-immortal-cultivator",
    ],
  };

  function knownSin(id) {
    return faiths().find((faith) => faith.id === id) || null;
  }

  function queenSin(source) {
    return LG.INFERNAL_CLUB_DATA?.queens?.find((queen) =>
      queen.title === source || String(source).includes(queen.name))?.id || null;
  }

  function believerSin() {
    const data = LG.infernalChurch?.data?.();
    return data?.activeBooks?.length && knownSin(data.faith) ? data.faith : null;
  }

  function randomSin() {
    const choices = faiths();
    let index = Math.floor(Math.random() * choices.length);
    if (choices.length > 1 && index === previousRandom) {
      index = (index + 1) % choices.length;
    }
    previousRandom = index;
    return choices[index].id;
  }

  function randomCareerPortrait(category, gender) {
    const definitions = LG.career?.data?.()?.professionDefinitions || [];
    const ids = [...new Set([
      ...definitions.map((job) => job.id),
      ...fallbackJobs[category],
    ])].filter((id) => LG.careerPortraits?.category?.(id) === category);
    const candidates = ids.map((id) => ({
      id,
      src: LG.careerPortraits?.mainSource?.(id, gender),
    })).filter((item) => item.src);
    const key = `${gender}:${category}`;
    let index = Math.floor(Math.random() * candidates.length);
    if (candidates.length > 1 && candidates[index]?.id === previousPortrait[key]) {
      index = (index + 1) % candidates.length;
    }
    previousPortrait[key] = candidates[index]?.id;
    return candidates[index] || null;
  }

  function targetPortrait(options = {}) {
    const state = LG.authority?.state?.();
    const gender = state?.gender === "female" ? "female" : "male";
    const church = LG.infernalChurch?.data?.() || {};
    const count = Math.max(0, Number(church.roomCastCount) || 0)
      + Number(Boolean(options.roomCharacter));
    if (church.baptized) {
      return {
        src: LG.CONFIG.assets[gender === "female"
          ? "magicGasThrallFemale" : "magicGasThrallMale"],
        tier: "thrall", count,
        label: "洗礼后的光头魔纹贱奴职业立绘",
      };
    }
    const tier = count >= 100 ? "advanced" : "normal";
    const portrait = randomCareerPortrait(tier, gender);
    return {
      src: portrait?.src || LG.CONFIG.assets[gender === "female"
        ? "protagonistFemaleBase" : "protagonistMaleBase"],
      tier, count,
      label: tier === "advanced" ? "随机一转职业立绘" : "随机普通职业立绘",
    };
  }

  LG.infernalChurchMagic = {
    targetPortrait,
    targetSource(options) {
      return targetPortrait(options).src;
    },
    resolve(source, explicitSin) {
      const queen = knownSin(explicitSin)?.id || queenSin(source);
      const believer = queen ? null : believerSin();
      const id = queen || believer || randomSin();
      return {
        ...knownSin(id),
        mode: queen ? "queen" : believer ? "faith" : "random",
      };
    },
  };
})(window.LifeGame);
