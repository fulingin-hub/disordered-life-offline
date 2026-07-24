(function (LG) {
  const el = {};
  let currentItems = [];
  let currentCharacter = "";
  let selectedIndex = 0;

  function select(index) {
    const item = currentItems[index];
    if (!item) return;
    selectedIndex = index;
    const animation = item.type === "animation";
    el.image.hidden = animation;
    el.animation.hidden = !animation;
    if (animation) {
      el.animation.dataset.template = item.template;
      if (item.animationModel) {
        el.animation.dataset.animationModel = item.animationModel;
        el.animation.style.setProperty(
          "--animation-portrait", `url("${item.portrait}")`);
        el.animation.style.setProperty(
          "--character-model-primary", item.modelPrimary);
        el.animation.style.setProperty(
          "--character-model-secondary", item.modelSecondary);
      } else {
        delete el.animation.dataset.animationModel;
        el.animation.style.removeProperty("--animation-portrait");
      }
      el.play.textContent = `播放${item.title}`;
      el.play.setAttribute("aria-label", `播放${item.title}动画`);
    } else {
      el.image.src = item.src;
      el.image.alt = item.alt;
      el.image.style.objectFit = item.fit || "cover";
      el.image.style.objectPosition = item.position || "center";
    }
    el.featureTitle.textContent = item.title;
    el.caption.textContent = item.caption;
    el.thumbs.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.classList.toggle("selected", buttonIndex === index);
      button.setAttribute("aria-pressed", buttonIndex === index ? "true" : "false");
    });
  }

  function thumbnail(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `gallery-thumb${
      item.type === "animation" ? " animation" : ""}`;
    const label = document.createElement("span");
    label.textContent = item.title;
    if (item.type === "animation") {
      const art = document.createElement("div");
      art.className = "gallery-animation-thumb-art";
      art.dataset.template = item.template;
      if (item.animationModel) {
        art.dataset.animationModel = item.animationModel;
        art.style.setProperty("--animation-portrait", `url("${item.portrait}")`);
        art.style.setProperty("--character-model-primary", item.modelPrimary);
        art.style.setProperty("--character-model-secondary", item.modelSecondary);
      }
      art.append(...Array.from({ length: 5 }, () =>
        document.createElement("i")));
      button.append(art, label);
    } else {
      const image = document.createElement("img");
      image.src = item.src;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.style.objectFit = item.fit || "cover";
      image.style.objectPosition = item.position || "center";
      button.append(image, label);
    }
    button.addEventListener("click", () => select(index));
    return button;
  }

  function init() {
    el.dialog = document.getElementById("galleryDialog");
    el.title = document.getElementById("galleryTitle");
    el.image = document.getElementById("galleryFeatureImage");
    el.animation = document.getElementById("galleryAnimationPreview");
    el.play = document.getElementById("galleryAnimationPlay");
    el.featureTitle = document.getElementById("galleryFeatureTitle");
    el.caption = document.getElementById("galleryFeatureCaption");
    el.thumbs = document.getElementById("galleryThumbs");
    el.play.addEventListener("click", () => {
      const item = currentItems[selectedIndex];
      if (item?.type === "animation") {
        LG.galleryAnimationTemplates.play(currentCharacter, item.template);
      }
    });
    document.getElementById("closeGalleryButton").addEventListener("click", () => el.dialog.close());
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      el.dialog.close();
    });
  }

  LG.galleryUI = {
    open(character) {
      if (LG.contentMode?.guardGallery?.()) return false;
      const gallery = LG.GALLERY_ASSETS[character];
      const infernalWitch = Boolean(
        LG.INFERNAL_DATA?.byWitchCharacter?.[character]
        && LG.infernalRealm?.access?.().allowed);
      const unlocked = LG.edenCharacters?.galleryUnlocked(character)
        || LG.penitentiary?.galleryUnlocked(character)
        || LG.otherworldCharacters?.galleryUnlocked(character)
        || LG.career?.galleryUnlocked(character)
        || (character === "fallenSaint"
          && LG.fallenSaintRoom?.unlocked?.()
          && LG.career.privateComplete("holy-light-saint"))
        || (character === "priestess"
          && LG.holyLight?.priestessGalleryUnlocked())
        || (character === "mia"
          && LG.contentMode?.adultSimulation?.())
        || (LG.infernalClub?.isCharacter(character)
          && LG.infernalClub.access().allowed)
        || infernalWitch
        || (LG.casino?.isCharacter(character)
          ? LG.casino.galleryUnlocked(character) : LG.collectibles.galleryUnlocked(character));
      if (!gallery?.items.length || !unlocked) return false;
      currentCharacter = character;
      const animations = LG.galleryAnimationTemplates.entries(character);
      currentItems = character === "mia"
        ? [...gallery.items, ...animations]
        : [...animations, ...gallery.items];
      el.title.textContent = `${gallery.name} · 角色画廊`;
      el.thumbs.replaceChildren(...currentItems.map(thumbnail));
      select(0);
      el.dialog.showModal();
      return true;
    },
  };

  init();
})(window.LifeGame);
