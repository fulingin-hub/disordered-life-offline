(function (LG) {
  const el = {};
  let getArchive;
  let getState;
  let selectedGender = "male";

  function galleryItem(ending, known) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `player-cg-item${known ? " unlocked" : " locked"}`;
    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = known ? `${ending.title}CG` : "未解锁结局";
    if (known && ending.cg) image.src = ending.cg;
    const body = document.createElement("span");
    body.textContent = known ? ending.title : "尚未发现";
    item.append(image, body);
    item.addEventListener("click", () => {
      if (known) {
        LG.cgUI.open(ending, selectedGender);
        return;
      }
      el.hint.textContent = "继续游玩并达成对应结局后，内容会由服务端解锁。";
      window.dzmm?.toast?.info?.("完成对应人生结局后解锁这张CG");
    });
    return item;
  }

  function render() {
    const archive = getArchive();
    const count = LG.endingArchive.count(archive, selectedGender);
    const endings = LG.authority.archiveView(selectedGender);
    el.count.textContent = `${LG.endingArchive.label(selectedGender)} ${count}/${
      LG.authority.endingCount()}`;
    el.tabs.forEach((button) => {
      button.classList.toggle("selected", button.dataset.galleryGender === selectedGender);
      button.setAttribute("aria-selected", String(button.dataset.galleryGender === selectedGender));
    });
    el.grid.replaceChildren(...endings.map((ending) =>
      galleryItem(ending.locked ? {} : ending, !ending.locked)));
  }

  LG.playerGalleryUI = {
    init(providers) {
      getArchive = providers.getArchive;
      getState = providers.getState;
      el.dialog = document.getElementById("playerRoomDialog");
      el.count = document.getElementById("playerGalleryCount");
      el.hint = document.getElementById("playerGalleryHint");
      el.grid = document.getElementById("playerGalleryGrid");
      el.tabs = [...el.dialog.querySelectorAll("[data-gallery-gender]")];
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        selectedGender = button.dataset.galleryGender;
        render();
      }));
      document.getElementById("closePlayerRoomButton").addEventListener("click", () => el.dialog.close());
    },
    open() {
      if (LG.contentMode?.guardGallery?.()) return false;
      selectedGender = getState()?.gender || "male";
      el.hint.textContent = "点击未解锁的CG可查看解锁条件。";
      render();
      el.dialog.showModal();
      return true;
    },
    summary() {
      const archive = getArchive?.() || { male: [], female: [] };
      return {
        count: LG.endingArchive.total(archive),
        total: LG.authority.endingTotal(),
      };
    },
  };
})(window.LifeGame);
