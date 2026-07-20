(function (LG) {
  let banner;
  let timer;

  function show(text) {
    const dialog = document.getElementById("infernalClubDialog");
    if (!dialog) return;
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "infernal-club-use-banner";
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
      dialog.append(banner);
    }
    window.clearTimeout(timer);
    banner.textContent = text;
    banner.classList.remove("show");
    requestAnimationFrame(() => banner.classList.add("show"));
    timer = window.setTimeout(() => banner.classList.remove("show"), 3200);
  }

  LG.infernalClubFeedback = { show };
})(window.LifeGame);
