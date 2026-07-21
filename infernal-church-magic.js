(function (LG) {
  const faiths = () => LG.INFERNAL_CHURCH_DATA.faiths;
  let previousRandom = -1;

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

  LG.infernalChurchMagic = {
    targetSource() {
      const state = LG.authority?.state?.();
      const gender = state?.gender === "female" ? "female" : "male";
      return LG.CONFIG.assets[gender === "female"
        ? "magicGasProtagonistFemale" : "magicGasProtagonistMale"];
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
