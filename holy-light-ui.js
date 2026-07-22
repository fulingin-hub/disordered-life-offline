(function (LG) {
  let dialog, status, content, busy = false;
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function button(label, action, disabled) {
    const el = node("button", "", label);
    el.type = "button"; el.disabled = busy || disabled;
    el.addEventListener("click", action);
    return el;
  }
  async function mutate(method, body, onSuccess) {
    if (busy) return;
    let completed = null;
    busy = true; render();
    try {
      const result = await LG.authority.mutate(method, body);
      status.textContent = result.message;
      LG.careerUI?.refresh?.(); LG.traitsUI?.refresh?.();
      completed = result;
    } catch (err) {
      console.error("圣光教团结算失败:", err?.code, err?.message, err?.stack);
      status.textContent = err?.message || "圣光教团暂时无法回应。";
    } finally {
      busy = false; render();
    }
    if (completed && onSuccess) onSuccess(completed);
  }
  function membership(data) {
    const section = node("section", "holy-panel");
    section.append(node("h3", "", data.baptized ? "圣者的祝福" : "加入与洗礼"),
      node("p", "", data.baptized
        ? "自我意志不灭：本局坏结局锁定，殉道时可选择普通结局。"
        : "无条件加入；接受洗礼前可以自由退出。"));
    const actions = node("div", "holy-actions");
    if (!data.joined) actions.append(button("加入圣光教团",
      () => mutate("joinHolyLight"), !data.canJoin));
    else if (!data.baptized) actions.append(
      button("接受圣光洗礼", () => mutate("receiveHolyBaptism")),
      button("退出教团", () => mutate("leaveHolyLight")));
    else actions.append(node("strong", "holy-blessing", "圣者的祝福正在守护你"));
    section.append(actions);
    if (data.holyLockRemaining) section.append(node("small", "",
      `圣光教团锁定剩余 ${data.holyLockRemaining} 次重生`));
    return section;
  }
  function purification() {
    const snapshot = LG.authority.snapshot();
    const points = LG.traits.points();
    const defeat = Number(snapshot?.economy?.infernalRealm?.defeat) || 0;
    const shame = Number(snapshot?.life?.stats?.shame) || 0;
    const canPay = points >= 10_000;
    const section = node("section", "holy-panel");
    section.append(node("h3", "", "圣光的祝福"),
      node("p", "", "迷途知返从来都不用觉得羞耻，孩子不要害怕，人生还长着呢。"),
      node("small", "", "无势力限制：每消耗10000属性点，可净化1000败北值或羞耻值。"),
      node("div", "purification-balance",
        `属性点 ${points.toLocaleString("zh-CN")} · 败北值 ${defeat.toLocaleString("zh-CN")} · 羞耻值 ${shame.toLocaleString("zh-CN")}`));
    const actions = node("div", "holy-actions");
    actions.append(button("净化1000败北值",
      () => mutate("purifyHolyLight", { kind: "defeat", batches: 1 },
        (result) => LG.holyLightPurificationCinema.open({
          kind: "defeat", message: result.message,
        })), !canPay || defeat < 1000),
    button("净化1000羞耻值",
      () => mutate("purifyHolyLight", { kind: "shame", batches: 1 },
        (result) => LG.holyLightPurificationCinema.open({
          kind: "shame", message: result.message,
        })), !canPay || shame < 1000));
    section.append(actions);
    return section;
  }
  function taskCard(task, baptized, direct) {
    const card = node("article", `holy-task${task.claimed ? " claimed" : ""}`);
    const ready = direct || task.progress >= task.target;
    card.append(node("strong", "", task.title),
      node("span", "", `${task.progress}/${task.target}`),
      node("small", "", task.rewardText));
    card.append(button(task.claimed ? "已领取" : direct ? "直接完成"
      : ready ? "领取奖励" : "进行中",
    () => mutate("claimHolyTask", { taskId: task.id }),
    !baptized || task.claimed || !ready));
    return card;
  }
  function tasks(data) {
    const section = node("section", "holy-panel holy-task-panel");
    const direct = data.achievements?.includes("saint-endures");
    section.append(node("h3", "", "圣光日常 · 每日20项"),
      node("p", "", direct
        ? "“圣者永存”生效：所有圣光教团任务可以直接完成。"
        : "由圣徒发布；援助魔境、搜查魔纹使徒与备战物资每日刷新。"));
    const grid = node("div", "holy-task-grid");
    grid.append(...(data.daily?.tasks || []).map((task) =>
      taskCard(task, data.baptized, direct)));
    section.append(grid);
    return section;
  }
  function weekly(data) {
    const task = data.weekly || {};
    const direct = data.achievements?.includes("saint-endures");
    const section = node("section", "holy-panel");
    section.append(node("h3", "", task.title || "攻打魔纹教会"),
      node("p", "", task.description || "击败一次魔纹教会的女主教。"),
      node("small", "", `${task.rewardText || "人格值+100000"} · 本周通关 ${
        task.clears || 0}次 · 首次胜利获得圣职者职业勋章`));
    const actions = node("div", "holy-actions");
    actions.append(button(task.completed ? "再次攻打魔纹教会"
      : direct ? "直接完成周常" : "前往女主教对话",
    () => {
      if (direct && !task.completed) mutate("completeHolyWeekly");
      else {
        dialog.close();
        LG.priestessTrialUI?.open?.();
      }
    }, !data.baptized));
    section.append(actions);
    return section;
  }
  function saintDialogue() {
    const church = LG.infernalChurch.data();
    const section = node("section", "holy-panel saint-dialogue-panel");
    section.append(node("h3", "", "圣徒对话 · 魔纹教会周常"),
      node("p", "", "圣徒坐在祭祀台前，浑身散发着浓郁的圣光。魔纹教会职业者可从这里发起精神世界挑战。"));
    const action = button(church.weekly?.completed
      ? "再次攻打圣光教团" : "与圣徒对话",
      () => LG.saintTrialUI.open(),
      !church.baptized);
    section.append(node("small", "", church.baptized
      ? "女司祭命令：你可以不用活，但目标一定得死。"
      : "完成魔纹教会入教洗礼后开放。"), action);
    return section;
  }
  function achievements(data) {
    const section = node("section", "holy-panel");
    section.append(node("h3", "", "特殊成就"));
    const list = node("div", "holy-achievements");
    (data.achievements || []).forEach((id) =>
      list.append(node("span", "", LG.holyLight.achievementNames[id] || id)));
    if (!list.childElementCount) list.append(node("p", "", "尚未获得特殊成就。"));
    if (data.judgeSetOwned) list.append(node("span", "", "圣光审判官五件套"));
    section.append(list);
    return section;
  }
  function render() {
    if (!content) return;
    const data = LG.holyLight.data();
    content.replaceChildren(membership(data), purification(), saintDialogue(),
      weekly(data), tasks(data), achievements(data));
  }
  function build() {
    dialog = node("dialog", "holy-light-dialog");
    dialog.innerHTML = `<header><div><span class="event-type">圣光教团 · 圣徒据点</span>
      <h2>圣光追随者的教团</h2></div><button type="button">关闭</button></header>
      <div class="holy-hero"><img alt="圣光使者"><div><strong>圣徒</strong>
      <p>一个由圣徒建立、由圣光追随者组成、人数不多的教团。</p></div></div>
      <p class="system-status" role="status"></p><main></main>`;
    dialog.querySelector("header button").addEventListener("click", () => dialog.close());
    dialog.querySelector(".holy-hero img").src =
      LG.CONFIG.assets.protagonistFemaleSaintSet;
    status = dialog.querySelector(".system-status");
    content = dialog.querySelector("main");
    document.body.append(dialog);
  }
  function open() {
    if (!dialog) build();
    render(); if (!dialog.open) dialog.showModal();
  }
  function roomCard(areaId) {
    const card = node("article", "room-card area-room-card holy-room-card unlocked");
    const image = node("img"); image.src = LG.CONFIG.assets.worldSanctuaryCampus;
    image.alt = "圣光教团据点"; image.loading = "lazy";
    const body = node("div", "room-card-body");
    body.append(node("span", "event-type", "无势力限制"),
      node("h3", "", "圣光教团据点"),
      node("p", "", `圣徒在${areaId === "blackStreet" ? "异域魔境" : "本区域"}设立的祝福与净化房间。`),
      button("请求圣光的祝福", open));
    card.append(image, body); return card;
  }
  LG.holyLightUI = { open, roomCard, render };
})(window.LifeGame);
