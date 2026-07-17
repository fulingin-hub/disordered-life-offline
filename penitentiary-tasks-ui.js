(function (LG) {
  const el = {};
  let activeStage = 1, busy = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function taskCard(task) {
    const card = node("article", `penitentiary-task ${task.status}`);
    const heading = node("div", "penitentiary-task-heading");
    heading.append(node("strong", "", task.name),
      node("span", "", `${task.reward}赎罪卷`));
    const state = task.status === "completed" ? "已完成"
      : task.status === "claimed" ? "任务进行中" : task.special ? "特殊任务" : "常规任务";
    card.append(heading, node("p", "", state));
    const button = node("button");
    button.type = "button";
    button.disabled = busy || task.status === "completed";
    button.textContent = task.status === "open" ? "领取任务"
      : task.status === "claimed" ? "提交完成" : "已结算";
    button.addEventListener("click", () => mutate(task));
    card.append(button);
    return card;
  }
  function render(stage) {
    activeStage = stage;
    const role = LG.PENITENTIARY_DATA.roles[stage - 1];
    const board = LG.penitentiary.board(stage);
    el.role.textContent = `${role.role} · ${role.name}`;
    el.round.textContent = `第 ${board.round + 1} 轮 · ${board.tasks.length}/5`;
    if (!board.tasks.length) {
      el.list.replaceChildren(node("p", "penitentiary-empty", "每日劳作正在由影狱账本生成。"));
      return;
    }
    el.list.replaceChildren(...board.tasks.map(taskCard));
  }
  async function mutate(task) {
    if (busy) return;
    busy = true;
    LG.penitentiaryUI.status("正在提交影狱任务记录...");
    try {
      const result = await LG.authority.mutate("penitentiaryTask", {
        stage: activeStage, taskId: task.id,
        action: task.status === "open" ? "claim" : "complete",
      });
      LG.penitentiaryUI.refresh(result.message);
      LG.penitentiaryControlUI.open();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("影狱任务结算失败:", err?.code, err?.message, err?.stack);
      LG.penitentiaryUI.status(err?.message || "任务结算失败，请稍后重试。");
    } finally {
      busy = false;
      render(activeStage);
    }
  }
  LG.penitentiaryTasksUI = {
    init() {
      el.role = document.getElementById("penitentiaryTaskRole");
      el.round = document.getElementById("penitentiaryRound");
      el.list = document.getElementById("penitentiaryTaskList");
    },
    render,
  };
})(window.LifeGame);
