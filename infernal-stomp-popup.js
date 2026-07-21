(function (LG) {
  const queens = [
    ["greed", "贪婪", "infernalStompGreed", "31%", "39%"],
    ["lust", "色欲", "infernalStompLust", "49%", "52%"],
    ["wrath", "愤怒", "infernalStompWrath", "35%", "43%"],
    ["sloth", "懒惰", "infernalStompSloth", "50%", "48%"],
    ["pride", "傲慢", "infernalStompPride", "43%", "50%"],
    ["envy", "嫉妒", "infernalStompEnvy", "27%", "39%"],
    ["gluttony", "暴食", "infernalStompGluttony", "49%", "51%"],
  ].map(([id, name, asset, x, y]) => ({ id, name, asset, x, y }));
  const voice = "./assets/voices/infernal/queen-stomp-ja.mp3";
  const groupSizes = [1, 2, 3, 7];
  let dialog;
  let portraits;
  let foot;
  let title;
  let line;
  let audio;
  let fallbackTimer;

  function close() {
    window.clearTimeout(fallbackTimer);
    audio.pause();
    audio.currentTime = 0;
    dialog.classList.remove("playing");
    if (dialog.open) dialog.close();
  }

  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "infernal-stomp-popup";
    dialog.setAttribute("aria-label", "地狱女魔王踩脸惩罚");
    const scene = document.createElement("div");
    scene.className = "infernal-stomp-scene";
    portraits = document.createElement("div");
    portraits.className = "infernal-stomp-queens";
    foot = document.createElement("div");
    foot.className = "infernal-stomp-foot";
    const shade = document.createElement("div");
    shade.className = "infernal-stomp-shade";
    const caption = document.createElement("div");
    caption.className = "infernal-stomp-caption";
    title = document.createElement("strong");
    line = document.createElement("span");
    line.textContent = "いい子ね、堕落した家畜奴隷。堕ちながら射精しなさい。";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "infernal-stomp-close";
    button.textContent = "×";
    button.setAttribute("aria-label", "关闭");
    button.addEventListener("click", close);
    caption.append(title, line);
    scene.append(portraits, foot, shade, caption, button);
    dialog.append(scene);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    document.body.append(dialog);
    audio = new Audio(voice);
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      dialog.classList.remove("playing");
      fallbackTimer = window.setTimeout(close, 700);
    });
    window.addEventListener("pagehide", close);
  }

  function groupFor(queen, forcedSize) {
    const size = groupSizes.includes(forcedSize)
      ? forcedSize : groupSizes[Math.floor(Math.random() * groupSizes.length)];
    const others = queens.filter((item) => item.id !== queen.id);
    for (let index = others.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [others[index], others[swap]] = [others[swap], others[index]];
    }
    return [queen, ...others].slice(0, size);
  }

  function renderGroup(group) {
    portraits.replaceChildren(...group.map((queen, index) => {
      const image = document.createElement("img");
      image.className = "infernal-stomp-queen";
      image.src = LG.CONFIG.assets[queen.asset];
      image.alt = `${queen.name}地狱女魔王`;
      image.style.setProperty("--queen-index", index);
      return image;
    }));
  }

  function show(forcedId, forcedVariant, forcedGroupSize) {
    if (!dialog) build();
    const queen = queens.find((item) => item.id === forcedId);
    if (!queen) return "";
    const src = LG.CONFIG.assets[queen.asset];
    const group = groupFor(queen, forcedGroupSize);
    const variant = LG.footVariants.normalize(
      forcedVariant || LG.footVariants.pick());
    renderGroup(group);
    LG.footVariants.apply(foot, variant, src);
    foot.style.setProperty("--foot-x", queen.x);
    foot.style.setProperty("--foot-y", queen.y);
    title.textContent = group.length === 7 ? "七大地狱女魔王"
      : group.map((item) => item.name).join("、") + "地狱女魔王";
    line.textContent = group.length > 1
      ? "いい子ね。私たちの前で、もっと深く堕ちなさい。"
      : "いい子ね、堕落した家畜奴隷。堕ちながら射精しなさい。";
    dialog.dataset.queen = queen.id;
    dialog.dataset.footVariant = variant;
    dialog.dataset.groupSize = String(group.length);
    dialog.dataset.queenGroup = group.map((item) => item.id).join(",");
    if (!dialog.open) dialog.showModal();
    dialog.classList.remove("playing");
    void dialog.offsetWidth;
    dialog.classList.add("playing");
    window.clearTimeout(fallbackTimer);
    audio.currentTime = 0;
    if (LG.audio?.isEnabled?.()) {
      audio.play().catch((err) => {
        console.warn("女魔王日语旁白播放失败:", err?.message, err?.stack);
        fallbackTimer = window.setTimeout(close, 6500);
      });
    } else {
      fallbackTimer = window.setTimeout(close, 6500);
    }
    return queen.id;
  }

  LG.infernalStompPopup = { init: build, show, close };
})(window.LifeGame);
