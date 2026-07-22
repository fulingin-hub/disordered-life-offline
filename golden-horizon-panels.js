(function (LG) {
  const D = () => LG.GOLDEN_HORIZON_DATA;
  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function button(label, onClick, disabled, cls = "") {
    const el = node("button", cls, label);
    el.type = "button"; el.disabled = disabled;
    el.addEventListener("click", onClick);
    return el;
  }
  function companions(data, guide, choose, busy) {
    const section = node("section", "golden-companions");
    Object.entries(D().characters).forEach(([id, item]) => {
      const card = node("article", `golden-companion${guide === id ? " selected" : ""}`);
      const image = node("img"); image.src = LG.CONFIG.assets[item.image];
      image.alt = `${item.name} · ${item.role}`; image.loading = "lazy";
      const body = node("div");
      body.append(node("span", "event-type", item.role),
        node("h3", "", item.name), node("p", "", item.copy),
        button(guide === id ? "当前同行" : `与${item.name}同行`,
          () => choose(id), busy, "golden-guide-button"));
      card.append(image, body); section.append(card);
    });
    return section;
  }
  function weekly(data) {
    const section = node("section", "golden-panel");
    const heading = node("div", "golden-panel-heading");
    heading.append(node("div", "", "萨卢卡斯七日通行印记"),
      node("strong", "", `${data.clearedDays.length}/7`));
    const track = node("div", "golden-week-track");
    for (let index = 0; index < 7; index += 1) {
      track.append(node("span", index < data.clearedDays.length ? "cleared" : "",
        String(index + 1)));
    }
    section.append(heading, track, node("p", "",
      data.weekFailed ? "本周完整通关资格已中止，但每日内容仍可继续。"
        : "连续七日通过全部地图，可获得【萨卢卡斯的馈赠】。"));
    return section;
  }
  function trial(data, guide, act, busy) {
    const section = node("section", "golden-panel golden-trial");
    const map = D().map(data.today.mapId);
    const known = guide === "si" || data.bonuses.allMapsKnown
      || data.today.attempted;
    section.append(node("span", "event-type",
      data.today.hidden ? "第七日 · 隐藏地图" : "今日开放地图"),
    node("h3", "", known ? map.name : "变换的萨卢卡斯"),
    node("p", "", known
      ? `${map.gate}：${map.text}`
      : "卡没有替你标出答案。根据七日规律，自己选择今天的门。"));
    const grid = node("div", "golden-gates");
    D().gates.forEach((gate) => {
      const safe = known && gate.id === data.today.gate;
      grid.append(button(gate.name, () =>
        act("goldenTrial", { gate: gate.id, guide }),
      busy || data.today.attempted, safe ? "safe" : ""));
    });
    if (data.today.attempted) {
      section.append(node("strong", data.today.success ? "golden-success" : "golden-failure",
        data.today.success ? "今日试炼已通过" : "今日试炼失败"));
    }
    section.append(grid); return section;
  }
  function arenas(data, act, busy) {
    const section = node("section", "golden-panel");
    section.append(node("h3", "", "六大势力角斗场"),
      node("p", "", "无入场要求，每座角斗场每日可完成一次。"));
    const grid = node("div", "golden-arena-grid");
    D().arenas.forEach((arena) => {
      const done = data.arenas.completed.includes(arena.id);
      grid.append(button(done ? `${arena.name} · 已完成` : arena.name,
        () => act("goldenArena", { faction: arena.id }), busy || done));
    });
    section.append(grid); return section;
  }
  function chips(items, owned, cls) {
    const grid = node("div", cls);
    items.forEach(([id, name, lore]) => {
      const card = node("article", owned.includes(id) ? "owned" : "");
      card.append(node("strong", "", name), node("p", "", lore));
      grid.append(card);
    });
    return grid;
  }
  function inventory(data, act, busy) {
    const section = node("section", "golden-panel");
    const summary = node("div", "golden-panel-heading");
    summary.append(node("div", "", "萨卢卡斯收藏"),
      node("strong", "", `馈赠 ${data.gifts} · 点数 ${data.currency}`));
    section.append(summary,
      button("开启萨卢卡斯的馈赠", () => act("goldenUseGift"),
        busy || !data.gifts, "golden-primary"),
      node("h4", "", `萨卢卡斯五件套 ${data.setPieces.length}/5`),
      chips(D().setPieces, data.setPieces, "golden-set-grid"),
      node("h4", "", `十三地图图鉴 ${data.collectibles.length}/13`),
      chips(D().collectibles, data.collectibles, "golden-collection-grid"));
    const bonuses = node("p", "golden-bonuses");
    bonuses.textContent = [
      data.bonuses.arenaBoost ? "角斗奖励强化" : "3件图鉴：强化角斗奖励",
      data.bonuses.trialBoost ? "试炼点数强化" : "7件图鉴：强化试炼点数",
      data.bonuses.allMapsKnown ? "全部地图永久可见" : "13件图鉴：永久识别地图",
      data.bonuses.setComplete ? "五件套：每周馈赠翻倍" : "集齐五件套：每周馈赠翻倍",
    ].join(" · ");
    section.append(bonuses); return section;
  }
  function exchange(data, act, busy) {
    const section = node("section", "golden-panel");
    section.append(node("h3", "", "异界商行兑换"),
      node("p", "", `当前点数 ${data.currency}`));
    const grid = node("div", "golden-shop-grid");
    D().exchanges.forEach((item) => {
      const owned = item.id !== "supplies" && data.mysteries.includes(item.id);
      const card = node("article");
      card.append(node("strong", "", item.name), node("p", "", item.text),
        button(owned ? "已兑换" : `${item.cost}点兑换`,
          () => act("goldenExchange", { item: item.id }),
          busy || owned || data.currency < item.cost));
      grid.append(card);
    });
    section.append(grid); return section;
  }
  function hidden(data, act, busy) {
    const ready = data.today.success && data.arenas.completed.length === 6;
    const claimed = data.hiddenClaimedWeek === data.week;
    const section = node("section", "golden-panel golden-hidden");
    section.append(node("span", "event-type", "隐藏挑战"),
      node("h3", "", "同行者的默契"),
      node("p", "", "同日完成今日萨卢卡斯试炼与六大势力角斗场。"),
      button(claimed ? "本周已完成" : ready ? "领取神秘奖励" : "尚未满足条件",
        () => act("goldenHiddenChallenge"), busy || claimed || !ready));
    return section;
  }
  LG.goldenHorizonPanels = {
    companions, weekly, trial, arenas, inventory, exchange, hidden, node,
  };
})(window.LifeGame);
