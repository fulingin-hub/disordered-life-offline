(function (LG) {
  let dialog, image, title, counter, next;
  let items = [], index = 0;
  const stageTitles = {
    ordinary: "第一幕 · 生命的美好",
    good: "第二幕 · 及时回头并不难",
    true: "第三幕 · 人类的诞生来自永不放弃",
    abyss: "第四幕 · 正是修行时",
    "new-saint": "第五幕 · 新圣徒的诞生",
  };
  const fallbackIds = {
    ordinary: ["normal-life", "beautiful-life", "healthy-life"],
    good: ["reject-temptation", "penitentiary-reborn", "penitentiary-released"],
    true: ["saint", "infernal-cleanse", "penitentiary-true-redemption"],
    abyss: ["infernal-cleanse"],
    "new-saint": ["holy-father-above"],
  };
  function source(id, gender) {
    return LG.CG_ASSETS.endingSrc(id, gender);
  }
  function archiveItems(stage, gender) {
    const archive = LG.authority.archiveView(gender).filter((entry) => !entry.locked);
    let selected = [];
    if (stage === "ordinary") {
      selected = archive.filter((entry) => entry.ordinary && !entry.trueEnding);
    } else if (stage === "good") {
      selected = archive.filter((entry) =>
        entry.ordinary && entry.hidden && !entry.trueEnding);
    } else if (stage === "true") {
      selected = archive.filter((entry) => entry.trueEnding);
    }
    const mapped = selected.map((entry) => ({
      title: entry.title, src: source(entry.id, gender),
    })).filter((entry) => entry.src);
    if (mapped.length) return mapped;
    return fallbackIds[stage].map((id) => ({
      title: LG.authority.archiveView(gender)
        .find((entry) => entry.id === id)?.title || stageTitles[stage],
      src: source(id, gender),
    })).filter((entry) => entry.src);
  }
  function show() {
    const item = items[index];
    if (!item) return;
    image.src = item.src;
    image.alt = item.title;
    title.textContent = item.title;
    counter.textContent = `${index + 1}/${items.length}`;
    next.textContent = index + 1 < items.length ? "下一张" : "返回选择";
  }
  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "saint-cinema-dialog";
    dialog.innerHTML = `<header><div><span class="event-type"></span>
      <h2></h2></div><button type="button">关闭</button></header>
      <img alt=""><footer><strong></strong><span></span>
      <button type="button"></button></footer>`;
    image = dialog.querySelector("img");
    title = dialog.querySelector("footer strong");
    counter = dialog.querySelector("footer span");
    next = dialog.querySelector("footer button");
    dialog.querySelector("header button").addEventListener("click", () => dialog.close());
    next.addEventListener("click", () => {
      if (index + 1 >= items.length) dialog.close();
      else { index += 1; show(); }
    });
    document.body.append(dialog);
  }
  LG.saintTrialCinema = {
    play(stage) {
      if (!stageTitles[stage]) return;
      if (!dialog) build();
      const gender = LG.authority.state()?.gender === "female" ? "female" : "male";
      items = archiveItems(stage, gender);
      if (!items.length) return;
      index = 0;
      dialog.querySelector(".event-type").textContent = stageTitles[stage];
      show();
      if (!dialog.open) dialog.showModal();
    },
  };
})(window.LifeGame);
