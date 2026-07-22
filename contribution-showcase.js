(function (LG) {
  const queenColors = {
    greed: ["#f1c957", "#e858a5"],
    lust: ["#b66cff", "#ff6cae"],
    wrath: ["#ef5b55", "#d65bca"],
    sloth: ["#e78fb7", "#8f68d8"],
    pride: ["#8065c9", "#ef72b5"],
    envy: ["#86c9d8", "#b260d1"],
    gluttony: ["#77c985", "#dc63b2"],
  };
  const queenHues = {
    greed: "66deg", lust: "300deg", wrath: "20deg", sloth: "0deg",
    pride: "280deg", envy: "210deg", gluttony: "140deg",
  };
  const randomThemes = [
    [["#8f6cff", "#df60d8"], "278deg"],
    [["#5fd0d2", "#ad67e9"], "188deg"],
    [["#ef6d91", "#7e6de4"], "334deg"],
    [["#e4bd58", "#ca5cae"], "48deg"],
    [["#74cf8d", "#8d65dc"], "138deg"],
    [["#df795d", "#cb62d8"], "18deg"],
  ];

  function queen(queenData) {
    return {
      id: `queen-${queenData.id}`,
      colors: queenColors[queenData.id] || queenColors.lust,
      hue: queenHues[queenData.id] || queenHues.lust,
      colorMode: "queen-fixed",
      kiss: `${queenData.name}的轻蔑飞吻`,
    };
  }

  function leader(character) {
    const meta = {
      id: character.id,
      name: character.name,
      src: character.src || LG.careerPortraits?.characterSource?.(character),
    };
    const model = LG.characterAnimationModels?.profile?.(meta);
    if (model) {
      return {
        id: `leader-${model.id}`,
        colors: [model.primary, model.secondary],
        hue: "0deg",
        colorMode: "character-fixed",
        kiss: `${character.name}的专属仪式印记`,
      };
    }
    const [colors, hue] = randomThemes[
      Math.floor(Math.random() * randomThemes.length)];
    return {
      id: `leader-${character.faction}`,
      colors,
      hue,
      colorMode: "random-each-use",
      kiss: `${character.name}的敷衍飞吻`,
    };
  }

  function apply(dialog, data) {
    if (!data) return;
    dialog.dataset.showcaseTheme = data.id;
    dialog.dataset.sigilColorMode = data.colorMode;
    dialog.style.setProperty("--showcase-primary", data.colors[0]);
    dialog.style.setProperty("--showcase-secondary", data.colors[1]);
    dialog.style.setProperty("--kiss-hue", data.hue);
    dialog.querySelectorAll(".contribution-kiss").forEach((kiss) => {
      kiss.title = data.kiss;
      kiss.setAttribute("aria-label", data.kiss);
    });
    LG.footVariants.apply(dialog.querySelector(".ritual-foot-bare"), "bare");
    LG.footVariants.apply(dialog.querySelector(".ritual-foot-stocking"), "stocking");
  }

  LG.contributionShowcase = { queen, leader, apply };
})(window.LifeGame);
