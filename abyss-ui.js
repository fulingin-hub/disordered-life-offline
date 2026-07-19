(function (LG) {
  const el = {};
  const milestones = [10, 20, 40, 60, 80, 100];
  let view = "hall", busy = false, latest = 0;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function setView(next) {
    view = next === "run" ? "run" : "hall";
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
    const taskMultiplier = LG.infernalClub.taskMultiplier();
    const reputationMultiplier = LG.infernalClub.reputationMultiplier();
    const card = node("article", `infernal-task${task.completed ? " completed" : ""}`);
    const heading = node("div", "infernal-task-heading");
    heading.append(node("strong", "", task.name),
      node("span", "", task.completed ? "已结算" : `${task.progress}/10`));
    const progress = node("progress");
    progress.max = 10;
    progress.value = Math.min(10, Math.max(0, Number(task.progress) || 0));
    card.append(heading, progress,
      node("small", "", `击杀10次 · 奖励${Math.floor(50 * reputationMultiplier)
      }声望 / ${Math.floor(100 * taskMultiplier)}人格值${
        reputationMultiplier !== taskMultiplier
          ? `（声望${reputationMultiplier}倍）`
          : taskMultiplier > 1 ? `（${taskMultiplier}倍）` : ""}`));
    return card;
  }

  function renderHall() {
    const board = LG.infernalRealm.abyssBoard();
    const run = LG.infernalRealm.abyssRun();
    el.round.textContent = `第${board.round + 1}轮 · ${board.tasks.length}项悬赏`;
    el.tasks.replaceChildren(...board.tasks.map(taskCard));
    LG.infernalReputationUI.render(el.reputationRewards);
    el.empty.hidden = board.tasks.length > 0;
    el.start.textContent = run ? "继续无尽深渊" : "进入无尽深渊";
    el.start.dataset.action = run ? "resume" : "start";
  }

  function renderRun() {
    const run = LG.infernalRealm.abyssRun();
    if (!run) {
      setView("hall");
      renderHall();
      return;
    }
    const encounter = run.encounter || {};
    const boss = LG.ABYSS_DATA.byId[encounter.bossId]
      || LG.ABYSS_DATA.bosses[0];
    const stats = LG.infernalRealm.stats();
    const saint = LG.infernalRealm.saintActive();
    const floor = Math.max(1, Number(encounter.floor) || Number(run.floor) + 1);
    el.floorLabel.textContent = `第${floor}层 / 100层`;
    el.clearCount.textContent = `完整通关 ${stats.abyssClears}次`;
    el.floorProgress.value = floor;
    el.milestones.replaceChildren(...milestones.map((target) =>
      node("span", stats.abyssHighest >= target ? "reached" : "", `${target}层`)));
    el.portrait.src = boss.portrait;
    el.portrait.alt = `${boss.name}欲望集成体`;
    el.eventType.textContent = `无尽深渊 · 第${floor}层事件Boss`;
    el.title.textContent = `${boss.name}欲望集成体`;
    el.copy.textContent = saint
      ? `圣徒礼赞拒绝满足欲望，只能消耗${encounter.cost}点人格直接破局，计入对应悬赏击杀。`
      : `完成“${encounter.desireLabel}”会增加败北值并进入下一层；也可消耗${encounter.cost}点人格直接破局，计入对应悬赏击杀。`;
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

  async function act(action) {
    if (busy) return;
    busy = true;
    const requestId = ++latest;
    el.actions.forEach((button) => { button.disabled = true; });
    el.status.textContent = "正在进行权威结算...";
    try {
      const result = await LG.authority.mutate("infernalAction",
        { action: `abyss-${action}` });
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
        ["start", "abyssStartButton"], ["floorLabel", "abyssFloorLabel"],
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
        ? (setView("run"), render()) : act("start"));
      el.desire.addEventListener("click", () => act("desire"));
      el.break.addEventListener("click", () => act("break"));
      el.retreat.addEventListener("click", () => act("retreat"));
      document.getElementById("closeAbyssButton").addEventListener("click", close);
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
      });
      LG.authority.subscribe(() => renderTransfer());
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
