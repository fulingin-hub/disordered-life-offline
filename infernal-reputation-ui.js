(function (LG) {
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function rewardGroup(group, reputation) {
    const card = node("article", `reputation-reward-group ${group.kind}`);
    const unlocked = group.rewards.filter(([target]) => reputation >= target).length;
    const heading = node("div", "reputation-reward-heading");
    heading.append(node("strong", "", group.title),
      node("span", "", `${unlocked}/${group.rewards.length}`));
    const milestones = node("div", "reputation-milestones");
    group.rewards.forEach(([target, name]) => {
      const earned = reputation >= target;
      const chip = node("div", earned ? "earned" : "");
      chip.append(node("span", "", `${target}声望`),
        node("strong", "", name),
        node("small", "", earned ? "已获得" : `还差${target - reputation}`));
      milestones.append(chip);
    });
    card.append(heading, milestones);
    return card;
  }

  function render(container) {
    if (!container) return;
    const reputation = LG.infernalRealm.stats().reputation;
    const heading = node("div", "reputation-board-heading");
    heading.append(node("div", "", "异界魔境声望奖励"),
      node("strong", "", `${reputation} / 3000`));
    const progress = node("progress", "reputation-total-progress");
    progress.max = 3000;
    progress.value = Math.min(3000, reputation);
    const groups = LG.INFERNAL_DATA.reputationRewards
      .map((group) => rewardGroup(group, reputation));
    container.replaceChildren(heading, progress, ...groups);
  }

  LG.infernalReputationUI = { render };
})(window.LifeGame);
