(function (LG) {
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function rewardCard(title, state, copy) {
    const card = node("article", `adventure-guild-item reward${
      state.claimed ? " claimed" : ""}`);
    const heading = node("div", "adventure-guild-item-heading");
    heading.append(node("strong", "", title),
      node("span", "", state.claimed ? "已领取"
        : state.available ? "可领取" : "未达成"));
    card.append(heading, node("p", "", copy));
    return card;
  }

  function firstGift(data, busy, act) {
    const state = data.rewards.firstExpedition || {};
    const copy = state.claimed
      ? `维奥拉已交付${state.itemName || "首征伙伴奖励"}。`
      : "首次打通七层地狱后，由维奥拉交付一档普通战斗伙伴礼盒；不重复，并自动设为先锋协同。";
    const card = rewardCard("首征战斗伙伴礼盒", state, copy);
    const button = node("button", "", state.claimed ? "已经领取"
      : state.available ? "请维奥拉交付礼盒" : "首次通关后开放");
    button.type = "button";
    button.disabled = busy || !state.available;
    button.addEventListener("click", () => act(
      "adventureGuildClaimFirstGift", {}, "维奥拉正在核对首征记录..."));
    card.append(button);
    return card;
  }

  function professionSet(data, busy, act) {
    const state = data.rewards.professionSet || {};
    const copy = state.claimed
      ? `已选择${state.professionName || "一阶职业"}并完成五件套登记。`
      : "第二次打通七层地狱后可选择一个一阶职业。公会同时登记资格、五件套并直接装备。";
    const card = rewardCard("二征一阶职业五件套", state, copy);
    const select = node("select", "adventure-guild-reward-select");
    (state.options || []).forEach((job) => {
      const option = node("option", "", `${job.name} · ${job.mastery}`);
      option.value = job.id;
      select.append(option);
    });
    select.disabled = busy || !state.available;
    const button = node("button", "", state.claimed ? "已经领取"
      : state.available ? "接受职业资格与五件套" : "第二次通关后开放");
    button.type = "button";
    button.disabled = busy || !state.available || !select.value;
    button.addEventListener("click", () => act(
      "adventureGuildClaimProfessionSet", { professionId: select.value },
      "维奥拉正在登记职业资格与五件装备..."));
    card.append(select, button);
    return card;
  }

  function expedition(data) {
    const rewards = data.rewards || {};
    const state = { available: rewards.expeditionUnlocked, claimed: false };
    return rewardCard("赫克托的五人深渊远征", state,
      rewards.expeditionUnlocked
        ? `队长赫克托已开放百层分段远征。玩家固定为第五席队员，不能担任队长；每人负责20层，当前战利品凭证 ${rewards.abyssShares || 0}/5。`
        : "第二次打通七层地狱后，赫克托会召集四名NPC与玩家组成五人队；玩家不能担任队长。");
  }

  LG.adventureGuildRewardsUI = {
    render(container, data, busy, act) {
      container.replaceChildren(firstGift(data, busy, act),
        professionSet(data, busy, act), expedition(data));
    },
  };
})(window.LifeGame);
