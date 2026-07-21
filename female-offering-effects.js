(function (LG) {
  const assets = {
    bare: "./assets/generated/female-soul-offering-barefoot.32756fec.webp",
    stocking: "./assets/generated/female-soul-offering-stockings.668cd139.webp",
  };
  const queenAssets = {
    greed: "./assets/generated/infernal-greed-queen-offering-squat.d1ac2bea.webp",
    lust: "./assets/generated/infernal-lust-queen-offering-squat.86d71803.webp",
    wrath: "./assets/generated/infernal-wrath-queen-offering-squat.d1017c90.webp",
    sloth: "./assets/generated/infernal-sloth-queen-offering-squat.5db5e3d3.webp",
    pride: "./assets/generated/infernal-pride-queen-offering-squat.a8ef7daf.webp",
    envy: "./assets/generated/infernal-envy-queen-offering-squat.1d9490fb.webp",
    gluttony:
      "./assets/generated/infernal-gluttony-queen-offering-squat.30d146db.webp",
  };
  const copy = {
    overview: ["灵魂牵引", "前10秒 · 臀部上下晃动，臀部与双足魔纹同步吸取灵魂"],
    upper: ["排气魔纹", "后10秒 · 褐色排气纹口释放小型魔纹继续牵引"],
    lower: ["魔纹收束", "最后5秒 · 臀部魔纹唇放大，灵舌向四向甩动吸魂"],
  };

  function eligible(meta, mode) {
    return mode === "offering" && meta?.gender === "female";
  }

  function ensure(dialog) {
    let layer = dialog.querySelector(".female-offering-layer");
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "female-offering-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <img class="female-offering-pose" alt="">
      <i class="female-offering-sigil hip">
        <u class="female-offering-sigil-art"></u><b><span></span></b>
      </i>
      <i class="female-offering-sigil sole left">
        <u class="female-offering-sigil-art"></u>
      </i>
      <i class="female-offering-sigil sole right">
        <u class="female-offering-sigil-art"></u>
      </i>
      <i class="female-offering-vent"></i>
      <div class="female-offering-emissions"></div>
      <div class="female-offering-souls"></div>`;
    const emissions = layer.querySelector(".female-offering-emissions");
    for (let index = 0; index < 10; index += 1) {
      const sigil = document.createElement("i");
      const art = document.createElement("u");
      art.className = "female-offering-sigil-art";
      sigil.append(art);
      sigil.style.setProperty("--emission-index", index);
      sigil.style.setProperty("--emission-x", `${(index - 4.5) * 7}vw`);
      sigil.style.setProperty("--emission-delay", `${-(index % 5) * .28}s`);
      emissions.append(sigil);
    }
    const souls = layer.querySelector(".female-offering-souls");
    const targets = ["hip", "sole-left", "sole-right"];
    for (let index = 0; index < 24; index += 1) {
      const soul = document.createElement("i");
      const target = targets[index % targets.length];
      soul.className = target;
      soul.style.setProperty("--soul-index", index);
      soul.style.setProperty("--soul-delay", `${-(index % 8) * .16}s`);
      souls.append(soul);
    }
    dialog.querySelector(".contribution-ritual-scene").append(layer);
    return layer;
  }

  function prepare(dialog, meta, mode) {
    reset(dialog);
    if (!eligible(meta, mode)) return false;
    const layer = ensure(dialog);
    const variant = LG.buttImpactMeta.femaleVariant(meta.id);
    const queenSource = meta.kind === "queen" ? queenAssets[meta.id] : null;
    const pose = layer.querySelector(".female-offering-pose");
    pose.src = queenSource || assets[variant];
    pose.alt = `${meta.name}献上灵魂仪式动作`;
    dialog.dataset.femaleOffering = "true";
    dialog.dataset.femaleOfferingVariant = variant;
    if (queenSource) dialog.dataset.femaleOfferingQueen = meta.id;
    return true;
  }

  function phaseCopy(dialog, phase) {
    return dialog?.dataset.femaleOffering === "true" ? copy[phase] : null;
  }

  function reset(dialog) {
    if (!dialog) return;
    delete dialog.dataset.femaleOffering;
    delete dialog.dataset.femaleOfferingVariant;
    delete dialog.dataset.femaleOfferingQueen;
  }

  LG.femaleOfferingEffects = { eligible, prepare, phaseCopy, reset };
})(window.LifeGame);
