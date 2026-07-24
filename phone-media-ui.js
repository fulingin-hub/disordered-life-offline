(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function movieCard(item) {
    const card = node("article", "phone-movie-card");
    const video = node("video");
    video.controls = true;
    video.preload = "metadata";
    video.src = item.src;
    video.setAttribute("playsinline", "");
    card.append(video, node("strong", "", item.title));
    return card;
  }

  function renderMovies(content, status) {
    const films = LG.lifeCinemaFilms.catalog.filter((item) =>
      item.unlocked && LG.phoneData.validAsset(item.src));
    status.textContent = `已解锁 ${films.length} 部影片`;
    if (films.length) {
      const list = node("div", "phone-movie-list");
      list.append(...films.map(movieCard));
      content.replaceChildren(list);
      return;
    }
    const empty = node("div", "phone-empty");
    empty.append(node("strong", "", "暂无可播放影片"),
      node("p", "", "已解锁影片会自动同步到这里。"));
    const open = node("button", "", "前往人生电影院");
    open.type = "button";
    open.addEventListener("click", () => {
      LG.phoneUI.close();
      LG.lifeCinemaFilms.openCinema();
    });
    empty.append(open);
    content.replaceChildren(empty);
  }

  function trackButton(track, selected, onSelect) {
    const button = node("button",
      `phone-track${selected ? " selected" : ""}`);
    button.type = "button";
    button.append(node("span", "phone-track-mark", ""),
      node("strong", "", track.title), node("small", "", track.album));
    button.addEventListener("click", () => onSelect(track.id));
    return button;
  }

  function renderMusic(content, status) {
    const state = LG.music.playerState();
    const shell = node("section", "phone-player");
    const now = node("div", "phone-player-now");
    now.append(node("span", "phone-player-cover", ""),
      node("div", "", state.automatic ? "场景自动配乐"
        : LG.phoneData.tracks.find((item) => item.id === state.scene)?.title
          || "自选配乐"));
    const controls = node("div", "phone-player-controls");
    const automatic = node("button", state.automatic ? "active" : "", "自动");
    automatic.type = "button";
    automatic.addEventListener("click", () => {
      LG.music.useAutomatic();
      renderMusic(content, status);
    });
    const play = node("button", "", state.enabled ? "暂停" : "播放");
    play.type = "button";
    play.addEventListener("click", () => {
      LG.audio.setMusicEnabled(!LG.audio.isMusicEnabled());
      renderMusic(content, status);
    });
    controls.append(automatic, play);
    const volume = node("label", "phone-volume");
    volume.append(node("span", "", `音量 ${state.volume}%`));
    const slider = node("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(state.volume);
    slider.addEventListener("input", () => {
      LG.music.setVolume(Number(slider.value));
      volume.querySelector("span").textContent = `音量 ${slider.value}%`;
    });
    volume.append(slider);
    const tracks = node("div", "phone-track-list");
    tracks.append(...LG.phoneData.tracks.map((track) =>
      trackButton(track, !state.automatic && track.id === state.scene, (id) => {
        LG.music.selectTrack(id);
        LG.audio.setMusicEnabled(true);
        renderMusic(content, status);
      })));
    shell.append(now, controls, volume, tracks);
    status.textContent = state.enabled
      ? "音乐正在播放，旁白保持原设置。" : "音乐已暂停，旁白保持原设置。";
    content.replaceChildren(shell);
  }

  LG.phoneMediaUI = { renderMovies, renderMusic };
})(window.LifeGame);
