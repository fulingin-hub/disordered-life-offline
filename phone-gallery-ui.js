(function (LG) {
  let category = "careers";
  const labels = {
    careers: "职业",
    companions: "战斗伙伴",
    events: "事件CG",
  };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function card(item) {
    const figure = node("figure", "phone-photo-card");
    const image = node("img");
    image.src = item.src;
    image.alt = item.title;
    image.loading = "lazy";
    image.decoding = "async";
    const caption = node("figcaption");
    caption.append(node("strong", "", item.title),
      node("small", "", item.subtitle));
    figure.append(image, caption);
    return figure;
  }

  function render(content, status) {
    const shell = node("section", "phone-gallery");
    const tabs = node("div", "phone-category-tabs");
    Object.entries(labels).forEach(([id, label]) => {
      const button = node("button", category === id ? "active" : "", label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(category === id));
      button.addEventListener("click", () => {
        category = id;
        render(content, status);
      });
      tabs.append(button);
    });
    const items = LG.phoneData.gallery(category);
    status.textContent = `${labels[category]} ${items.length} 张`;
    if (!items.length) {
      const empty = node("div", "phone-empty");
      empty.append(node("strong", "", "当前分类暂无照片"),
        node("p", "", "完成对应解锁条件后会自动同步。"));
      shell.append(tabs, empty);
    } else {
      const grid = node("div", "phone-photo-grid");
      grid.append(...items.map(card));
      shell.append(tabs, grid);
    }
    content.replaceChildren(shell);
  }

  LG.phoneGalleryUI = { render };
})(window.LifeGame);
