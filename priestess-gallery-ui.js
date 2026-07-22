(function (LG) {
  const button = document.getElementById("priestessGalleryButton");

  function render() {
    const unlocked = LG.holyLight.priestessGalleryUnlocked();
    button.disabled = !unlocked;
    button.textContent = unlocked
      ? "女司祭画廊" : "放过女司祭后解锁画廊";
  }

  button.addEventListener("click", () => LG.galleryUI.open("priestess"));
  LG.authority.subscribe(render);
  render();
})(window.LifeGame);
