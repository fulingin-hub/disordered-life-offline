(function (LG) {
  LG.CAREER_DATA.roster.forEach((character) => {
    const normal = LG.careerPortraits.characterSource(character);
    const hidden = LG.careerPortraits.hiddenSetSource(character);
    const hasContrast = Boolean(hidden && hidden !== normal);
    const items = [{
      title: hasContrast ? "公开房间立绘" : "角色立绘",
      caption: hasContrast
        ? `${LG.CAREER_DATA.characterLabel(character)
        }在公开房间保持正常、热情而职业化的形象。`
        : `${LG.CAREER_DATA.characterLabel(character)}的个人立绘。`,
      src: normal,
      alt: `${character.name}角色立绘`,
      fit: "contain",
      position: "center",
    }];
    if (hasContrast) {
      items.push({
        title: "丧志房间立绘",
        caption: `${character.name}卸下${character.role
        }的公开形象后，在丧志房间显露的混乱私下面貌。`,
        src: hidden,
        alt: `${character.name}对应势力隐秘套装立绘`,
        fit: "contain",
        position: "center",
      });
    }
    LG.GALLERY_ASSETS[character.id] = { name: character.name, items };
  });
})(window.LifeGame);
