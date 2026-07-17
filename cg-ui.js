(function (LG) {
  const el = {};
  let latestBackdropId = 0;

  function setBackdrop(src) {
    const requestId = ++latestBackdropId;
    el.app.dataset.hasCg = src ? "true" : "false";
    if (!src) {
      el.backdrop.style.backgroundImage = `url("${LG.CONFIG.assets.background}")`;
      return false;
    }
    const image = new Image();
    image.onload = () => {
      if (requestId === latestBackdropId) {
        el.backdrop.style.backgroundImage = `url("${src}")`;
      }
    };
    image.onerror = () => {
      if (requestId === latestBackdropId) {
        el.backdrop.style.backgroundImage = `url("${LG.CONFIG.assets.background}")`;
      }
    };
    image.src = src;
    return Boolean(src);
  }

  LG.cgUI = {
    init() {
      el.app = document.getElementById("app");
      el.backdrop = document.querySelector(".backdrop");
      el.dialog = document.getElementById("cgDialog");
      el.title = document.getElementById("cgDialogTitle");
      el.image = document.getElementById("cgDialogImage");
      document.getElementById("closeCgButton").addEventListener("click", () => el.dialog.close());
    },
    showEvent(event) {
      return setBackdrop(LG.CG_ASSETS.events[event?.id]);
    },
    showEnding(ending, gender) {
      return setBackdrop(ending?.cg || LG.CG_ASSETS.endingSrc(ending?.id, gender));
    },
    decorateArchive(entry, ending, gender) {
      const src = ending.cg || LG.CG_ASSETS.endingSrc(ending.id, gender);
      if (!src) return;
      const button = document.createElement("button");
      const image = document.createElement("img");
      button.type = "button";
      button.className = "archive-cg-button";
      button.setAttribute("aria-label", `查看${ending.title} CG`);
      image.src = src;
      image.alt = `${ending.title} CG`;
      image.loading = "lazy";
      image.decoding = "async";
      button.append(image);
      button.addEventListener("click", () => this.open(ending, gender));
      entry.prepend(button);
    },
    open(ending, gender = "male") {
      const label = ending.universal ? "通用结局" : LG.endingArchive.label(gender);
      el.title.textContent = `${label} · ${ending.title}`;
      el.image.src = ending.cg || LG.CG_ASSETS.endingSrc(ending.id, gender);
      el.image.alt = `${label}${ending.title}CG`;
      const archive = document.getElementById("archiveDialog");
      if (archive.open) archive.close();
      el.dialog.showModal();
    },
  };
})(window.LifeGame);
