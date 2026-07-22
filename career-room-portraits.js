(function (LG) {
  function source(character, privacy = "normal") {
    if (!character) return LG.CONFIG.assets.background;
    const normal = LG.careerPortraits.characterSource(character);
    if (privacy !== "private") return normal;
    return LG.careerPortraits.hiddenSetSource(character) || normal;
  }

  function hasContrast(character) {
    return Boolean(character
      && source(character, "normal") !== source(character, "private"));
  }

  LG.careerRoomPortraits = { source, hasContrast };
})(window.LifeGame);
