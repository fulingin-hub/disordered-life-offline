(function (LG) {
  LG.OTHERWORLD_CHARACTER_DATA.characters.forEach((character) => {
    LG.GALLERY_ASSETS[character.id] = {
      name: character.name,
      items: [
        {
          title: "异界联盟角色档案",
          caption: `${character.role}在${character.location}的正式立绘。`,
          src: character.portrait,
          alt: `${character.name}角色立绘`,
          fit: "contain",
          position: "center top",
        },
        {
          title: "特殊会面",
          caption: `${character.name}在工作场所展示特殊钥匙与收费账单。`,
          src: character.gallery,
          alt: `${character.name}特殊会面立绘`,
          fit: "contain",
          position: "center top",
        },
      ],
    };
  });
})(window.LifeGame);
