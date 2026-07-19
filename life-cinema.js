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
    [el.past, el.endings, el.achievements, el.narrator]
      .forEach((button) => { button.disabled = next; });
    refreshUnlocks();
  }

  function showSection(name) {
    el.recovery.hidden = name !== "recovery";
    el.achievementPanel.hidden = name !== "achievements";
    el.narratorPanel.hidden = name !== "narrator";
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
        ? `${item.category} · 奖励${item.reward}点 · ${item.target}/${item.target}`
        : `${item.category} · 奖励${item.reward}点 · ${item.progress}/${item.target}`),
    );
    return card;
  }

  function renderAchievements() {
    const items = LG.authority.cinemaAchievements();
    const completed = items.filter((item) => item.unlocked).length;
    const points = LG.authority.achievementPoints();
    el.achievementCount.textContent = items.length
      ? `已完成 ${completed}/${items.length} · 成就点 ${points.balance}`
      : "正在同步成就档案...";
    el.achievementList.replaceChildren(...items.map(achievementCard));
  }

  function showAchievements() {
    if (busy) return;
    showSection("achievements");
    renderAchievements();
    el.status.textContent = "人生成就不区分主角性别，未完成项目会持续显示。";
    el.achievementPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showNarrator() {
    if (busy) return;
    showSection("narrator");
    el.status.textContent = "所选固定旁白会自动朗读普通事件与结局 CG，也可点击重播。";
    el.narratorPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function refreshUnlocks() {
    if (!el.taste || !el.power) return;
    const progress = LG.authority.lifeCinemaProgress();
    const count = Math.max(0, Number(progress.restartCount) || 0);
    const tasteRequired = Math.max(1, Number(progress.tasteRequired) || 800);
    const powerRequired = Math.max(1, Number(progress.powerRequired) || 1000);
    const testEnabled = LG.TEST_MODE?.lifeCinemaCheats === true;
    el.taste.hidden = false;
    el.power.hidden = false;
    el.taste.disabled = busy || (!testEnabled && count < tasteRequired);
    el.power.disabled = busy || (!testEnabled && count < powerRequired);
    el.tasteText.textContent = testEnabled
      ? "离线版已解锁：一键开放全部事件结局（包括真结局与隐藏结局）"
      : count >= tasteRequired
        ? "已解锁：永久开放常规人生结局与全部真结局"
      : `人生重开 ${count}/${tasteRequired} 次后解锁`;
    el.powerText.textContent = testEnabled
      ? "离线版已解锁：一键开放所有成就、属性、道具、载具与场景区域"
      : count >= powerRequired
        ? "已解锁：开放全部道具、房间画廊、特殊入口并完成所有成就"
      : `人生重开 ${count}/${powerRequired} 次后解锁`;
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
    el.narratorPanel = document.getElementById("cinemaNarratorPanel");
    el.achievementCount = document.getElementById("lifeAchievementCount");
    el.achievementList = document.getElementById("lifeAchievementList");
    el.status = document.getElementById("cinemaStatus");
    el.past = document.getElementById("pastLifeButton");
    el.endings = document.getElementById("cinemaEndingsButton");
    el.achievements = document.getElementById("lifeAchievementsButton");
    el.narrator = document.getElementById("cinemaNarratorButton");
    el.taste = document.getElementById("tasteLifeButton");
    el.power = document.getElementById("powerLifeButton");
    el.tasteText = el.taste.querySelector("span");
    el.powerText = el.power.querySelector("span");
    el.past.addEventListener("click", showRecovery);
    el.endings.addEventListener("click", showEndings);
    el.achievements.addEventListener("click", showAchievements);
    el.narrator.addEventListener("click", showNarrator);
    el.taste.addEventListener("click", () => unlock(
      "unlockAllEndings",
      LG.TEST_MODE?.lifeCinemaCheats === true
        ? "确定一键解锁全部事件结局，包括真结局与隐藏结局？"
        : "确定永久解锁常规人生结局与全部真结局？其余特殊结局仍需完成对应成就。",
    ));
    el.power.addEventListener("click", () => unlock(
      "unlockAllCollections",
      LG.TEST_MODE?.lifeCinemaCheats === true
        ? "确定一键解锁所有成就、属性、道具、载具与场景区域？"
        : "确定永久解锁全部道具、角色房间、画廊CG与特殊入口，并完成所有人生成就？",
    ));
    refreshUnlocks();
    LG.authority.subscribe(() => {
      refreshUnlocks();
      if (!el.achievementPanel.hidden) renderAchievements();
    });
    el.dialog.addEventListener("close", reset);
  }

  init();
})(window.LifeGame);
