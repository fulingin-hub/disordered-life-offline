(function (LG) {
  const assets = {
    bare: "./assets/generated/female-soul-offering-barefoot.32756fec.webp",
    stocking: "./assets/generated/female-soul-offering-stockings.668cd139.webp",
  };
  const copy = {
    overview: ["灵魂牵引", "前10秒 · 摆动仪式与腰侧、双足魔纹同步吸取灵魂"],
    upper: ["排气魔纹", "后10秒 · 褐色排气纹口释放小型魔纹继续牵引"],
    lower: ["魔纹收束", "最后5秒 · 腰侧魔纹放大，灵舌向四向收束灵魂"],
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
      <div class="female-offering-emissions"></div>`;
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
    dialog.querySelector(".contribution-ritual-scene").append(layer);
    return layer;
  }

  function prepare(dialog, meta, mode) {
    reset(dialog);
    if (!eligible(meta, mode)) return false;
    const layer = ensure(dialog);
    const variant = LG.buttImpactMeta.femaleVariant(meta.id);
    const pose = layer.querySelector(".female-offering-pose");
    pose.src = assets[variant];
    pose.alt = `${meta.name}献上灵魂仪式动作`;
    dialog.dataset.femaleOffering = "true";
    dialog.dataset.femaleOfferingVariant = variant;
    return true;
  }

  function phaseCopy(dialog, phase) {
    return dialog?.dataset.femaleOffering === "true" ? copy[phase] : null;
  }

  function reset(dialog) {
    if (!dialog) return;
    delete dialog.dataset.femaleOffering;
    delete dialog.dataset.femaleOfferingVariant;
  }

  LG.femaleOfferingEffects = { eligible, prepare, phaseCopy, reset };
})(window.LifeGame);
