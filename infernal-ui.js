(function (LG) {
  const el = {}; let view = "hall", busy = false, latest = 0;
  function node(tag, className, text) {
    const item = document.createElement(tag); if (className) item.className = className;
    if (text !== undefined) item.textContent = text; return item;
  } function setView(next) {
    view = next === "run" ? "run" : "hall";
    el.hall.hidden = view !== "hall"; el.run.hidden = view !== "run";
    el.close.textContent = view === "run" ? "返回悬赏大厅" : "关闭";
    el.tabs.forEach((button) => button.classList.toggle("active", button.dataset.infernalView === view));
  }
  function close() {
    latest += 1;
    if (view === "run") { setView("hall");
      render("已返回悬赏大厅，当前七层进度已保留。"); return; }
    el.dialog.close(); LG.audio.scene("world");
  }
  function renderStats() {
    const stats = LG.infernalRealm.stats();
    el.defeat.textContent = String(stats.defeat); el.personality.textContent = String(stats.personality);
    el.reputation.textContent = String(stats.reputation); el.clears.textContent = String(stats.clears);
  }
  function taskCard(task) {
    const target = Math.max(10, Number(task.target) || 10);
    const card = node("article", `infernal-task${task.completed ? " completed" : ""}`);
    const heading = node("div", "infernal-task-heading");
    heading.append(node("strong", "", task.name),
      node("span", "", task.completed ? "已结算" : `${task.progress}/${target}`));
    const progress = node("progress");
    progress.max = target;
    progress.value = Math.min(target, Math.max(0, Number(task.progress) || 0));
    card.append(heading, progress,
      node("small", "", `击杀${target}次 · ${
        task.rewardText || "奖励由权威服务结算"}`));
    return card;
  }
  function renderHall() {
    const board = LG.infernalRealm.board();
    const run = LG.infernalRealm.run();
    el.round.textContent = `第${board.round + 1}轮 · ${board.tasks.length}项悬赏`;
    el.tasks.replaceChildren(...board.tasks.map(taskCard));
    LG.infernalReputationUI.render(el.reputationRewards);
    el.start.textContent = run ? "继续七层地狱" : LG.infernalRealm.stats().clears ? "进入七层地狱" : "开始首征 · 约2–3分钟";
    el.start.dataset.action = run ? "resume" : "start";
    el.empty.hidden = board.tasks.length > 0;
  }
  function floorTrack(run) {
    return run.order.map((id, index) => {
      const layer = LG.INFERNAL_DATA.byId[id];
      const chip = node("span", index === run.floor ? "active"
        : index < run.floor ? "cleared" : "", `${index + 1}·${layer?.name || id}`);
      return chip;
    });
  }
  function renderRun() {
    const run = LG.infernalRealm.run();
    if (!run) {
      setView("hall");
      renderHall();
      return;
    }
    const encounter = run.encounter || {};
    const layer = LG.INFERNAL_DATA.byId[encounter.sin || run.order[run.floor]];
    const boss = encounter.type === "boss", saint = LG.infernalRealm.saintActive(), firstClear = encounter.firstClear === true;
    el.floors.replaceChildren(...floorTrack(run));
    el.portrait.src = LG.CONFIG.assets[boss ? layer.queen : layer.witch];
    el.portrait.alt = boss ? layer.bossTitle : layer.mobTitle; LG.infernalBattlePartyUI?.render?.("infernal");
    el.eventType.textContent = boss
      ? `第${run.floor + 1}层 · 关底女魔王`
      : `第${run.floor + 1}层 · 魔女 ${encounter.index}/${encounter.mobTarget || 6}`;
    el.title.textContent = boss ? layer.bossTitle : layer.mobTitle;
    el.copy.textContent = boss
      ? saint ? `悬赏目标：${encounter.bountyName}。圣徒礼赞拒绝满足欲望，只能消耗${encounter.cost}点人格直接破局。` : `悬赏目标：${encounter.bountyName}。满足“${encounter.desireLabel}”任务会增加败北值；也可消耗${encounter.cost}点人格直接破局。`
      : firstClear ? `首征护航已将本层压缩为两场遭遇。消耗${encounter.cost}点人格，胜利返还10点；保留人格并在Boss处接受欲望考验，可以稳定走完全程。` : `本次挑战消耗${encounter.cost}点人格。成功后返还10点人格；人格不足仍可挑战，但会立即败北撤离。`;
    el.mob.hidden = boss;
    el.gallery.hidden = boss;
    el.gallery.dataset.character = layer.witchCharacter;
    el.gallery.textContent = `查看${layer.name}魔女画廊`;
    el.skip.hidden = boss || !LG.infernalRealm.canSkipMobs();
    el.desire.hidden = !boss;
    el.break.hidden = !boss;
    el.mob.textContent = encounter.cost > LG.infernalRealm.stats().personality
      ? `强行挑战（人格不足）` : `挑战魔女 · ${encounter.cost}人格`;
    el.desire.textContent = boss ? saint ? "圣徒礼赞：拒绝满足欲望" : `接受欲望考验 · 0人格：${encounter.desireLabel}` : "";
    el.break.textContent = boss ? `直接破局 · ${encounter.cost}人格` : "";
    el.mob.disabled = busy; el.skip.disabled = busy; el.desire.disabled = busy || saint;
    el.retreat.disabled = busy;
    el.break.disabled = busy || encounter.cost > LG.infernalRealm.stats().personality;
    el.desireDetail.textContent = boss ? encounter.desireText : "";
    el.desireDetail.hidden = !boss;
  }
  function render(message) {
    renderStats();
    renderHall();
    if (view === "run") renderRun(); if (message !== undefined) el.status.textContent = message;
  }
  async function act(action) {
    if (busy) return;
    const previousEndingId = LG.authority.state()?.endingId || null, run = LG.infernalRealm.run();
    const encounter = run?.encounter;
    const staleMob = ["mob", "skip-mobs"].includes(action)
      && encounter?.type !== "mob";
    const staleBoss = action.startsWith("boss-") && encounter?.type !== "boss";
    if (action !== "start" && action !== "retreat" && (staleMob || staleBoss)) {
      render("当前事件已更新，请按画面显示的选项继续。");
      return;
    }
    busy = true;
    const requestId = ++latest;
    el.controls.forEach((button) => { button.disabled = true; });
    el.status.textContent = "正在进行权威结算...";
    try {
      const result = await LG.authority.mutate("infernalAction", { action });
      if (requestId !== latest) return;
      if (result.life?.endingId && result.life.endingId !== previousEndingId) {
        el.dialog.close(); LG.ui.render(result.life);
      }
      setView(LG.infernalRealm.run() ? "run" : "hall");
      render(result.message || "结算完成。");
      LG.roomsUI.refresh();
    } catch (err) {
      if (requestId !== latest) return;
      console.error("异界联盟魔境结算失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.code === "runtime_unavailable"
        ? "权威服务暂时繁忙，本次未扣除资源，请再次点击当前操作。"
        : err?.message || "结算失败，请稍后重试。";
    } finally {
      busy = false;
      el.controls.forEach((button) => { button.disabled = false; });
      if (view === "run") renderRun();
    }
  }
  function roomCard() {
    const access = LG.infernalRealm.access();
    const stats = LG.infernalRealm.stats();
    const card = node("article",
      `room-card area-room-card infernal-area-card${access.allowed ? " unlocked" : ""}`);
    const image = node("img");
    image.src = LG.CONFIG.assets.infernalRealmGate;
    image.alt = "群魔环绕的地狱大门";
    image.loading = "lazy";
    const body = node("div", "room-card-body");
    body.append(node("span", "event-type", "地狱的入口 · 世界征途RPG"),
    node("h3", "", "异界联盟魔境"),
    node("p", "", access.allowed
      ? `人格 ${stats.personality} · 声望 ${stats.reputation} · 通关 ${stats.clears}`
      : `模拟人生 ${access.simulationCompletions}/${access.required}`));
    const button = node("button", "", access.allowed ? "进入临时阵地" : "尚未满足解锁条件");
    button.type = "button";
    button.disabled = !access.allowed;
    button.addEventListener("click", () => LG.infernalUI.open());
    body.append(button);
    card.append(image, body);
    return card;
  }
  LG.infernalUI = {
    init() {
      [["dialog", "infernalDialog"], ["close", "closeInfernalButton"],
        ["hall", "infernalHall"], ["run", "infernalRun"],
        ["defeat", "infernalDefeat"], ["personality", "infernalPersonality"],
        ["reputation", "infernalReputation"], ["clears", "infernalClears"],
        ["round", "infernalRound"], ["tasks", "infernalTasks"],
        ["reputationRewards", "infernalReputationRewards"], ["empty", "infernalEmpty"],
        ["start", "infernalStartButton"],
        ["floors", "infernalFloors"], ["portrait", "infernalPortrait"],
        ["eventType", "infernalEventType"], ["title", "infernalEventTitle"],
        ["copy", "infernalEventCopy"], ["desireDetail", "infernalDesireDetail"],
      ["mob", "infernalMobButton"], ["skip", "infernalSkipButton"],
        ["desire", "infernalDesireButton"], ["break", "infernalBreakButton"],
        ["gallery", "infernalWitchGalleryButton"],
        ["retreat", "infernalRetreatButton"], ["status", "infernalStatus"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.tabs = [...document.querySelectorAll("[data-infernal-view]")];
      el.actions = [el.start, el.mob, el.skip, el.desire, el.break, el.retreat];
      el.controls = [...el.actions, ...el.tabs];
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        if (busy) return; latest += 1; setView(button.dataset.infernalView); render();
      }));
      el.start.addEventListener("click", () => el.start.dataset.action === "resume"
        ? (setView("run"), render()) : act("start"));
      el.mob.addEventListener("click", () => act("mob"));
      el.skip.addEventListener("click", () => act("skip-mobs"));
      el.desire.addEventListener("click", () => act("boss-desire"));
      el.break.addEventListener("click", () => act("boss-break"));
      el.gallery.addEventListener("click", () =>
        LG.galleryUI.open(el.gallery.dataset.character));
      el.retreat.addEventListener("click", () => act("retreat"));
      el.close.addEventListener("click", close); el.dialog.addEventListener(
        "cancel", (event) => { event.preventDefault(); close(); });
      LG.authority.subscribe(() => { if (el.dialog.open) render(); });
    },
    open() {
      if (!LG.infernalRealm.access().allowed) return;
      LG.audio.scene("infernal"); setView(LG.infernalRealm.run() ? "run" : "hall");
      render("临时阵地已同步最新悬赏。");
      el.dialog.showModal();
    },
    roomCard,
  };
})(window.LifeGame);
