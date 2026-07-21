(function (LG) {
  function align(dialog) {
    if (!dialog || dialog.dataset.ritualMode !== "showcase") return false;
    const actor = dialog.querySelector(".contribution-ritual-actor");
    const sigil = dialog.querySelector(".contribution-mouth-sigil");
    const scene = dialog.querySelector(".contribution-ritual-scene");
    const image = actor?.querySelector("img");
    if (!actor || !sigil || !scene || !image) return false;
    const actorRect = actor.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const scaleX = actorRect.width / actor.offsetWidth;
    const scaleY = actorRect.height / actor.offsetHeight;
    const imageWidth = image.offsetWidth * scaleX;
    const imageHeight = image.offsetHeight * scaleY;
    const aspect = image.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : imageWidth / imageHeight;
    const renderHeight = Math.min(imageHeight, imageWidth / aspect);
    const renderWidth = renderHeight * aspect;
    const left = actorRect.left - sceneRect.left
      + (image.offsetLeft + image.offsetWidth * .5) * scaleX;
    const top = actorRect.top - sceneRect.top
      + (image.offsetTop * scaleY) + renderHeight * .61;
    const width = Math.min(240, Math.max(128, renderWidth * .48));
    sigil.style.setProperty("--sigil-actor-left", `${left}px`);
    sigil.style.setProperty("--sigil-actor-top", `${top}px`);
    sigil.style.setProperty("--sigil-actor-width", `${width}px`);
    dialog.dataset.sigilAnchor = "actor-lower-abdomen";
    return true;
  }

  function reset(dialog) {
    const sigil = dialog?.querySelector(".contribution-mouth-sigil");
    ["--sigil-actor-left", "--sigil-actor-top", "--sigil-actor-width"]
      .forEach((name) => sigil?.style.removeProperty(name));
    if (dialog) delete dialog.dataset.sigilAnchor;
  }

  LG.contributionSigilPosition = { align, reset };
})(window.LifeGame);
