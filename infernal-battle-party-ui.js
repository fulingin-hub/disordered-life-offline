(function (LG) {
  function validSource(src) {
    return typeof src === "string"
      && /^(?:\.\/assets\/|https?:\/\/|data:image\/|blob:)/.test(src);
  }

  function syncPartySize(figure) {
    const stage = figure.closest(".infernal-battle-stage");
    const companion = stage?.querySelector(".infernal-battle-figure.companion");
    if (stage) stage.dataset.partySize = companion?.hidden ? "1" : "2";
  }

  function hideImage(image, figure) {
    image.removeAttribute("src");
    image.alt = "";
    figure.hidden = true;
    syncPartySize(figure);
  }

  function setImage(image, figure, src, alt, fallbackSrc = "") {
    const token = String((Number(image.dataset.partyRender) || 0) + 1);
    image.dataset.partyRender = token;
    if (!validSource(src)) {
      hideImage(image, figure);
      return false;
    }
    function load(nextSrc, fallback) {
      image.onload = () => {
        if (image.dataset.partyRender !== token) return;
        figure.hidden = false;
        syncPartySize(figure);
      };
      image.onerror = () => {
        if (image.dataset.partyRender !== token) return;
        if (!fallback && validSource(fallbackSrc) && fallbackSrc !== nextSrc) {
          load(fallbackSrc, true);
          return;
        }
        hideImage(image, figure);
      };
      image.src = nextSrc;
    }
    figure.hidden = false;
    image.alt = alt;
    load(src, false);
    return true;
  }

  function basePortrait(gender) {
    return LG.CONFIG.assets[gender === "female"
      ? "protagonistFemaleBase" : "protagonistMaleBase"] || "";
  }

  function party() {
    const state = LG.authority.state();
    const gender = state?.gender === "female" ? "female" : "male";
    const playerFallbackSrc = basePortrait(gender);
    const vehicle = LG.vehicleStore?.equipped?.();
    const mode = LG.vehicleStore?.displayMode?.() || "ride";
    let resolved = null;
    try {
      resolved = vehicle
        ? LG.vehicleCareerPortraits?.resolve?.(vehicle, gender, mode) : null;
    } catch (err) {
      console.error("战斗阵型立绘解析失败:",
        err?.code, err?.message, err?.stack);
    }
    const career = LG.careerMainPortrait?.get?.(gender);
    const fallback = LG.protagonistPortrait?.source?.(state)
      || playerFallbackSrc;

    if (!vehicle || !resolved) {
      return {
        playerSrc: fallback,
        playerFallbackSrc,
        playerLabel: career?.name || "主角",
        companionSrc: "",
        companionLabel: "",
      };
    }
    if (mode === "follow" && resolved.mountSrc) {
      return {
        playerSrc: resolved.primarySrc || fallback,
        playerFallbackSrc,
        playerLabel: career?.name || "主角",
        companionSrc: resolved.mountSrc,
        companionLabel: vehicle.name,
      };
    }
    return {
      playerSrc: resolved.primarySrc || fallback,
      playerFallbackSrc,
      playerLabel: resolved.label || `${career?.name || "主角"} · ${vehicle.name}`,
      companionSrc: "",
      companionLabel: "",
    };
  }

  function elements(prefix) {
    return {
      stage: document.getElementById(`${prefix}BattleStage`),
      playerFigure: document.getElementById(`${prefix}PlayerFigure`),
      playerImage: document.getElementById(`${prefix}PlayerPortrait`),
      playerLabel: document.getElementById(`${prefix}PlayerLabel`),
      companionFigure: document.getElementById(`${prefix}CompanionFigure`),
      companionImage: document.getElementById(`${prefix}CompanionPortrait`),
      companionLabel: document.getElementById(`${prefix}CompanionLabel`),
    };
  }

  function render(prefix) {
    const el = elements(prefix);
    if (!el.stage || !el.playerImage || !el.companionImage) return;
    const current = party();
    setImage(el.playerImage, el.playerFigure, current.playerSrc,
      current.playerLabel, current.playerFallbackSrc);
    const hasCompanion = setImage(el.companionImage, el.companionFigure,
      current.companionSrc, current.companionLabel);
    el.playerLabel.textContent = current.playerLabel;
    el.companionLabel.textContent = current.companionLabel;
    el.stage.dataset.partySize = hasCompanion ? "2" : "1";
  }

  LG.infernalBattlePartyUI = { party, render, validSource };
})(window.LifeGame);
