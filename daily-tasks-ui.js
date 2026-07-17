(function (LG) {
  const el = {};
  let claiming = false;

  function taskCard(task) {
    const card = document.createElement("article");
    card.className = `daily-task${task.claimed ? " claimed" : ""}`;
    const heading = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = task.title;
    const reward = document.createElement("span");
    reward.textContent = `奖励 ${task.reward} 点`;
    heading.append(title, reward);
    const content = document.createElement("p");
    content.textContent = task.content;
    const progress = document.createElement("div");
    progress.className = "task-progress";
    const fill = document.createElement("span");
    fill.style.width = `${task.progress / task.target * 100}%`;
    progress.append(fill);
    const footer = document.createElement("div");
    const count = document.createElement("span");
    count.textContent = `${task.progress}/${task.target}`;
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = claiming || task.claimed || task.progress < task.target;
    button.textContent = task.claimed ? "已领取" : task.progress >= task.target ? "领取奖励" : "进行中";
    button.addEventListener("click", () => claim(task.id));
    footer.append(count, button);
    card.append(heading, content, progress, footer);
    return card;
  }

  function render() {
    el.list.replaceChildren(...LG.dailyTasks.all().map(taskCard));
  }

  async function claim(taskId) {
    if (claiming) return;
    claiming = true;
    try {
      const result = await LG.authority.mutate("claimDaily", { taskId });
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      window.dzmm?.toast?.success?.("每日任务奖励已领取");
    } catch (err) {
      console.error("任务奖励保存失败:", err.code, err.message, err.stack);
      el.status.textContent = "奖励保存失败，请稍后重试。";
    } finally {
      claiming = false;
      render();
    }
  }

  LG.dailyTasksUI = {
    init() {
      el.button = document.getElementById("tasksButton");
      el.dialog = document.getElementById("tasksDialog");
      el.list = document.getElementById("dailyTaskList");
      el.status = document.getElementById("dailyTaskStatus");
      el.button.addEventListener("click", () => this.open());
      document.getElementById("closeTasksButton").addEventListener("click", () => el.dialog.close());
      this.refresh();
    },
    open() {
      el.status.textContent = "任务每日刷新；人生选择会自动累计当前任务进度。";
      render();
      el.dialog.showModal();
    },
    refresh() {
      if (!el.button) return;
      const ready = LG.dailyTasks.all().filter((task) =>
        !task.claimed && task.progress >= task.target).length;
      el.button.textContent = ready ? `任务·${ready}` : "任务";
      if (el.dialog?.open) render();
    },
  };
})(window.LifeGame);
