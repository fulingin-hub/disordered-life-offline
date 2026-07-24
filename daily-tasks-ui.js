(function (LG) {
  const el = {};
  let busy = false;
  let view = "career";

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  async function mutate(method, body) {
    if (busy) return;
    busy = true;
    try {
      const result = await LG.authority.mutate(method, body);
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.careerUI.refresh();
      render();
    } catch (err) {
      console.error("任务结算失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "任务结算失败，请稍后重试。";
    } finally {
      busy = false;
    }
  }

  function progress(task) {
    const track = node("div", "task-progress");
    const fill = node("span");
    fill.style.width = `${Math.min(100, task.progress / task.target * 100)}%`;
    track.append(fill);
    return track;
  }

  function despairCard(task) {
    const card = node("article", `daily-task${task.claimed ? " claimed" : ""}`);
    const heading = node("div");
    heading.append(node("strong", "", task.title),
      node("span", "", task.rewardText || "奖励由权威服务结算"));
    const footer = node("div");
    const button = node("button", "", task.claimed ? "已领取"
      : task.progress >= task.target ? "领取奖励" : "进行中");
    button.type = "button";
    button.disabled = busy || task.claimed || task.progress < task.target;
    button.addEventListener("click", () => mutate("claimDaily", { taskId: task.id }));
    footer.append(node("span", "", `${task.progress}/${task.target}`), button);
    card.append(heading, node("p", "", task.content), progress(task), footer);
    return card;
  }

  function careerCard(task) {
    const card = node("article", `daily-task${task.claimed ? " claimed" : ""}`);
    const heading = node("div");
    heading.append(node("strong", "", task.title),
      node("span", "", task.rewardText || "奖励由权威服务结算"));
    const footer = node("div");
    const action = node("button", "", task.progress >= task.target ? "已完成"
      : task.type === "boss" ? "挑战首领" : "执行任务");
    action.type = "button";
    action.disabled = busy || task.claimed || task.progress >= task.target;
    action.addEventListener("click", () =>
      mutate("careerTaskAdvance", { taskId: task.id }));
    const claim = node("button", "", task.claimed ? "已领取" : "领取");
    claim.type = "button";
    claim.disabled = busy || task.claimed || task.progress < task.target;
    claim.addEventListener("click", () =>
      mutate("claimCareerTask", { taskId: task.id }));
    footer.append(node("span", "", `${task.progress}/${task.target}`), action, claim);
    card.append(heading, node("p", "", task.content), progress(task), footer);
    return card;
  }

  function render() {
    const career = LG.career.data();
    if (LG.contentMode?.strictTeen?.() && view === "despair") view = "career";
    if (view === "career") {
      const tasks = career.daily?.tasks || [];
      el.status.textContent = career.equippedProfession
        ? "任务奖励由所属职业势力发放；每日自动刷新。"
        : "装备一个已解锁职业后开放职业任务。";
      el.list.replaceChildren(...tasks.map(careerCard));
      if (!tasks.length) el.list.append(node("p", "system-status", "暂无职业任务。"));
    } else {
      const unlocked = LG.traits.value("despair") >= 50;
      el.status.textContent = unlocked
        ? "日常丧志每日刷新；只有已集齐全部道具图鉴的角色会进入任务库。"
        : `丧志属性达到50后解锁（当前${LG.traits.value("despair")}）。`;
      el.list.replaceChildren(...(unlocked ? LG.dailyTasks.all().map(despairCard) : []));
    }
    el.tabs.find((button) => button.dataset.taskView === "despair")
      ?.toggleAttribute("hidden", LG.contentMode?.strictTeen?.());
    el.tabs.forEach((button) => button.setAttribute("aria-selected",
      String(button.dataset.taskView === view)));
  }

  LG.dailyTasksUI = {
    init() {
      el.button = document.getElementById("tasksButton");
      el.dialog = document.getElementById("tasksDialog");
      el.list = document.getElementById("dailyTaskList");
      el.status = document.getElementById("dailyTaskStatus");
      el.tabs = [...document.querySelectorAll("[data-task-view]")];
      el.button.addEventListener("click", () => this.open());
      document.getElementById("closeTasksButton")
        .addEventListener("click", () => el.dialog.close());
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        view = button.dataset.taskView;
        render();
      }));
      this.refresh();
    },
    open() {
      if (LG.contentMode?.strictTeen?.()) view = "career";
      render();
      el.dialog.showModal();
    },
    refresh() {
      if (!el.button) return;
      const despairReady = !LG.contentMode?.strictTeen?.()
        && LG.traits.value("despair") >= 50
        ? LG.dailyTasks.all().filter((task) =>
          !task.claimed && task.progress >= task.target).length : 0;
      const ready = despairReady + LG.career.taskReadyCount();
      el.button.textContent = ready ? `任务·${ready}` : "任务";
      if (el.dialog?.open) render();
    },
  };
})(window.LifeGame);
