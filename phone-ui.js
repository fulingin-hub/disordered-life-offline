(function (LG) {
  const el = {};
  let currentView = "home";
  const titles = {
    home: "手机",
    simulation: "模拟人生",
    contacts: "通讯录",
    movies: "电影播放器",
    music: "音乐播放器",
    gallery: "相册",
    news: "新闻资讯",
    system: "系统",
  };
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function contact(id, label, location, portrait, action) {
    return { id, label, location, portrait, action };
  }

  function standardContacts() {
    return LG.achievements.all().filter((item) => item.unlocked).map((item) => {
      const scene = LG.dialogueScenes.room(item.id);
      return contact(item.id,
        LG.characterDemographics.label(item.id, scene.name),
        scene.location, LG.CONFIG.assets[item.id],
        () => LG.roomsUI.openChat(item.id));
    });
  }

  function marketContacts() {
    return LG.blackMarket.characters()
      .filter((item) => LG.blackMarket.roomUnlocked(item.id))
      .map((item) => {
        const scene = LG.dialogueScenes.room(item.id);
        return contact(item.id, scene.name, scene.location,
          LG.CONFIG.assets[item.id], () => LG.roomsUI.openChat(item.id));
      });
  }

  function otherworldContacts() {
    return LG.otherworldCharacters.characters()
      .filter((item) => LG.otherworldCharacters.canChat(item.id))
      .map((item) => contact(item.id, item.name, item.location, item.portrait,
        () => LG.otherworldCharacterChatUI.open(item.id)));
  }

  function contacts() {
    const map = new Map();
    [...standardContacts(), ...marketContacts(), ...otherworldContacts()]
      .forEach((item) => map.set(item.id, item));
    return [...map.values()];
  }

  function close() {
    LG.phoneNewsUI?.cancel?.();
    el.content.querySelectorAll("video").forEach((video) => video.pause());
    if (el.dialog.open) el.dialog.close();
  }

  function openContact(item) {
    close();
    item.action();
  }

  function contactCard(item) {
    const button = node("button", "phone-contact");
    button.type = "button";
    if (LG.phoneData.validAsset(item.portrait)) {
      const image = node("img");
      image.src = item.portrait;
      image.alt = "";
      image.loading = "lazy";
      button.append(image);
    }
    const copy = node("span");
    copy.append(node("strong", "", item.label),
      node("small", "", item.location));
    button.append(copy);
    button.addEventListener("click", () => openContact(item));
    return button;
  }

  function renderContacts() {
    const items = contacts();
    el.status.textContent = `已收录 ${items.length} 位联系人`;
    if (items.length) {
      const list = node("div", "phone-contact-list");
      list.append(...items.map(contactCard));
      el.content.replaceChildren(list);
      return;
    }
    const empty = node("div", "phone-empty");
    empty.append(node("strong", "", "通讯录为空"),
      node("p", "", "完成角色路线或角色收藏后自动收录。"));
    el.content.replaceChildren(empty);
  }

  function appCard(app, counts) {
    const button = node("button", "phone-app");
    button.type = "button";
    button.dataset.phoneView = app.id;
    const icon = node("span", "phone-app-icon");
    const source = LG.CONFIG.assets[app.asset];
    if (LG.phoneData.validAsset(source)) {
      icon.style.backgroundImage = `url("${source}")`;
    }
    if (app.id === "system") {
      const glyph = node("span", "phone-system-glyph", "⚙");
      glyph.setAttribute("aria-hidden", "true");
      icon.append(glyph);
    }
    const badge = counts[app.id];
    if (badge !== undefined && badge !== 0) {
      icon.append(node("small", "phone-app-badge", String(badge)));
    }
    button.append(icon, node("strong", "", app.label));
    button.addEventListener("click", () => open(app.id));
    return button;
  }

  function renderHome() {
    const grid = node("div", "phone-app-grid");
    grid.append(...LG.phoneData.apps.map((app) =>
      appCard(app, LG.phoneData.counts())));
    el.status.textContent = "随身终端";
    el.content.replaceChildren(grid);
  }

  function render() {
    el.title.textContent = titles[currentView] || "手机";
    el.eyebrow.textContent = currentView === "home" ? "随身终端" : "手机应用";
    el.back.hidden = currentView === "home";
    el.content.className = `phone-content phone-view-${currentView}`;
    if (currentView === "simulation") {
      LG.phoneSimulationUI.render(el.content, el.status);
    } else if (currentView === "contacts") renderContacts();
    else if (currentView === "movies") {
      LG.phoneMediaUI.renderMovies(el.content, el.status);
    } else if (currentView === "music") {
      LG.phoneMediaUI.renderMusic(el.content, el.status);
    } else if (currentView === "gallery") {
      LG.phoneGalleryUI.render(el.content, el.status);
    } else if (currentView === "news") {
      LG.phoneNewsUI.open(el.content, el.status);
    } else if (currentView === "system") {
      LG.phoneSystemUI.render(el.content, el.status);
    } else renderHome();
  }

  function open(view = "home") {
    if (LG.contentMode?.strictTeen?.()
      && ["contacts", "movies", "gallery", "news"].includes(view)) {
      LG.contentMode.showTextScene("15+安全模式",
        "该应用可能包含角色影像、剧情影片或高风险资讯，已在15+模式中关闭。");
      return;
    }
    currentView = titles[view] ? view : "home";
    render();
    if (!el.dialog.open) el.dialog.showModal();
  }

  function init() {
    el.dialog = document.getElementById("phoneDialog");
    el.content = document.getElementById("phoneContent");
    el.status = document.getElementById("phoneStatus");
    el.title = document.getElementById("phoneTitle");
    el.eyebrow = document.getElementById("phoneEyebrow");
    el.back = document.getElementById("phoneBackButton");
    document.getElementById("phoneButton").addEventListener("click", () => open());
    document.getElementById("closePhoneButton").addEventListener("click", close);
    el.back.addEventListener("click", () => open("home"));
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
  }

  LG.phoneUI = {
    open,
    close,
    contactCount: () => contacts().length,
  };
  init();
})(window.LifeGame);
