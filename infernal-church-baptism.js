(function (LG) {
  const palette = {
    black: "#303038", cyan: "#52d7e8", gold: "#f1c84e",
    red: "#e14c45", orange: "#ef8b35", yellow: "#f0d84f",
    green: "#55c875", blue: "#4d8fe7", silver: "#c7d0dd",
    purple: "#9b65dc",
  };
  const sigilPositions = [
    ["10%", "24%", -146], ["29%", "12%", -112], ["50%", "8%", -90],
    ["71%", "12%", -68], ["90%", "24%", -34], ["82%", "53%", -8],
    ["18%", "53%", -172],
  ];
  const el = {};
  let busy = false;
  let completionTimer = 0;

  const node = (tag, cls) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    return item;
  };

  function buildSigils() {
    LG.INFERNAL_CHURCH_DATA.faiths.forEach((faith, index) => {
      const sigil = node("i", "baptism-great-sigil");
      const [x, y, angle] = sigilPositions[index];
      sigil.style.setProperty("--sigil-x", x);
      sigil.style.setProperty("--sigil-y", y);
      sigil.style.setProperty("--sigil-color", faith.color);
      sigil.innerHTML = "<b><span></span></b>";
      const thread = node("i", "baptism-soul-thread");
      thread.style.setProperty("--thread-angle", `${angle}deg`);
      thread.style.setProperty("--thread-color", faith.color);
      el.greatSigils.append(sigil);
      el.threads.append(thread);
    });
    for (let index = 0; index < 16; index += 1) {
      const sigil = node("i", "baptism-foot-sigil");
      sigil.style.setProperty("--orbit-angle", `${index * 22.5}deg`);
      sigil.style.setProperty("--orbit-delay", `${-(index % 8) * .16}s`);
      sigil.innerHTML = "<b><span></span></b>";
      el.footSigils.append(sigil);
    }
  }

  function buildParticles() {
    const destinations = [
      [-32, -38], [-18, -52], [0, -58], [18, -52],
      [32, -38], [28, -8], [-28, -8],
    ];
    for (let index = 0; index < 35; index += 1) {
      const soul = node("i");
      const [x, y] = destinations[index % destinations.length];
      soul.style.setProperty("--soul-x", `${x}vw`);
      soul.style.setProperty("--soul-y", `${y}vh`);
      soul.style.setProperty("--soul-delay", `${-(index % 12) * .12}s`);
      el.souls.append(soul);
    }
  }

  function build() {
    if (el.dialog) return;
    el.dialog = document.createElement("dialog");
    el.dialog.className = "infernal-baptism-dialog";
    el.dialog.setAttribute("aria-label", "地狱教会入教洗礼");
    el.dialog.innerHTML = `
      <div class="infernal-baptism-scene">
        <button class="quiet-button baptism-close" type="button">关闭</button>
        <div class="baptism-copy">
          <span class="event-type">地狱教会 · 入教洗礼</span>
          <h2>七欲魔纹同时抽取灵魂</h2>
          <p>教主踏近面前，七种大魔纹与四周臭脚小魔纹共同牵引灵魂。</p>
        </div>
        <div class="baptism-great-sigils" aria-hidden="true"></div>
        <div class="baptism-soul-threads" aria-hidden="true"></div>
        <div class="baptism-foot-sigils" aria-hidden="true"></div>
        <div class="baptism-target"><img alt=""><b></b></div>
        <div class="baptism-souls" aria-hidden="true"></div>
        <img class="baptism-priestess" alt="七大欲女祭司入教洗礼动作">
        <strong class="baptism-status" role="status">洗礼准备中。</strong>
      </div>`;
    el.greatSigils = el.dialog.querySelector(".baptism-great-sigils");
    el.threads = el.dialog.querySelector(".baptism-soul-threads");
    el.footSigils = el.dialog.querySelector(".baptism-foot-sigils");
    el.souls = el.dialog.querySelector(".baptism-souls");
    el.target = el.dialog.querySelector(".baptism-target img");
    el.priestess = el.dialog.querySelector(".baptism-priestess");
    el.status = el.dialog.querySelector(".baptism-status");
    buildSigils();
    buildParticles();
    el.dialog.querySelector(".baptism-close").addEventListener("click", close);
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(el.dialog);
  }

  function applySoulPalette() {
    const current = LG.infernalChurch.data()?.soul?.colors;
    const ids = Array.isArray(current) ? current.filter((id) => palette[id]) : [];
    const colors = (ids.length ? ids : ["black"]).map((id) => palette[id]);
    el.dialog.dataset.soulColors = (ids.length ? ids : ["black"]).join(" ");
    ["primary", "secondary", "tertiary"].forEach((slot, index) =>
      el.dialog.style.setProperty(`--baptism-soul-${slot}`,
        colors[index] || colors[0]));
    [...el.souls.children].forEach((soul, index) =>
      soul.style.setProperty("--soul-color", colors[index % colors.length]));
  }

  function play() {
    build();
    applySoulPalette();
    el.target.src = LG.infernalChurchMagic.targetSource();
    el.priestess.src = LG.INFERNAL_CHURCH_DATA.assets.priestess;
    el.status.textContent = "七欲魔纹正在同时抽吸灵魂。";
    if (!el.dialog.open) el.dialog.showModal();
    el.dialog.classList.remove("playing", "completed");
    void el.dialog.offsetWidth;
    el.dialog.classList.add("playing");
    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(() => {
      el.dialog.classList.add("completed");
      el.status.textContent = "入教洗礼完成，魔纹已经刻入灵魂。";
    }, 9000);
  }

  function close() {
    window.clearTimeout(completionTimer);
    el.dialog?.classList.remove("playing", "completed");
    if (el.dialog?.open) el.dialog.close();
  }

  async function start() {
    if (busy) return;
    busy = true;
    el.button.disabled = true;
    try {
      if (!LG.infernalChurch.data().selectedThisRun) {
        const result = await LG.authority.mutate(
          "joinFaction", { factionId: "church" });
        document.getElementById("infernalChurchStatus").textContent = result.message;
        LG.careerUI.refresh();
        LG.infernalChurchUI.renderChurch();
      }
      play();
    } catch (err) {
      console.error("地狱教会入教洗礼失败:", err?.code, err?.message, err?.stack);
      document.getElementById("infernalChurchStatus").textContent =
        err?.message || "入教洗礼暂时无法进行。";
    } finally {
      busy = false;
      el.button.disabled = false;
    }
  }

  LG.infernalChurchBaptism = {
    init() {
      el.button = document.getElementById("infernalChurchBaptismButton");
      el.button.addEventListener("click", start);
      window.addEventListener("pagehide", close);
    },
    play,
    close,
  };
})(window.LifeGame);
