(function (LG) {
  const soleSource =
    "./assets/generated/cg-special-foot-impact-milestones.b1742732.webp";
  const kneelingAssets = {
    male: "magicGasProtagonistMale",
    female: "magicGasProtagonistFemale",
  };
  const soulPalette = {
    black: "#303038",
    cyan: "#52d7e8",
    gold: "#f1c84e",
    red: "#e14c45",
    orange: "#ef8b35",
    yellow: "#f0d84f",
    green: "#55c875",
    blue: "#4d8fe7",
    silver: "#c7d0dd",
    purple: "#9b65dc",
  };
  const alignmentRuns = new WeakMap();

  function protagonist(gender) {
    const genderKey = gender === "female" ? "female" : "male";
    return {
      src: LG.CONFIG.assets[kneelingAssets[genderKey]],
      label: "魔气洗脑主角立绘·有发魔纹受术姿态",
      crop: "single",
      pose: "magic-gas",
    };
  }

  function ensureLayers(dialog) {
    const scene = dialog.querySelector(".contribution-ritual-scene");
    const tools = dialog.querySelector(".contribution-ritual-tools");
    while (tools.childElementCount < 14) {
      const kiss = document.createElement("i");
      kiss.className = "contribution-kiss";
      tools.append(kiss);
    }
    [...tools.children].forEach((kiss, index) => {
      kiss.style.setProperty("--kiss-x", `${(index % 7 - 3) * 10}vw`);
      kiss.style.setProperty("--kiss-y", `${(Math.floor(index / 7) * 18) - 9}vh`);
      kiss.style.setProperty("--kiss-delay", `${-(index % 7) * .17}s`);
      kiss.style.setProperty("--kiss-rotate", `${(index % 5 - 2) * 8}deg`);
    });
    let sigil = dialog.querySelector(".contribution-mouth-sigil");
    if (!sigil) {
      sigil = document.createElement("div");
      sigil.className = "contribution-mouth-sigil";
      sigil.setAttribute("aria-hidden", "true");
      sigil.innerHTML =
        '<span class="sigil-disc"></span><i class="sigil-mouth"><b></b></i>';
      scene.append(sigil);
    }
    if (!sigil.dataset.alignBound) {
      sigil.addEventListener("transitionend", () => align(dialog));
      sigil.dataset.alignBound = "true";
    }
    if (!dialog.querySelector(".contribution-ritual-gesture")) {
      const gesture = document.createElement("div");
      gesture.className = "contribution-ritual-gesture";
      gesture.setAttribute("aria-hidden", "true");
      scene.append(gesture);
    }
    let stream = dialog.querySelector(".contribution-soul-stream");
    if (!stream) {
      stream = document.createElement("div");
      stream.className = "contribution-soul-stream";
      stream.setAttribute("aria-hidden", "true");
      [0, 1].forEach((index) => {
        const core = document.createElement("b");
        core.dataset.soulTarget = "mouth";
        core.style.setProperty("--soul-delay", `${index * -.68}s`);
        stream.append(core);
      });
      for (let index = 0; index < 28; index += 1) {
        const mote = document.createElement("i");
        mote.dataset.soulTarget = "mouth";
        mote.style.setProperty("--soul-index", index);
        mote.style.setProperty("--soul-delay", `${-(index % 14) * 0.11}s`);
        mote.style.setProperty("--soul-duration", `${1.25 + (index % 5) * 0.12}s`);
        mote.style.setProperty("--soul-x", `${(index % 7 - 3) * 13}px`);
        mote.style.setProperty("--soul-tail-rotate", `${(index % 9 - 4) * 3}deg`);
        stream.append(mote);
      }
      scene.append(stream);
    }
    if (!stream.dataset.resizeBound && window.ResizeObserver) {
      new ResizeObserver(() => settle(dialog)).observe(dialog);
      stream.dataset.resizeBound = "true";
    }
    let sole = dialog.querySelector(".contribution-sole-impact");
    if (!sole) {
      sole = document.createElement("div");
      sole.className = "contribution-sole-impact";
      sole.setAttribute("aria-hidden", "true");
      sole.innerHTML = "<i><b></b></i>";
      scene.append(sole);
    }
    return { stream, sole };
  }

  function align(dialog) {
    if (!dialog?.open) return false;
    LG.contributionSigilPosition?.align?.(dialog);
    const stream = dialog.querySelector(".contribution-soul-stream");
    const mouth = dialog.querySelector(".contribution-mouth-sigil .sigil-mouth");
    if (!stream || !mouth) return false;
    const mouthRect = mouth.getBoundingClientRect();
    const target = {
      x: mouthRect.left + mouthRect.width / 2,
      y: mouthRect.top + mouthRect.height / 2,
    };
    const streamRect = stream.getBoundingClientRect();
    [...stream.querySelectorAll("[data-soul-target]")].forEach((soul, index) => {
      const originX = streamRect.left + soul.offsetLeft + soul.offsetWidth / 2;
      const originY = streamRect.top + soul.offsetTop + soul.offsetHeight / 2;
      const dx = target.x - originX;
      const dy = target.y - originY;
      const arc = (index % 5 - 2) * 8;
      soul.style.setProperty("--soul-mid-x", `${dx * 0.52 + arc}px`);
      soul.style.setProperty("--soul-mid-y", `${dy * 0.55}px`);
      soul.style.setProperty("--soul-target-x", `${dx}px`);
      soul.style.setProperty("--soul-target-y", `${dy}px`);
    });
    dialog.dataset.soulTargets = "mouth";
    return true;
  }

  function settle(dialog, duration = 850) {
    const token = {};
    alignmentRuns.set(dialog, token);
    const started = performance.now();
    function tick(now) {
      if (alignmentRuns.get(dialog) !== token || !dialog?.open) return;
      align(dialog);
      if (now - started < duration) {
        window.requestAnimationFrame(tick);
      } else {
        alignmentRuns.delete(dialog);
      }
    }
    window.requestAnimationFrame(tick);
  }

  function applySoulColors(dialog) {
    const current = LG.infernalChurch?.data?.()?.soul?.colors;
    const ids = Array.isArray(current)
      ? current.filter((id) => soulPalette[id])
      : [];
    const colors = (ids.length ? ids : ["black"]).map((id) => soulPalette[id]);
    dialog.dataset.soulColors = (ids.length ? ids : ["black"]).join(" ");
    dialog.dataset.soulShape = `${ids.length ? ids.join("-") : "black"}-flame`;
    dialog.style.setProperty("--soul-primary", colors[0]);
    dialog.style.setProperty("--soul-secondary", colors[1] || colors[0]);
    dialog.style.setProperty("--soul-tertiary", colors[2] || colors[0]);
    dialog.querySelectorAll(".contribution-soul-stream > *")
      .forEach((item, index) => {
        item.style.setProperty("--soul-color", colors[index % colors.length]);
        item.style.setProperty(
          "--soul-accent", colors[(index + 1) % colors.length]);
      });
  }

  function prepare(dialog, meta, gender) {
    const outfit = protagonist(gender);
    const { sole } = ensureLayers(dialog);
    applySoulColors(dialog);
    const variant = Math.random() < 0.5 ? "bare" : "stocking";
    const foot = sole.querySelector("i");
    foot.classList.remove("foot-bare", "foot-stocking");
    foot.classList.add(`foot-${variant}`);
    foot.style.backgroundImage = `url("${soleSource}")`;
    foot.dataset.footVariant = variant;
    dialog.dataset.outfit = outfit.label;
    dialog.dataset.protagonistCrop = outfit.crop;
    dialog.dataset.protagonistPose = outfit.pose;
    dialog.dataset.headAura = "protagonist-head";
    dialog.dataset.visor = "ai-generated-purple-sigil";
    dialog.dataset.sigilMouth = "swallow";
    dialog.dataset.soleVariant = variant;
    dialog.classList.remove("sole-impact");
    return outfit;
  }

  function startSole(dialog) {
    dialog.classList.add("sole-impact");
  }

  function reset(dialog) {
    dialog?.classList.remove("sole-impact");
    LG.contributionSigilPosition?.reset?.(dialog);
  }

  LG.contributionShowcaseEffects = { prepare, align, settle, startSole, reset };
})(window.LifeGame);
