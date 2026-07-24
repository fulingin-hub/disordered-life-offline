(function (LG) {
  const el = {};
  let busy = false;
  const achievementNames = {
    "self-redemption": "自我的救赎",
    puppet: "傀儡",
  };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  async function mutate(method, body = {}) {
    if (busy) return;
    busy = true; render();
    try {
      const result = await LG.authority.mutate(method, body);
      document.getElementById("infernalChurchStatus").textContent = result.message;
      LG.careerUI?.refresh?.(); LG.traitsUI?.refresh?.();
    } catch (err) {
      console.error("魔纹教会任务结算失败:", err?.code, err?.message, err?.stack);
      document.getElementById("infernalChurchStatus").textContent =
        err?.message || "魔纹教会任务暂时无法结算。";
    } finally {
      busy = false; render();
    }
  }
  function taskCard(task, baptized) {
    const card = node("article", `holy-task${task.claimed ? " claimed" : ""}`);
    const ready = task.progress >= task.target;
    card.append(node("strong", "", task.title),
      node("span", "", `${task.progress}/${task.target}`),
      node("small", "", task.rewardText));
    const button = node("button", "", task.claimed ? "已领取"
      : ready ? "领取奖励" : "进行中");
    button.type = "button";
    button.disabled = busy || !baptized || task.claimed || !ready;
    button.addEventListener("click", () =>
      mutate("claimInfernalChurchTask", { taskId: task.id }));
    card.append(button);
    return card;
  }
  function render() {
    if (!el.tasks) return;
    const data = LG.infernalChurch.data();
    const promotion = data.promotion || {};
    el.promotionTitle.textContent = promotion.label || "魔纹职业晋升";
    el.promotionRequirement.textContent = promotion.requirement || "";
    el.promotion.disabled = busy || promotion.canPromote !== true;
    el.promotion.textContent = promotion.canPromote ? promotion.label : "条件未满足";
    el.date.textContent = data.daily?.date || "等待刷新";
    el.tasks.replaceChildren(...(data.daily?.tasks || [])
      .map((task) => taskCard(task, data.baptized)));
    if (!data.daily?.tasks?.length) {
      el.tasks.append(node("p", "system-status", "魔纹日常尚未刷新。"));
    }
    const weekly = data.weekly || {};
    el.weeklyTitle.textContent = weekly.title || "攻打圣光教团";
    el.weeklyDescription.textContent = weekly.description || "";
    el.weeklyReward.textContent = `${
      weekly.rewardText || "败北值平衡+100000"} · 本周通关 ${
      weekly.clears || 0}次 · 首次胜利获得教徒职业勋章`;
    el.weekly.disabled = busy || !data.baptized;
    el.weekly.textContent = weekly.completed
      ? "再次攻打圣光教团" : "前往圣光房间";
    const achievements = (data.achievements || []).map((id) =>
      node("span", "", achievementNames[id] || id));
    el.achievements.replaceChildren(...achievements);
    if (!achievements.length) {
      el.achievements.append(node("p", "", "尚未获得魔纹教会特殊成就。"));
    }
  }
  function init() {
    [["promotion", "infernalPromotionButton"],
      ["promotionTitle", "infernalPromotionTitle"],
      ["promotionRequirement", "infernalPromotionRequirement"],
      ["date", "infernalDailyDate"], ["tasks", "infernalDailyTasks"],
      ["weekly", "infernalWeeklyButton"], ["weeklyTitle", "infernalWeeklyTitle"],
      ["weeklyDescription", "infernalWeeklyDescription"],
      ["weeklyReward", "infernalWeeklyReward"],
      ["achievements", "infernalChurchAchievements"]]
      .forEach(([key, id]) => { el[key] = document.getElementById(id); });
    el.promotion.addEventListener("click", () => mutate("promoteInfernalCareer"));
    el.weekly.addEventListener("click", () => {
      document.getElementById("infernalChurchDialog").close();
      LG.holyLightUI.open();
    });
    LG.authority.subscribe(render);
    render();
  }
  LG.infernalChurchMissionsUI = { init, render };
})(window.LifeGame);
