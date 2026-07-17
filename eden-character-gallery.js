(function (LG) {
  const galleries = {
    edenChef: {
      name: "塞拉菲娜",
      assets: [
        ["办公室里的命令",
          "塞拉菲娜在闭店后的办公室做出克制的赤足踏步姿态。",
          "galleryEdenChefBarefoot", "塞拉菲娜办公室赤足姿态CG"],
        ["制服礼仪",
          "塞拉菲娜穿着厨师制服与黑色丝袜，在办公室正式跪坐。",
          "galleryEdenChefKneeling", "塞拉菲娜制服黑丝跪坐CG"],
      ],
    },
    edenFashion: {
      name: "奥蕾莉亚",
      assets: [
        ["高定店闭店之后",
          "奥蕾莉亚在高定店办公室做出克制的赤足踏步姿态。",
          "galleryEdenFashionBarefoot", "奥蕾莉亚办公室赤足姿态CG"],
        ["试衣镜外的礼仪",
          "奥蕾莉亚穿着高定制服与黑色丝袜，在办公室正式跪坐。",
          "galleryEdenFashionKneeling", "奥蕾莉亚制服黑丝跪坐CG"],
      ],
    },
  };
  Object.entries(galleries).forEach(([id, gallery]) => {
    const character = LG.EDEN_CHARACTER_DATA.byId[id];
    LG.GALLERY_ASSETS[id] = {
      name: gallery.name,
      items: [{
        title: `${character.role}档案`,
        caption: `${character.name}在伊甸园中的常规角色立绘。`,
        src: character.portrait,
        alt: `${character.name}人物立绘`,
        fit: "contain",
        position: "center top",
      }, ...gallery.assets.map(([title, caption, asset, alt]) => ({
        title, caption, src: LG.CONFIG.assets[asset], alt,
        fit: "contain", position: "center",
      }))],
    };
  });
})(window.LifeGame);
