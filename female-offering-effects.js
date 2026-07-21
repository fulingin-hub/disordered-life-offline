(function (LG) {
  const assets = {
    bare: "./assets/generated/female-soul-offering-barefoot.32756fec.webp",
    stocking: "./assets/generated/female-soul-offering-stockings.668cd139.webp",
  };
  const queenAssets = {
    greed: "./assets/generated/infernal-greed-queen-offering-squat.ac1304b1.webp",
    lust: "./assets/generated/infernal-lust-queen-offering-squat.3e82c11f.webp",
    wrath: "./assets/generated/infernal-wrath-queen-offering-squat.e223f759.webp",
    sloth: "./assets/generated/infernal-sloth-queen-offering-squat.623091ad.webp",
    pride: "./assets/generated/infernal-pride-queen-offering-squat.b990ff4b.webp",
    envy: "./assets/generated/infernal-envy-queen-offering-squat.e1da65a6.webp",
    gluttony:
      "./assets/generated/infernal-gluttony-queen-offering-squat.a4a0235c.webp",
  };
  const copy = {
    overview: ["灵魂牵引", "前10秒 · 臀部上下晃动，臀部与双足魔纹同步吸取灵魂"],
    upper: ["外置排气魔纹",
      "后10秒 · 褐色纹口吐出带热气的小魔纹，同时吸入主角灵魂火苗"],
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
      <div class="queen-offering-device">
        <i></i><i></i><b></b><span></span>
      </div>
      <div class="queen-offering-heat"><i></i><i></i><i></i></div>
      <div class="female-offering-tentacles"></div>
      <div class="female-offering-emissions"></div>
      <div class="female-offering-souls"></div>
      <div class="queen-offering-conduit">
        <div class="queen-offering-conduit-portrait"><img alt=""></div>
        <i class="queen-offering-conduit-core"></i>
        <i class="queen-offering-corruption"></i>
        <b class="queen-offering-conduit-ring ring-a"></b>
        <b class="queen-offering-conduit-ring ring-b"></b>
      </div>
      <div class="female-offering-target-corruption"></div>
      <div class="queen-offering-persona"></div>
      <div class="female-offering-mouth-impact"><b><span></span></b></div>
      <div class="queen-offering-view"></div>`;
    const emissions = layer.querySelector(".female-offering-emissions");
    for (let index = 0; index < 10; index += 1) {
      const sigil = document.createElement("i");
      const art = document.createElement("u");
      art.className = "female-offering-sigil-art";
      sigil.append(art);
      sigil.style.setProperty("--emission-index", index);
      sigil.style.setProperty("--emission-drift-x", `${(index - 4.5) * 1.25}vw`);
      sigil.style.setProperty("--emission-land-offset",
        `${(index % 5 - 2) * 1.1}vw`);
      sigil.style.setProperty("--emission-delay", `${-(index % 5) * .28}s`);
      emissions.append(sigil);
    }
    const tentacles = layer.querySelector(".female-offering-tentacles");
    for (let index = 0; index < 10; index += 1) {
      const tentacle = document.createElement("i");
      tentacle.style.setProperty("--tentacle-angle",
        `${(index - 4.5) * 17}deg`);
      tentacle.style.setProperty("--tentacle-delay",
        `${-(index % 5) * .18}s`);
      tentacle.style.setProperty("--tentacle-reach",
        `${58 + (index % 3) * 13}%`);
      tentacles.append(tentacle);
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
    const persona = layer.querySelector(".queen-offering-persona");
    for (let index = 0; index < 12; index += 1) {
      const shard = document.createElement("i");
      shard.style.setProperty("--persona-index", index);
      shard.style.setProperty("--persona-delay", `${-(index % 6) * .18}s`);
      shard.style.setProperty("--persona-x", `${(index % 7 - 3) * 8}vw`);
      persona.append(shard);
    }
    dialog.querySelector(".contribution-ritual-scene").append(layer);
    return layer;
  }

  function configureTimings(dialog, durations) {
    const upper = Math.max(50, Number(durations?.[1]) || 10000);
    const lower = Math.max(50, Number(durations?.[2]) || 5000);
    const impactDuration = Math.max(80, Math.min(1800, lower * .38));
    dialog.style.setProperty("--female-offering-upper-duration", `${upper}ms`);
    dialog.style.setProperty("--female-offering-impact-delay",
      `${Math.max(0, lower - impactDuration)}ms`);
    dialog.style.setProperty("--female-offering-impact-duration",
      `${impactDuration}ms`);
  }

  function prepare(dialog, meta, mode, durations) {
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
    dialog.dataset.corruptionComplete = "false";
    configureTimings(dialog, durations);
    if (queenSource) {
      dialog.dataset.femaleOfferingQueen = meta.id;
      const source = dialog.querySelector(".contribution-ritual-protagonist img");
      const conduit = layer.querySelector(".queen-offering-conduit img");
      conduit.src = source?.src || "";
      conduit.alt = source?.alt ? `${source.alt}灵魂投影` : "主角灵魂投影";
    }
    return true;
  }

  function phaseCopy(dialog, phase) {
    if (dialog?.dataset.femaleOffering !== "true") return null;
    dialog.dataset.corruptionComplete = phase === "lower" ? "true" : "false";
    return copy[phase];
  }

  function canAdvance(dialog, context) {
    if (dialog?.dataset.femaleOffering !== "true") return true;
    if (context?.phase !== "upper") return true;
    return context.elapsed >= context.duration;
  }

  function reset(dialog) {
    if (!dialog) return;
    delete dialog.dataset.femaleOffering;
    delete dialog.dataset.femaleOfferingVariant;
    delete dialog.dataset.femaleOfferingQueen;
    delete dialog.dataset.corruptionComplete;
    dialog.style.removeProperty("--female-offering-upper-duration");
    dialog.style.removeProperty("--female-offering-impact-delay");
    dialog.style.removeProperty("--female-offering-impact-duration");
    const conduit = dialog.querySelector(".queen-offering-conduit img");
    if (conduit) {
      conduit.removeAttribute("src");
      conduit.alt = "";
    }
  }

  LG.femaleOfferingEffects = {
    eligible, prepare, phaseCopy, canAdvance, reset,
  };
})(window.LifeGame);
