(function (LG) {
  const el = {};
  let busy = false;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function bookCard(book, owned, active) {
    const card = node("article", `sigil-book${owned ? " owned" : ""}${
      active ? " active" : ""}`);
    card.style.setProperty("--sigil-color", book.color);
    card.append(node("i", "sigil-book-mark"), node("strong", "", book.name),
      node("p", "", book.effect),
      node("span", "", active ? "本轮生效" : owned ? "已收录" : "未获得"));
    return card;
  }
  function renderSoul() {
    if (!el.soulFlames) return;
    const soul = LG.infernalChurch.data().soul;
    el.soulFlames.dataset.tier = soul.tier;
    el.soulFlames.replaceChildren(...soul.colors.map((color) => {
      const flame = node("i", "soul-flame");
      flame.dataset.color = color;
      return flame;
    }));
    el.soulName.textContent = `${soul.name}灵魂之火`;
    el.soulTotal.textContent = `累计人格 ${soul.total}`;
    el.soulLore.textContent = LG.INFERNAL_CHURCH_DATA.soulLore[soul.tier];
    el.soulNext.textContent = soul.tier === "rainbow" && soul.colors.length === 7
      ? "彩虹七色已经全部点燃" : `下一档人格阈值 ${soul.nextThreshold}`;
    el.soulEffects.replaceChildren(...soul.effects.map((effect) =>
      node("li", "", effect)), ...(soul.protectionRemaining
      ? [node("li", "soul-protection", `本局魔气保护剩余 ${soul.protectionRemaining} 秒`)]
      : []));
    LG.soulFlameGuideUI.render(soul);
  } function corruptionCollection() {
    const data = LG.infernalChurch.data();
    const owned = new Set(data.ownedBooks);
    const cards = LG.INFERNAL_CHURCH_DATA.books.map((book) => {
      const hasBook = owned.has(book.id);
      const card = node("article", `collectible-card${hasBook ? " owned" : ""}`);
      card.append(node("span", "collectible-mark", hasBook ? "已获得" : "未获得"),
        node("strong", "", book.name), node("p", "", book.effect));
      return card;
    });
    return { count: owned.size, total: LG.INFERNAL_CHURCH_DATA.books.length, cards };
  }
  function renderChurch() {
    const data = LG.infernalChurch.data();
    el.churchState.textContent = !data.joined
      ? "尚未加入魔纹教会。"
      : !data.selectedThisRun ? "本轮尚未选择魔纹教会阵营。"
        : data.activeBooks.length ? `本轮信仰：${
          LG.infernalChurch.faith(data.faith)?.name || "无"}`
          : "女祭司正在等待你的选择。";
    el.activeBooks.replaceChildren(...(LG.infernalChurch.activeBooks().length
      ? LG.infernalChurch.activeBooks().map((book) => bookCard(book, true, true))
      : [node("p", "church-empty", "本轮尚未领取魔纹法术书。")]));
    el.faiths.replaceChildren(...LG.INFERNAL_CHURCH_DATA.faiths.map((faith) => {
      const button = node("button", "faith-choice");
      button.type = "button";
      button.style.setProperty("--sigil-color", faith.color);
      button.append(node("i", ""), node("strong", "", faith.name),
        node("span", "", faith.effect));
      button.disabled = busy || !data.selectedThisRun || data.activeBooks.length > 0;
      button.addEventListener("click", () => choose(faith.id));
      return button;
    }));
    el.noFaith.disabled = busy || !data.selectedThisRun || data.activeBooks.length > 0;
  }
  async function choose(faithId) {
    if (busy) return;
    busy = true;
    renderChurch();
    try {
      const result = await LG.authority.mutate("chooseInfernalFaith", { faithId });
      el.churchStatus.textContent = result.message;
      LG.careerUI.refresh();
      LG.equipmentUI.refresh();
      renderChurch(); renderSoul(); LG.collectiblesUI?.refresh?.();
    } catch (err) {
      console.error("魔纹教会信仰结算失败:", err?.code, err?.message, err?.stack);
      el.churchStatus.textContent = err?.message || "信仰选择失败，请稍后重试。";
    } finally {
      busy = false; renderChurch();
    }
  }
  async function cast(source = "七大欲女祭司", explicitSin = null, options = {}) {
    if (busy) return;
    busy = true;
    const theme = LG.infernalChurchMagic.resolve(source, explicitSin);
    const portrait = LG.infernalChurchMagic.targetPortrait(options);
    el.magicDialog.dataset.sigil = theme.id;
    el.magicDialog.dataset.sigilMode = theme.mode;
    el.magicDialog.dataset.portraitTier = portrait.tier;
    el.magicDialog.dataset.roomCastCount = String(portrait.count);
    el.magicDialog.style.setProperty("--magic-color", theme.color);
    el.magicTarget.src = portrait.src;
    el.magicTarget.alt = portrait.label;
    el.magicSource.textContent = `${source} · ${theme.name}魔纹`;
    el.magicResult.textContent = `${theme.name}魔气正在锁定灵魂…`;
    el.magicDialog.classList.remove("casting");
    if (!el.magicDialog.open) el.magicDialog.showModal();
    void el.magicDialog.offsetWidth;
    el.magicDialog.classList.add("casting");
    try {
      const result = await LG.authority.mutate("magicGasAttack", {
        source, seconds: 5, roomCharacter: options.roomCharacter,
      });
      el.magicResult.textContent = result.message;
      renderSoul(); LG.collectiblesUI?.refresh?.();
    } catch (err) {
      console.error("魔气技能结算失败:", err?.code, err?.message, err?.stack);
      el.magicResult.textContent = err?.message || "魔气技能暂时失效。";
    } finally {
      busy = false;
      window.setTimeout(() => el.magicDialog.classList.remove("casting"), 1800);
    }
  }
  function roomCard() {
    const data = LG.infernalChurch.data();
    const card = node("article", "room-card area-room-card church-room-card unlocked");
    const image = node("img");
    image.src = LG.INFERNAL_CHURCH_DATA.assets.sanctuary;
    image.alt = "魔纹教会祭祀所";
    image.loading = "lazy";
    const body = node("div", "room-card-body");
    const button = node("button", "", "进入祭祀所");
    button.type = "button";
    button.addEventListener("click", () => {
      renderChurch();
      if (!el.dialog.open) el.dialog.showModal();
    });
    body.append(node("span", "event-type", data.joined ? "教会成员" : "阵营可加入"),
      node("h3", "", "七大欲女祭司的祭祀所"),
      node("p", "", "七大欲的人间体，降临凡间，如果想成为魔纹贱畜就快点爬来跪好，接受教主的踩脸洗礼，成为光荣的魔纹贱畜吧！"),
      button);
    card.append(image, body);
    return card;
  }
  function loadoutPanel() {
    const data = LG.infernalChurch.data();
    const panel = node("section", "career-sigil-panel");
    const button = node("button", "career-primary", "魔纹法术书");
    button.type = "button";
    button.addEventListener("click", () => {
      renderChurch();
      if (!el.dialog.open) el.dialog.showModal();
    });
    panel.append(node("strong", "", data.activeBooks.length
      ? `本轮增益 ${data.activeBooks.length}项` : "本轮未获得魔纹增益"),
    node("p", "", LG.infernalChurch.activeBooks()
      .map((book) => `${book.name}：${book.effect}`).join("；")
      || "选择魔纹教会阵营后，前往祭祀所领取赏赐。"), button);
    return panel;
  }
  function magicPanel(source, explicitSin = null) {
    const panel = node("section", "church-magic-action");
    const button = node("button", "", "魔气入脑");
    button.type = "button";
    button.addEventListener("click", () => cast(source, explicitSin));
    panel.append(node("strong", "", "魔纹能力"),
      node("p", "", "魔气会牵引目标灵魂；法术书与彩色灵魂可改变结算。"), button);
    return panel;
  }
  LG.infernalChurchUI = {
    init() {
      [["dialog", "infernalChurchDialog"], ["churchState", "infernalChurchState"],
        ["churchStatus", "infernalChurchStatus"], ["faiths", "infernalChurchFaiths"],
        ["activeBooks", "infernalChurchActiveBooks"], ["noFaith", "infernalChurchNoFaith"],
        ["soulFlames", "soulFlames"], ["soulName", "soulName"],
        ["soulTotal", "soulTotal"], ["soulLore", "soulLore"],
        ["soulNext", "soulNext"], ["soulEffects", "soulEffects"],
        ["magicDialog", "magicGasDialog"],
        ["magicSource", "magicGasSource"], ["magicResult", "magicGasResult"],
        ["magicTarget", "magicGasTarget"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      document.getElementById("closeInfernalChurchButton")
        .addEventListener("click", () => el.dialog.close());
      document.getElementById("closeMagicGasButton")
        .addEventListener("click", () => el.magicDialog.close());
      el.noFaith.addEventListener("click", () => choose(null));
      document.getElementById("priestessTrialButton")
        .addEventListener("click", () => LG.priestessTrialUI.open());
      el.magicDialog.addEventListener("cancel", (event) => {
        event.preventDefault(); el.magicDialog.close();
      });
      LG.infernalChurchBaptism.init();
      LG.authority.subscribe(() => {
        renderSoul(); LG.collectiblesUI?.refresh?.();
        if (el.dialog.open) renderChurch();
      });
      renderSoul();
    },
    roomCard, loadoutPanel, magicPanel, cast, renderChurch,
    renderSoul, corruptionCollection,
  };
})(window.LifeGame);
