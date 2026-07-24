(function (LG) {
  let panel, busy = false, pendingType = null;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  async function upgrade(type, levels) {
    if (busy) return;
    busy = true;
    pendingType = type;
    render();
    try {
      const result = await LG.authority.mutate("upgradeChurchPower", {
        type, levels,
      });
      document.getElementById("infernalChurchStatus").textContent =
        result.message;
      LG.careerUI?.refresh?.();
      LG.traitsUI?.refresh?.();
    } catch (err) {
      console.error("教团能力升级失败:", err?.code, err?.message, err?.stack);
      document.getElementById("infernalChurchStatus").textContent =
        err?.message || "升级失败，请稍后重试。";
    } finally {
      busy = false;
      pendingType = null;
      render();
    }
  }

  function format(value) {
    return Number(value).toLocaleString("zh-CN");
  }

  function progress(data, title) {
    const wrap = node("div", "church-upgrade-progress");
    const copy = node("span", "", `本级进度 ${format(
      data.levelExperience)} / ${format(data.levelExperienceTarget)}`);
    const meter = node("progress");
    meter.max = Math.max(1, Number(data.levelExperienceTarget) || 0);
    meter.value = Math.min(meter.max,
      Math.max(0, Number(data.levelExperience) || 0));
    meter.setAttribute("aria-label", `${title}本级进度`);
    wrap.append(copy, meter);
    return wrap;
  }

  function rewardCopy(amount) {
    return amount > 0
      ? `首次等级奖励每项+${format(amount)}`
      : "恢复旧等级，不重复发放属性";
  }

  function card(title, type, data) {
    const item = node("article", "holy-task church-upgrade-card");
    const maxed = data.level >= data.maxLevel;
    const shortfall = Math.max(0, data.nextCost - data.balance);
    item.append(
      node("strong", "", `${title} · ${data.level}/${data.maxLevel}级`),
      node("span", "", `${data.currency}余额 ${format(data.balance)}`),
      progress(data, title),
      node("small", "", data.benefit),
      node("small", "", maxed
        ? "已达到最高等级"
        : `下一级消耗 ${format(data.nextCost)} ${
          data.currency}，${shortfall
          ? `还差 ${format(shortfall)} ${data.currency}`
          : rewardCopy(data.nextReward)}`),
    );
    const actions = node("div", "holy-actions");
    const upgrading = busy && pendingType === type;
    const one = node("button", "", maxed
      ? "已满级" : upgrading ? "升级中…" : "提升1级");
    one.type = "button";
    one.disabled = busy || maxed || data.balance < data.nextCost;
    one.title = maxed ? "" : `${rewardCopy(data.nextReward)}；消耗${
      format(data.nextCost)}${data.currency}`;
    one.addEventListener("click", () => upgrade(type, 1));
    const ten = node("button", "", maxed
      ? "已满级" : upgrading ? "升级中…" : `提升${data.tenLevelCount}级`);
    ten.type = "button";
    ten.disabled = busy || maxed || data.balance < data.tenLevelCost;
    ten.title = maxed ? "" : `${rewardCopy(data.tenLevelReward)}；消耗${
      format(data.tenLevelCost)}${data.currency}`;
    ten.addEventListener("click", () => upgrade(type, 10));
    actions.append(one);
    if (data.tenLevelCount > 1) actions.append(ten);
    item.append(actions);
    return item;
  }

  function render() {
    if (!panel) return;
    const upgrades = LG.infernalChurch.data().upgrades;
    if (!upgrades?.book || !upgrades?.soul) {
      panel.replaceChildren(node("p", "system-status", "升级数据正在同步。"));
      return;
    }
    const heading = node("div", "infernal-mission-heading");
    const copy = node("div");
    copy.append(node("span", "event-type", "人格与败北 · 动态平衡"),
      node("h3", "", "教团能力升级"));
    heading.append(copy);
    const grid = node("div", "holy-task-grid");
    grid.append(
      card("魔纹法术书", "book", upgrades.book),
      card("灵魂之火", "soul", upgrades.soul),
    );
    panel.replaceChildren(heading,
      node("p", "", "人格值与败北值互相抵消；对立职业日常会等额削减已投入经验并造成降级，已领取属性不会重复发放。"),
      grid);
  }

  LG.infernalChurchUpgradeUI = {
    init() {
      panel = document.getElementById("infernalChurchUpgradePanel");
      LG.authority.subscribe(render);
      render();
    },
    render,
  };
})(window.LifeGame);
