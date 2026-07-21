(function (LG) {
  LG.CAREER_DATA.roster.forEach((character) => {
    const items = [{
      title: "角色立绘",
      caption: `${LG.CAREER_DATA.characterLabel(character)}的个人立绘。`,
      src: LG.careerPortraits.characterSource(character),
      alt: `${character.name}角色立绘`,
      fit: "contain",
      position: "center",
    }];
    if (character.rankIndex === 2) {
      const hidden = LG.careerPortraits.hiddenSetSource(character);
      if (hidden) {
        items.push({
          title: "势力隐秘套装立绘",
          caption: `${character.branchLabel
            || LG.CAREER_DATA.factions[character.faction].name}对应的隐秘套装立绘。`,
          src: hidden,
          alt: `${character.name}对应势力隐秘套装立绘`,
          fit: "contain",
          position: "center",
        });
      }
    }
    LG.GALLERY_ASSETS[character.id] = { name: character.name, items };
  });
})(window.LifeGame);
