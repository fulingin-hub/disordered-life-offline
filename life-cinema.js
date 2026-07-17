(function (LG) {
  let busy = false;
  const el = {};

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function setBusy(next) {
    busy = next;
    [el.past, el.endings, el.achievements, el.taste, el.power]
      .forEach((button) => { button.disabled = next; });
  }

  function showSection(name) {
    el.recovery.hidden = name !== "recovery";
    el.achievementPanel.hidden = name !== "achievements";
  }

  function showRecovery() {
    if (busy) return;
    showSection("recovery");
    el.status.textContent = "前世今生已展开，可选择前世恢复旧存档，或放弃今生重新开始。";
    el.recovery.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showEndings() {
    if (busy) return;
    const state = LG.authority.state();
    if (!state || !LG.ui?.showArchive) {
      el.status.textContent = "人生结局正在同步，请稍后再试。";
      return;
    }
    el.dialog.close();
    LG.ui.showArchive(LG.authority.archive(), state.gender || "male");
  }

  function achievementCard(item) {
    const card = node("article",
      `life-achievement${item.unlocked ? " unlocked" : " locked"}`);
    const heading = node("div", "life-achievement-heading");
    heading.append(
      node("strong", "", item.title),
      node("span", "", item.unlocked ? "已完成" : "未完成"),
    );
    const progress = node("progress");
    progress.max = Math.max(1, Number(item.target) || 1);
    progress.value = Math.min(progress.max, Math.max(0, Number(item.progress) || 0));
    card.append(
      heading,
      node("p", "", item.description),
      progress,
      node("small", "", item.unlocked
        ? `${item.target}/${item.target}`
        : `${item.progress}/${item.target}`),
    );
    return card;
  }

  function renderAchievements() {
    const items = LG.authority.cinemaAchievements();
    const completed = items.filter((item) => item.unlocked).length;
    el.achievementCount.textContent = items.length
      ? `已完成 ${completed}/${items.length}` : "正在同步成就档案...";
    el.achievementList.replaceChildren(...items.map(achievementCard));
  }

  function showAchievements() {
    if (busy) return;
    showSection("achievements");
    renderAchievements();
    el.status.textContent = "人生成就不区分主角性别，未完成项目会持续显示。";
    el.achievementPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function unlock(method, prompt) {
    if (busy || !window.confirm(prompt)) return;
    setBusy(true);
    el.status.textContent = "正在写入权威人生档案...";
    try {
      const result = await LG.authority.mutate(method);
      el.status.textContent = result.message || "人生档案已更新。";
      if (!el.achievementPanel.hidden) renderAchievements();
      window.dzmm?.toast?.success?.(el.status.textContent);
    } catch (err) {
      console.error("人生电影院操作失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "操作失败，请稍后重试。";
      window.dzmm?.toast?.error?.(el.status.textContent);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    showSection("");
    el.status.textContent = "选择一段人生回想。";
  }

  function init() {
    el.dialog = document.getElementById("recoveryDialog");
    el.recovery = document.getElementById("recoveryPanel");
    el.achievementPanel = document.getElementById("lifeAchievementPanel");
    el.achievementCount = document.getElementById("lifeAchievementCount");
    el.achievementList = document.getElementById("lifeAchievementList");
    el.status = document.getElementById("cinemaStatus");
    el.past = document.getElementById("pastLifeButton");
    el.endings = document.getElementById("cinemaEndingsButton");
    el.achievements = document.getElementById("lifeAchievementsButton");
    el.taste = document.getElementById("tasteLifeButton");
    el.power = document.getElementById("powerLifeButton");
    el.past.addEventListener("click", showRecovery);
    el.endings.addEventListener("click", showEndings);
    el.achievements.addEventListener("click", showAchievements);
    el.taste.addEventListener("click", () => unlock(
      "unlockAllEndings",
      "确定永久解锁常规人生结局？真结局只能在人生流程中触发，其余特殊结局需完成对应成就。",
    ));
    el.power.addEventListener("click", () => unlock(
      "unlockAllCollections",
      "确定永久解锁全部道具、角色房间、画廊CG，并将两国黑市实际下跪记录提升至50次？",
    ));
    LG.authority.subscribe(() => {
      if (!el.achievementPanel.hidden) renderAchievements();
    });
    el.dialog.addEventListener("close", reset);
  }

  init();
})(window.LifeGame);
