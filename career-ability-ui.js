(function (LG) {
  let panel, busy = false;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const format = (value) => Number(value || 0).toLocaleString("zh-CN");
  async function upgrade(levels) {
    if (busy) return;
    busy = true;
    render();
    try {
      const result = await LG.authority.mutate("upgradePilotSystem", { levels });
      document.getElementById("careerStatus").textContent = result.message;
      LG.traitsUI.refresh();
    } catch (err) {
      console.error("机师辅助系统升级失败:", err?.code, err?.message, err?.stack);
      document.getElementById("careerStatus").textContent =
        err?.message || "机师辅助系统升级失败，请重试。";
    } finally {
      busy = false;
      render();
    }
  }
  function magicBook() {
    const data = LG.infernalChurch.data();
    const card = node("article", "career-ability-card");
    const active = new Set(data.activeBooks || []);
    const books = (data.books || []).filter((book) =>
      book.owned || active.has(book.id));
    card.append(node("span", "event-type", "魔纹教会职业能力"),
      node("h3", "", `魔纹法术书 · ${data.bookLevel || 0}/300级`),
      node("p", "", books.length
        ? books.map((book) => `${active.has(book.id) ? "生效" : "已收录"}：${
          book.name} · ${book.effect}`).join("\n")
        : "完成魔纹教会洗礼并选择信仰后获得魔纹法术书。"));
    return card;
  }
  function mechFigure(type, factionId) {
    const info = LG.careerAbilityData.mechs[type];
    const figure = node("figure", "career-mech-figure");
    const image = node("img");
    image.src = info.src;
    image.alt = `${LG.careerAbilityData.factionName(factionId)}${info.name}`;
    figure.append(image, LG.careerAbilityData.plate(factionId),
      node("figcaption", "", `${info.name} · ${info.copy}`));
    return figure;
  }
  function pilotSystem() {
    const career = LG.career.data();
    const pilot = career.pilot || {};
    const ability = career.pilotAbility || {};
    const factionId = ability.activeFaction || pilot.certifications?.[0]
      || (LG.careerAbilityData.factions[career.joinedThisRun]
        ? career.joinedThisRun : "university");
    const card = node("article", "career-ability-card");
    card.append(node("span", "event-type", "六大势力职业能力"),
      node("h3", "", `机师辅助系统 · ${ability.level || 0}/300级`),
      node("p", "", ability.benefit || "每级七项角色属性各+50。"),
      node("p", "", ability.activeFaction
        ? `当前势力能力：${ability.activeFactionName} · ${
          LG.careerAbilityData.factionEffect(ability.activeFaction)}`
        : "装备任意势力二阶机师职业并将系统提升至1级后，激活对应势力能力。"));
    const progress = node("progress");
    progress.max = Math.max(1, ability.levelExperienceTarget || 0);
    progress.value = Math.min(progress.max, ability.levelExperience || 0);
    const actions = node("div", "career-ability-actions");
    [[1, ability.nextCost], [ability.tenLevelCount, ability.tenLevelCost]]
      .filter(([levels]) => levels > 0).forEach(([levels, cost]) => {
        const button = node("button", "", busy ? "升级中…"
          : `提升${levels}级 · ${format(cost)}属性点`);
        button.type = "button";
        button.disabled = busy || !ability.canUpgrade
          || ability.balance < cost || ability.level >= ability.maxLevel;
        button.addEventListener("click", () => upgrade(levels));
        actions.append(button);
      });
    const gallery = node("div", "career-mech-grid");
    gallery.append(mechFigure("black", factionId), mechFigure("white", factionId));
    card.append(progress, actions, node("small", "",
      `一级机师认证：${pilot.certifications?.length || 0}/6 · 黑鲨：${
        pilot.mechs?.black?.length || 0}/6 · 白鲨：${pilot.mechs?.white?.length || 0}/6`),
    gallery);
    return card;
  }
  function render() {
    if (!panel) panel = document.getElementById("careerAbilitiesView");
    if (panel) panel.replaceChildren(magicBook(), pilotSystem());
  }
  LG.careerAbilityUI = { render };
})(window.LifeGame);
