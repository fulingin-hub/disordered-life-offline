(function (LG) {
  function standard(progress, onEnter) {
    const scene = LG.dialogueScenes.room(progress.id);
    const card = document.createElement("article");
    card.className = `room-card${progress.unlocked ? " unlocked" : ""}`;
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets[progress.id];
    image.alt = scene.name;
    image.loading = "lazy";
    image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const label = document.createElement("span");
    label.className = "event-type";
    label.textContent = progress.special
      ? (progress.unlocked ? "贡金系统开放" : "贡金属性未达标")
      : (progress.unlocked ? "成就已解锁" : "成就进行中");
    const title = document.createElement("h3");
    title.textContent = scene.location;
    const track = document.createElement("div");
    track.className = "room-progress";
    const fill = document.createElement("span");
    fill.style.width = `${Math.min(100, progress.count / progress.threshold * 100)}%`;
    track.append(fill);
    const status = document.createElement("p");
    status.textContent = progress.special
      ? (progress.unlocked ? "角色贡金值跨周目累计，无上限" : `贡金属性 ${progress.count}/100`)
      : `${scene.name}路线 ${progress.count}/${progress.threshold}`;
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = !progress.unlocked;
    button.textContent = progress.special
      ? (progress.unlocked ? "进入贡金房间" : `贡金属性还需 ${100 - progress.count} 点`)
      : (progress.unlocked ? "进入房间" : `还需 ${progress.threshold - progress.count} 次`);
    button.addEventListener("click", () => onEnter(progress.id));
    body.append(label, title, track, status, LG.roomEntryCopy.node(progress.id), button);
    card.append(image, body);
    return card;
  }

  function player(onEnter) {
    const progress = LG.playerGalleryUI.summary();
    const card = document.createElement("article");
    card.className = "room-card player-room-card unlocked";
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets.playerRoom;
    image.alt = "主角房间";
    image.loading = "lazy";
    image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const label = document.createElement("span");
    label.className = "event-type";
    label.textContent = "始终开放";
    const title = document.createElement("h3");
    title.textContent = "主角的房间";
    const status = document.createElement("p");
    status.textContent = `男女结局CG ${progress.count}/${progress.total}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "进入房间";
    button.addEventListener("click", onEnter);
    body.append(label, title, status, LG.roomEntryCopy.node("playerRoom"), button);
    card.append(image, body);
    return card;
  }

  function area(area, onEnter) {
    const progress = LG.worldAreas.progress(area);
    const card = document.createElement("article");
    card.className = "room-card area-room-card unlocked";
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets[area.cardImage || area.image];
    image.alt = area.name;
    image.loading = "lazy";
    image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const kinds = area.sections.map((section) => section.label).join(" / ");
    const track = document.createElement("div");
    track.className = "room-progress";
    const fill = document.createElement("span");
    fill.style.width = `${progress.total ? progress.count / progress.total * 100 : 0}%`;
    track.append(fill);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `进入${area.name}`;
    button.addEventListener("click", () => onEnter(area.id));
    body.append(
      Object.assign(document.createElement("span"), {
        className: "event-type", textContent: kinds,
      }),
      Object.assign(document.createElement("h3"), { textContent: area.name }),
      Object.assign(document.createElement("p"), {
        textContent: `已开放角色房间 ${progress.count}/${progress.total}`,
      }),
      LG.roomEntryCopy.node(`area-${area.id}`),
      track,
      button,
    );
    card.append(image, body);
    return card;
  }

  function scene(area, section) {
    const banner = document.createElement("section");
    banner.className = "area-scene-banner";
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets[section.image];
    image.alt = `${area.name}${section.label}场景`;
    image.loading = "lazy";
    image.decoding = "async";
    const copy = document.createElement("div");
    copy.className = "area-scene-copy";
    const label = document.createElement("span");
    label.className = "event-type";
    label.textContent = area.name;
    const title = document.createElement("h3");
    title.textContent = `${section.label}场景`;
    const description = document.createElement("p");
    description.textContent = section.description;
    copy.append(label, title, description);
    banner.append(image, copy);
    return banner;
  }

  LG.roomCards = { standard, player, area, scene };
})(window.LifeGame);
