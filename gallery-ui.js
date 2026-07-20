(function (LG) {
  const el = {};
  let currentItems = [];

  function select(index) {
    const item = currentItems[index];
    if (!item) return;
    el.image.src = item.src;
    el.image.alt = item.alt;
    el.image.style.objectFit = item.fit || "cover";
    el.image.style.objectPosition = item.position || "center";
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
    button.className = "gallery-thumb";
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.style.objectFit = item.fit || "cover";
    image.style.objectPosition = item.position || "center";
    const label = document.createElement("span");
    label.textContent = item.title;
    button.append(image, label);
    button.addEventListener("click", () => select(index));
    return button;
  }

  function init() {
    el.dialog = document.getElementById("galleryDialog");
    el.title = document.getElementById("galleryTitle");
    el.image = document.getElementById("galleryFeatureImage");
    el.featureTitle = document.getElementById("galleryFeatureTitle");
    el.caption = document.getElementById("galleryFeatureCaption");
    el.thumbs = document.getElementById("galleryThumbs");
    document.getElementById("closeGalleryButton").addEventListener("click", () => el.dialog.close());
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      el.dialog.close();
    });
  }

  LG.galleryUI = {
    open(character) {
      const gallery = LG.GALLERY_ASSETS[character];
      const unlocked = LG.edenCharacters?.galleryUnlocked(character)
        || LG.penitentiary?.galleryUnlocked(character)
        || LG.otherworldCharacters?.galleryUnlocked(character)
        || (LG.infernalClub?.isCharacter(character)
          && LG.infernalClub.access().allowed)
        || (LG.casino?.isCharacter(character)
          ? LG.casino.galleryUnlocked(character) : LG.collectibles.galleryUnlocked(character));
      if (!gallery?.items.length || !unlocked) return false;
      currentItems = [...new Map(gallery.items.map((item) => [item.src, item])).values()];
      el.title.textContent = `${gallery.name} · CG画廊`;
      el.thumbs.replaceChildren(...currentItems.map(thumbnail));
      select(0);
      el.dialog.showModal();
      return true;
    },
  };

  init();
})(window.LifeGame);
