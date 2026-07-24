(function (LG) {
  const el = {};
  const milestones = [10, 25, 50, 75, 100];
  let view = "hall", busy = false, latest = 0;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function setView(next) {
    view = next === "run" ? "run" : "hall";
    el.dialog.dataset.view = view;
    el.hall.hidden = view !== "hall";
    el.run.hidden = view !== "run";
    el.tabs.forEach((button) => button.classList.toggle("active",
      button.dataset.abyssView === view));
  }
  function renderTransfer() {
    const access = LG.infernalRealm.abyssAccess();
    el.transfer.disabled = !access.allowed;
    el.transfer.textContent = access.allowed
      ? "前往深渊防线 · 无尽深渊已解锁"
      : `深渊防线未解锁 · 七层通关 ${access.clears}/${access.required}`;
  }
  function renderStats() {
    const stats = LG.infernalRealm.stats();
    el.defeat.textContent = String(stats.defeat);
    el.personality.textContent = String(stats.personality);
    el.reputation.textContent = String(stats.reputation);
    el.highest.textContent = String(stats.abyssHighest);
  }
  function taskCard(task) {
    const card = node("article", `infernal-task${task.completed ? " completed" : ""}`);
    const heading = node("div", "infernal-task-heading");
    const target = Math.max(10, Number(task.target) || 10);
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
    const board = LG.infernalRealm.abyssBoard();
    const run = LG.infernalRealm.abyssRun();
    el.round.textContent = `第${board.round + 1}轮 · ${board.tasks.length}项悬赏`;
    el.tasks.replaceChildren(...board.tasks.map(taskCard));
    LG.infernalReputationUI.render(el.reputationRewards);
    el.empty.hidden = board.tasks.length > 0;
    LG.abyssPartyUI.render(run, busy);
  }
  function renderRun() {
    const run = LG.infernalRealm.abyssRun();
    if (!run) {
      setView("hall");
      renderHall();
      return;
    }
    const encounter = run.encounter || {};
    LG.abyssBlessingUI.render(run, busy,
      (blessingId) => act("bless", { blessingId }));
    const choosingBlessing = run.blessingOptions?.length > 0;
    document.querySelector(".abyss-encounter").hidden = choosingBlessing;
    if (choosingBlessing) {
      el.eventType.textContent = `无尽深渊 · 第${run.floor}层祝福`;
      el.title.textContent = "选择深渊祝福";
      el.copy.textContent = "祝福只在本次探索中生效，选择后继续下一层。";
      el.desireDetail.textContent = "";
      return;
    }
    const witch = encounter.type === "abyss-witch";
    const layer = witch ? LG.INFERNAL_DATA.byId[encounter.witchSin] : null;
    const boss = LG.ABYSS_DATA.byId[encounter.bossId]
      || { name: encounter.bossName || "无名角色", portrait: "" };
    const stats = LG.infernalRealm.stats();
    const saint = LG.infernalRealm.saintActive();
    const floor = Math.max(1, Number(encounter.floor) || Number(run.floor) + 1);
    el.floorLabel.textContent = LG.abyssPartyUI.floorLabel(run, floor);
    el.clearCount.textContent = `团队远征完成 ${stats.abyssClears}次`;
    el.floorProgress.value = floor % 100 || 100;
    el.milestones.replaceChildren(...milestones.map((target) =>
      node("span", stats.abyssHighest >= target ? "reached" : "", `${target}层`)));
    el.run.dataset.encounter = witch ? "witch" : "desire";
    const portrait = witch && layer ? LG.CONFIG.assets[layer.witch] : boss.portrait;
    if (portrait) el.portrait.src = portrait;
    else el.portrait.removeAttribute("src");
    el.portrait.alt = witch ? "深渊魔女" : `${boss.name}欲望集合体`;
    LG.infernalBattlePartyUI?.render?.("abyss");
    el.eventType.textContent = witch
      ? `无尽深渊 · 第${floor}层额外Boss` : `无尽深渊 · 第${floor}层事件Boss`;
    el.title.textContent = witch ? "深渊魔女" : `${boss.name}欲望集合体`;
    const copy = saint
      ? `圣徒礼赞拒绝满足欲望，只能消耗${encounter.cost}点人格直接破局。`
      : `完成“${encounter.desireLabel}”会增加败北值；也可消耗${encounter.cost}点人格直接破局。${
        witch ? "战胜她后才算真正突破本层。" : "每逢十层还会出现额外Boss。"}`;
    el.copy.textContent = copy + LG.abyssPartyUI.encounterSupport(encounter);
    el.desireDetail.textContent = encounter.desireText || "";
    el.desire.textContent = saint ? "圣徒礼赞：拒绝满足欲望"
      : `完成随机任务：${encounter.desireLabel || "满足欲望"}`;
    el.break.textContent = `直接破局 · ${encounter.cost || 0}人格`;
    el.desire.disabled = busy || saint;
    el.break.disabled = busy || encounter.cost > stats.personality;
  }
  function render(message) {
    renderTransfer();
    renderStats();
    renderHall();
    if (view === "run") renderRun();
    if (message !== undefined) el.status.textContent = message;
  }
  async function act(action, args = {}) {
    if (busy) return;
    busy = true;
    const requestId = ++latest;
    el.actions.forEach((button) => { button.disabled = true; });
    el.status.textContent = "正在进行权威结算...";
    try {
      const result = await LG.authority.mutate("infernalAction",
        { action: `abyss-${action}`, ...args });
      if (requestId !== latest) return;
      setView(LG.infernalRealm.abyssRun() ? "run" : "hall");
      render(result.message || "结算完成。");
      LG.roomsUI.refresh();
    } catch (err) {
      if (requestId !== latest) return;
      console.error("无尽深渊结算失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "结算失败，请稍后重试。";
    } finally {
      busy = false;
      el.actions.forEach((button) => { button.disabled = false; });
      if (view === "run") renderRun();
    }
  }
  function close() {
    latest += 1;
    el.dialog.close();
    LG.audio.scene("world");
  }
  LG.abyssUI = {
    init() {
      [["dialog", "abyssDialog"], ["transfer", "openAbyssButton"],
        ["hall", "abyssHall"], ["run", "abyssRun"], ["defeat", "abyssDefeat"],
        ["personality", "abyssPersonality"], ["reputation", "abyssReputation"],
        ["highest", "abyssHighest"], ["round", "abyssRound"],
        ["reputationRewards", "abyssReputationRewards"],
        ["tasks", "abyssTasks"], ["empty", "abyssEmpty"],
        ["start", "abyssStartButton"], ["return", "abyssReturnButton"],
        ["floorLabel", "abyssFloorLabel"],
        ["clearCount", "abyssClearCount"], ["floorProgress", "abyssFloorProgress"],
        ["milestones", "abyssMilestones"], ["portrait", "abyssPortrait"],
        ["eventType", "abyssEventType"], ["title", "abyssEventTitle"],
        ["copy", "abyssEventCopy"], ["desireDetail", "abyssDesireDetail"],
        ["desire", "abyssDesireButton"], ["break", "abyssBreakButton"],
        ["retreat", "abyssRetreatButton"], ["status", "abyssStatus"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.tabs = [...document.querySelectorAll("[data-abyss-view]")];
      el.actions = [el.start, el.desire, el.break, el.retreat];
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        setView(button.dataset.abyssView);
        render();
      }));
      el.transfer.addEventListener("click", () => this.open());
      el.start.addEventListener("click", () => el.start.dataset.action === "resume"
        ? (setView("run"), render())
        : act("start", LG.abyssPartyUI.startPayload()));
      el.return.addEventListener("click", () => {
        latest += 1;
        el.dialog.close();
        LG.infernalUI.open();
      });
      el.desire.addEventListener("click", () => act("desire"));
      el.break.addEventListener("click", () => act("break"));
      el.retreat.addEventListener("click", () => act("retreat"));
      document.getElementById("closeAbyssButton").addEventListener("click", close);
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
      });
      LG.authority.subscribe(() => renderTransfer());
      LG.abyssBlessingUI.init();
      LG.abyssPartyUI.init();
      renderTransfer();
    },
    open() {
      if (!LG.infernalRealm.abyssAccess().allowed) return;
      document.getElementById("infernalDialog").close();
      LG.audio.scene("infernal");
      setView(LG.infernalRealm.abyssRun() ? "run" : "hall");
      render("深渊防线已同步最新悬赏。");
      el.dialog.showModal();
    },
  };
})(window.LifeGame);
