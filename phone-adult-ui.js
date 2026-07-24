(function (LG) {
  let category = "images";
  let latestRender = 0;
  const labels = { images: "图片", videos: "视频动画", characters: "角色" };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function likeButton(item, render) {
    const globalCount = LG.phonePreferences.globalCount(item);
    const label = LG.phonePreferences.liked(item) ? "已赞" : "点赞";
    const button = node("button", "phone-like-button",
      globalCount ? `${label} ${globalCount}` : label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(LG.phonePreferences.liked(item)));
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await LG.phonePreferences.toggle(item);
      } catch (err) {
        console.error("手机点赞保存失败:",
          err?.code, err?.message, err?.stack);
      } finally {
        render();
      }
    });
    return button;
  }

  function card(item, render) {
    const card = node("article", `phone-adult-card phone-adult-${item.kind}`);
    if (item.kind === "video") {
      const preview = node("div", "phone-adult-video-preview");
      preview.style.backgroundImage = `url("${item.portrait}")`;
      preview.append(node("span", "", "视频动画"));
      const play = node("button", "", "播放");
      play.type = "button";
      play.addEventListener("click", () => {
        LG.phoneUI.close();
        LG.galleryAnimationTemplates.play(item.characterId, item.template);
      });
      preview.append(play);
      card.append(preview);
    } else {
      const image = node("img");
      image.src = item.src;
      image.alt = item.title;
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    }
    const footer = node("div", "phone-adult-card-footer");
    footer.append(node("strong", "", item.title),
      node("small", "", item.subtitle), likeButton(item, render));
    if (item.kind === "character") {
      const gallery = node("button", "phone-gallery-button", "查看画廊");
      gallery.type = "button";
      gallery.addEventListener("click", () => {
        LG.phoneUI.close();
        LG.galleryUI.open(item.characterId);
      });
      footer.append(gallery);
    }
    card.append(footer);
    return card;
  }

  function summary() {
    const box = node("div", "phone-like-summary");
    const top = LG.phonePreferences.top(3);
    box.append(node("strong", "", "你的偏好"));
    if (!top.length) {
      box.append(node("small", "", "点赞后会在这里记录你更喜欢的图片、动画和角色。"));
      return box;
    }
    top.forEach((item, index) => box.append(
      node("span", "", `${index + 1}. ${item.title} · ${labels[item.kind + "s"] || "图片"}`),
    ));
    return box;
  }

  function globalSummary() {
    const state = LG.phonePreferences.globalState();
    const box = node("div", `phone-global-summary is-${state.status}`);
    box.append(node("strong", "", "全体玩家偏好"));
    if (state.status === "ready" && state.top.length) {
      state.top.slice(0, 3).forEach((item, index) => box.append(
        node("span", "", `${index + 1}. ${item.title} · ${item.count} 赞`),
      ));
      box.append(node("small", "", state.message));
    } else if (state.status === "ready") {
      box.append(node("small", "", "暂无全体点赞，成为第一个点赞的玩家。"));
    } else {
      box.append(node("small", "", state.message || "正在读取全体偏好…"));
    }
    return box;
  }

  async function refreshGlobal(items, renderId, content, status) {
    await LG.phonePreferences.loadGlobal(items);
    if (renderId !== latestRender || !content.isConnected) return;
    render(content, status, false);
  }

  function render(content, status, refresh = true) {
    const renderId = ++latestRender;
    const shell = node("section", "phone-adult-site");
    if (!LG.contentMode?.adultSimulation?.()) {
      shell.append(node("div", "phone-empty", "成人网站只在18+模拟人生中开放。"));
      status.textContent = "应用未开放";
      content.replaceChildren(shell);
      return;
    }
    const tabs = node("div", "phone-category-tabs");
    Object.entries(labels).forEach(([id, label]) => {
      const button = node("button", category === id ? "active" : "", label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(category === id));
      button.addEventListener("click", () => { category = id; render(content, status); });
      tabs.append(button);
    });
    const items = LG.phoneData.adultContent(category);
    const grid = node("div", "phone-adult-grid");
    grid.append(...items.map((item) => card(item, () => render(content, status))));
    shell.append(summary(), globalSummary(), tabs);
    if (items.length) shell.append(grid);
    else shell.append(node("div", "phone-empty", "当前分类暂无已解锁内容。"));
    status.textContent = `${labels[category]} ${items.length} 项 · 已点赞 ${LG.phonePreferences.count()}`;
    content.replaceChildren(shell);
    if (refresh) refreshGlobal(items, renderId, content, status);
  }

  LG.phoneAdultUI = { render };
})(window.LifeGame);
