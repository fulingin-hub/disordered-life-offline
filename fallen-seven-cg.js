(function (LG) {
  let stage = null;
  const accents = {
    greed: "#d9a928", lust: "#d84b88", wrath: "#d54a3f",
    sloth: "#6677c8", pride: "#8c62d4", envy: "#42a66b",
    gluttony: "#c06b35",
  };

  function build(trigger) {
    stage = document.createElement("div");
    stage.className = "fallen-seven-stage";
    stage.hidden = true;
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", "七位地狱魔王共同踏下的循环动画");
    const formation = document.createElement("div");
    formation.className = "fallen-seven-formation";
    LG.INFERNAL_CLUB_DATA.queens.forEach((queen, index) => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const label = document.createElement("figcaption");
      figure.className = "fallen-seven-queen";
      figure.style.setProperty("--queen-index", index);
      figure.style.setProperty("--queen-accent", accents[queen.id]);
      image.src = LG.CONFIG.assets[queen.portrait];
      image.alt = queen.title;
      image.decoding = "async";
      label.textContent = queen.name;
      figure.append(image, label);
      formation.append(figure);
    });
    const impact = document.createElement("div");
    impact.className = "fallen-seven-impact";
    impact.setAttribute("aria-hidden", "true");
    impact.append(document.createElement("i"), document.createElement("i"));
    const caption = document.createElement("div");
    caption.className = "fallen-seven-caption";
    caption.innerHTML = "<strong>七魔王 · 共同裁决</strong>"
      + "<span>每一次踏落都会重新开始</span>";
    stage.append(formation, impact, caption);
    trigger.prepend(stage);
    return stage;
  }

  LG.fallenSevenCG = {
    show(trigger, fallbackImage) {
      const sources = LG.INFERNAL_CLUB_DATA?.queens?.map((queen) =>
        LG.CONFIG.assets[queen.portrait]);
      if (!sources?.length || sources.some((src) => !src)) return false;
      const scene = stage || build(trigger);
      fallbackImage.hidden = true;
      scene.hidden = false;
      scene.classList.remove("playing");
      requestAnimationFrame(() => scene.classList.add("playing"));
      return true;
    },
    hide(fallbackImage) {
      if (stage) {
        stage.hidden = true;
        stage.classList.remove("playing");
      }
      if (fallbackImage) fallbackImage.hidden = false;
    },
    stop() {
      if (stage) stage.classList.remove("playing");
    },
  };
})(window.LifeGame);
