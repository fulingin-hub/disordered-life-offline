(function (LG) {
  LG.careerArtUI = {
    figure(data) {
      const gender = LG.authority.state()?.gender === "female" ? "Female" : "Male";
      const key = data.outfitMode === "master"
        ? `protagonist${gender}LuxurySet`
        : data.outfitMode === "consumable"
          ? `protagonist${gender}PenitentiarySet`
          : `protagonist${gender}TraitSet`;
      const figure = document.createElement("figure");
      figure.className = "career-outfit-art";
      const image = document.createElement("img");
      image.src = LG.CONFIG.assets[key];
      image.alt = data.outfitMode === "master" ? "职业大师套装立绘"
        : data.outfitMode === "consumable" ? "职业耗材套装立绘" : "职业基础立绘";
      const caption = document.createElement("figcaption");
      caption.textContent = image.alt;
      figure.append(image, caption);
      return figure;
    },
  };
})(window.LifeGame);
