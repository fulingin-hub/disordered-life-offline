(function (LG) {
  const el = {};
  let view = "stats", busy = false;
  const draft = {};
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  async function mutate(method, body) {
    if (busy) return;
    busy = true;
    try {
      const result = await LG.authority.mutate(method, body);
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.protagonistPortrait.render(LG.authority.state());
    } catch (err) {
      console.error("职业系统结算失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "职业操作失败，请稍后重试。";
    } finally {
      busy = false;
      render();
    }
  }
  function statCard(id, label, data, points, spent) {
    const card = node("article", "career-stat-card");
    const value = data.allocatedStats?.[id] || 0;
    card.append(node("strong", "", label),
      node("span", "", `本轮 +${data.runStats?.[id] || 0}`),
      node("span", "", `累计 ${data.lifetimeStats?.[id] || 0}`),
      node("span", "", `加点 ${value + (draft[id] || 0)}`));
    const controls = LG.careerStatInput.create({
      label, disabled: busy, canDecrease: value + (draft[id] || 0) > 0,
      max: points - spent + (draft[id] || 0),
      onAdjust(amount) {
        const next = (draft[id] || 0) + amount;
        if (next) draft[id] = next; else delete draft[id];
        renderStats();
      },
      onApply(amount) {
        if (amount) draft[id] = amount; else delete draft[id];
        renderStats();
      },
    });
    card.append(controls);
    return card;
  }
  function renderStats() {
    const data = LG.career.data();
    const points = LG.traits.points();
    const spent = Object.values(draft).reduce((sum, value) => sum + value, 0);
    const summary = node("div", "career-summary");
    summary.append(node("div", "", `可用属性点 ${points}`), node("div", "",
      `待保存 ${spent} · 保存后剩余 ${points - spent}`),
      node("div", "", `本轮职业收益 ${Object.values(data.runStats || {})
        .reduce((sum, value) => sum + value, 0)}`));
    const grid = node("div", "career-stat-grid");
    Object.entries(LG.CAREER_DATA.stats).forEach(([id, label]) =>
      grid.append(statCard(id, label, data, points, spent)));
    const save = node("button", "career-primary", "保存职业加点");
    save.type = "button";
    save.disabled = busy || !Object.keys(draft).length || spent > points;
    save.addEventListener("click", async () => {
      await mutate("allocateCareer", { changes: { ...draft } });
      Object.keys(draft).forEach((id) => delete draft[id]); renderStats();
    });
    el.stats.replaceChildren(summary, grid, save);
  }
  function selectControl(label, options, value, method, key) {
    const wrap = node("label", "career-select");
    wrap.append(node("span", "", label));
    const select = node("select");
    select.append(new Option("未装备", ""));
    options.forEach((item) => select.append(new Option(item.name, item.id)));
    select.value = value || "";
    select.addEventListener("change", () => mutate(method, {
      [key]: select.value || null,
    }));
    wrap.append(select);
    return wrap;
  }
  function renderLoadout() {
    const data = LG.career.data();
    const jobs = (data.professionDefinitions || []).filter((item) => item.unlocked);
    const medals = LG.career.medals();
    const modes = node("div", "career-mode-grid");
    [["", "不装备套装"], ["master", "职业大师"], ["consumable", "职业耗材"]]
      .forEach(([id, label]) => {
        const button = node("button", data.outfitMode === id ? "active" : "", label);
        button.type = "button";
        button.disabled = busy || (id && !data.equippedProfession);
        button.addEventListener("click", () =>
          mutate("equipCareerOutfit", { mode: id || null }));
        modes.append(button);
      });
    const copy = node("p", "career-copy", data.loadoutSummary
      || "职业效果由权威结算服务管理。");
    el.loadout.replaceChildren(
      LG.careerArtUI.panel(data),
      selectControl("装备职业", jobs, data.equippedProfession,
        "equipProfession", "professionId"),
      selectControl("装备职业勋章", medals, data.equippedMedal,
        "equipCareerMedal", "medalId"),
      node("h3", "", "装备职业套装"), modes, copy,
    );
  }
  function factionCard(item, joinedThisRun) {
    const meta = LG.CAREER_DATA.factions[item.id];
    const selected = joinedThisRun === item.id;
    const card = node("article", `faction-card${item.joined ? " joined" : ""}${
      selected ? " selected" : ""}`);
    card.append(node("span", "career-kicker", meta.location),
      node("strong", "", item.name), node("p", "", meta.copy),
      node("small", "", `加入条件：累计${item.threshold}${LG.CAREER_DATA.stats[item.stat]}。`));
    const button = node("button", "", selected ? "本轮已选择"
      : item.joined ? "选择此势力" : "递交聘用证明");
    button.type = "button";
    button.disabled = busy || Boolean(joinedThisRun);
    button.addEventListener("click", () => mutate("joinFaction", { factionId: item.id }));
    card.append(button);
    return card;
  }
  function renderFactions() {
    const data = LG.career.data();
    const grid = node("div", "faction-grid");
    (data.factions || []).forEach((item) =>
      grid.append(factionCard(item, data.joinedThisRun)));
    const roster = node("div", "career-roster");
    LG.CAREER_DATA.roster.forEach((item) => {
      const card = node("button", "", LG.CAREER_DATA.characterLabel(item));
      card.type = "button";
      card.style.backgroundImage = `linear-gradient(rgba(11,14,19,.18),rgba(11,14,19,.94)),url("${
        LG.careerPortraits.characterSource(item)}")`;
      card.title = `${LG.CAREER_DATA.factions[item.faction].name} · 售卖${item.pieces}个套装部件`;
      card.disabled = !data.memberships?.includes(item.faction);
      card.addEventListener("click", () => LG.factionStoreUI.open(item.id));
      roster.append(card);
    });
    el.factions.replaceChildren(grid,
      node("h3", "", "势力职业角色 · 84人（国立大学三分校54人）"), roster);
  }
  function renderBenefits() {
    const data = LG.career.data();
    const certificate = node("article", "career-benefit");
    certificate.append(node("strong", "", "六大势力的聘用证明"),
      node("p", "", data.certificateAvailable
        ? "黑中介夫妻已开放证明页面。每轮人生只能选择一个势力。"
        : "需要100000属性点并累计获得10000资金。"));
    const menu = node("div", "career-menu-grid");
    (data.menuItems || []).forEach((item) => {
      const used = data.menu?.used?.includes(item.id);
      const button = node("button", used ? "used" : "", item.name);
      button.type = "button";
      button.disabled = busy || used;
      button.title = item.stats.map((id) => `${LG.CAREER_DATA.stats[id]}+500`).join("、");
      button.addEventListener("click", () => mutate("eatLegendaryMenu", { itemId: item.id }));
      menu.append(button);
    });
    const achievements = data.achievement || {};
    const counts = data.servant || {}, badge = node("p", "career-copy", `“百世家奴，方知主恩。”：${achievements.restaurant ? "已解锁" : "未解锁"}（${
      counts.restaurant || 0}/100）；“永世家奴，终生不悔。”：${achievements.eternal ? "已解锁" : "未解锁"}（${
      counts.eternal || 0}/100）；“金牌家奴”：${achievements.gold ? "已解锁" : "未解锁"}。`);
    el.benefits.replaceChildren(certificate, node("h3", "", "街头传奇的菜单"),
      badge, menu);
  }
  function render() {
    renderStats();
    renderLoadout();
    renderFactions();
    renderBenefits();
    Object.entries({ stats: el.stats, loadout: el.loadout,
      factions: el.factions, benefits: el.benefits })
      .forEach(([id, section]) => { section.hidden = id !== view; });
    el.tabs.forEach((button) =>
      button.setAttribute("aria-selected", String(button.dataset.careerView === view)));
  }
  LG.careerUI = {
    init() {
      el.button = document.getElementById("careerButton");
      el.dialog = document.getElementById("careerDialog");
      el.status = document.getElementById("careerStatus");
      el.stats = document.getElementById("careerStatsView");
      el.loadout = document.getElementById("careerLoadoutView");
      el.factions = document.getElementById("careerFactionsView");
      el.benefits = document.getElementById("careerBenefitsView");
      el.tabs = [...document.querySelectorAll("[data-career-view]")];
      el.button.addEventListener("click", () => { render(); el.dialog.showModal(); });
      document.getElementById("closeCareerButton")
        .addEventListener("click", () => el.dialog.close());
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        view = button.dataset.careerView;
        render();
      }));
    },
    refresh() { if (el.dialog?.open) render(); },
  };
})(window.LifeGame);
