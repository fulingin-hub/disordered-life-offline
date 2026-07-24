(function (LG) {
  const galleryItems = {
    casinoBunny: {
      title: "兔女郎的服侍",
      caption: "伊琳娜在休息室保持一贯的冷淡，以正式跪坐姿态完成私人服侍。",
      src: "./assets/generated/gallery-casino-bunny-service.7756c633.webp",
      alt: "伊琳娜兔女郎的服侍",
    },
    casinoLead: {
      title: "女领班的鄙夷",
      caption: "叶卡捷琳娜抬起鞋跟，以毫不掩饰的嘲讽宣告领班的威严。",
      src: "./assets/generated/gallery-casino-lead-scorn.2349d1fb.webp",
      alt: "叶卡捷琳娜女领班的鄙夷",
    },
    casinoManager: {
      title: "女店长的诱惑",
      caption: "韩智妍在办公室短暂卸下高跟鞋，依旧掌控着谈话的节奏。",
      src: "./assets/generated/gallery-casino-manager-temptation.b9fe1650.webp",
      alt: "韩智妍女店长的诱惑",
    },
    casinoOwner: {
      title: "女老板的私密生活",
      caption: "闭店之后，尹瑞英换上睡袍，在私人沙发上享受难得的独处时刻。",
      src: "./assets/generated/gallery-casino-owner-private-life.92e0f270.webp",
      alt: "尹瑞英女老板的私密生活",
    },
  };

  LG.CASINO_DATA.characters.forEach((character) => {
    const special = galleryItems[character.id];
    LG.GALLERY_ASSETS[character.id] = {
      name: character.name,
      items: [
        {
          title: "赌场角色档案",
          caption: `${character.role}在异域赌场的角色档案。`,
          src: character.portrait,
          alt: `${character.name}赌场角色档案`,
          fit: "contain",
          position: "center top",
        },
        {
          ...special,
          fit: "cover",
          position: "center",
        },
      ],
    };
  });
})(window.LifeGame);
