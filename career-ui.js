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
      LG.equipmentUI.refresh();
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
      LG.infernalChurchUI.loadoutPanel(),
      node("h3", "", "装备职业套装"), modes, copy,
    );
  }
  function renderFactions() {
    const data = LG.career.data();
    const grid = node("div", "faction-grid");
    (data.factions || []).forEach((item) =>
      grid.append(LG.careerFactionCard.create(item, data.joinedThisRun, {
        busy, node,
        onJoin: (factionId) => factionId === "holy-light"
          ? mutate("joinHolyLight")
          : mutate("joinFaction", { factionId }),
      })));
    const roster = node("div", "career-roster");
    LG.CAREER_DATA.roster.forEach((item) => {
      const joined = item.faction === "holy-light"
        ? LG.holyLight.data().joined || LG.holyLight.data().baptized
        : data.memberships?.includes(item.faction);
      const card = node("button", "", LG.CAREER_DATA.characterLabel(item));
      card.type = "button";
      card.style.backgroundImage = `linear-gradient(rgba(11,14,19,.18),rgba(11,14,19,.94)),url("${
        LG.careerPortraits.characterSource(item)}")`;
      card.title = `${LG.CAREER_DATA.factions[item.faction].name} · 售卖${item.pieces}个套装部件`;
      card.disabled = !joined;
      card.addEventListener("click", () => LG.factionStoreUI.open(item.id));
      roster.append(card);
    });
    el.factions.replaceChildren(grid,
      node("h3", "", `阵营职业角色 · ${LG.CAREER_DATA.roster.length}人`), roster);
  }
  function open(nextView = view) {
    view = ["stats", "loadout", "abilities", "factions", "companions"].includes(nextView)
      ? nextView : "stats";
    render();
    if (!el.dialog.open) el.dialog.showModal();
  }
  function render() {
    renderStats();
    renderLoadout();
    LG.careerAbilityUI.render();
    renderFactions();
    if (view === "companions") LG.vehicleProfileUI?.render?.();
    Object.entries({ stats: el.stats, loadout: el.loadout, abilities: el.abilities,
      factions: el.factions, companions: el.companions })
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
      el.abilities = document.getElementById("careerAbilitiesView");
      el.factions = document.getElementById("careerFactionsView");
      el.companions = document.getElementById("careerCompanionsView");
      const vehiclePage = document.getElementById("vehiclePage");
      vehiclePage.hidden = false;
      el.companions.append(vehiclePage);
      el.tabs = [...document.querySelectorAll("[data-career-view]")];
      el.button.addEventListener("click", () => open());
      document.getElementById("closeCareerButton")
        .addEventListener("click", () => el.dialog.close());
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        view = button.dataset.careerView;
        render();
      }));
    },
    open,
    close() {
      if (el.dialog?.open) el.dialog.close();
    },
    refresh() { if (el.dialog?.open) render(); },
  };
})(window.LifeGame);
