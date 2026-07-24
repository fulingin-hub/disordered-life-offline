(function (LG) {
  const films = [];
  const el = {};
  function validUrl(value) {
    return typeof value === "string"
      && (/^\.\/assets\/[A-Za-z0-9_./-]+$/.test(value)
        || /^https?:\/\//.test(value));
  }
  function render() {
    el.count.textContent = `已解锁 ${films.filter((item) => item.unlocked).length} 部`;
    const unlocked = films.filter((item) => item.unlocked && validUrl(item.src));
    if (!unlocked.length) {
      const empty = document.createElement("div");
      empty.className = "life-film-empty";
      const title = document.createElement("strong");
      title.textContent = "暂无剧情动画";
      const copy = document.createElement("p");
      copy.textContent = "后续加入剧情视频后，已解锁内容会在这里放映。";
      empty.append(title, copy);
      el.list.replaceChildren(empty);
      return;
    }
    el.list.replaceChildren(...unlocked.map((item) => {
      const card = document.createElement("article");
      card.className = "life-film-card";
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.src = item.src;
      video.setAttribute("playsinline", "");
      const title = document.createElement("strong");
      title.textContent = item.title;
      card.append(video, title);
      return card;
    }));
  }
  function hide() {
    if (el.panel) el.panel.hidden = true;
  }
  function open() {
    ["recoveryPanel", "lifeAchievementPanel", "cinemaNarratorPanel"]
      .forEach((id) => { document.getElementById(id).hidden = true; });
    render();
    el.panel.hidden = false;
    document.getElementById("cinemaStatus").textContent =
      films.length ? "选择已解锁的剧情动画。" : "当前还没有可放映的剧情动画。";
    el.panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function openCinema() {
    const dialog = document.getElementById("recoveryDialog");
    if (!dialog.open) dialog.showModal();
    open();
  }
  function init() {
    el.panel = document.getElementById("lifeFilmPanel");
    el.list = document.getElementById("lifeFilmList");
    el.count = document.getElementById("lifeFilmCount");
    document.getElementById("cinemaFilmsButton").addEventListener("click", open);
  }
  LG.lifeCinemaFilms = { catalog: films, open, openCinema, hide };
  init();
})(window.LifeGame);
