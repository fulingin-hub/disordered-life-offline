(function (LG) {
  const D = () => LG.GOLDEN_HORIZON_DATA;
  const P = () => LG.goldenHorizonPanels;

  function button(label, onClick, disabled, cls = "") {
    const el = P().node("button", cls, label);
    el.type = "button";
    el.disabled = disabled;
    el.addEventListener("click", onClick);
    return el;
  }

  function mischief(data, act, busy) {
    const stage = data.mischief?.stage || 0;
    const claimed = data.mischief?.claimed === true;
    const labels = [
      "接受斯的绝密委托",
      "挖开都城第三块地砖",
      "开启最后一层黄金密匣",
      "今日已经领到旧袜子",
    ];
    const section = P().node("section", "golden-panel golden-mischief");
    section.append(P().node("span", "event-type", "每日隐藏委托"),
      P().node("h3", "", "斯的黄金密匣"),
      P().node("p", "", claimed
        ? `你已经拥有${data.sockCount}只【两界航路记录官的旧袜子】。`
        : "斯保证这是一项关系两界命运的绝密调查。卡对此一直憋着笑。"),
      button(labels[stage], () => act("goldenMischief"), busy || claimed,
        "golden-mischief-button"));
    return section;
  }

  function professions(data, act, busy) {
    const section = P().node("section", "golden-panel");
    section.append(P().node("span", "event-type", "黄金都城二阶职业"),
      P().node("h3", "", "同行路线晋升"),
      P().node("p", "",
        "二阶职业记录长期同行经历，只能同时装备一个，但解锁后永久保留。"));
    const grid = P().node("div", "golden-profession-grid");
    D().professions.forEach((item) => {
      const progress = data.professionProgress?.[item.id] || {};
      const unlocked = progress.unlocked === true;
      const equipped = data.professions?.equipped === item.id;
      const eligible = progress.clears >= progress.target && progress.tokenOwned;
      const card = P().node("article", equipped ? "equipped" : "");
      const portrait = P().node("img", "golden-profession-portrait");
      portrait.src = D().professionPortrait(item, LG.authority.state()?.gender);
      portrait.alt = `${item.name}专属职业装备与坐骑立绘`;
      portrait.loading = "lazy";
      card.append(portrait, P().node("span", "event-type", `${item.guide}路线`),
        P().node("h4", "", item.name),
        P().node("p", "golden-profession-loadout", item.equipment),
        P().node("p", "golden-profession-vehicle", item.vehicle),
        P().node("p", "", item.requirement),
        P().node("p", "golden-profession-effect", item.effect),
        P().node("strong", "", `同行成功 ${progress.clears || 0}/${
          progress.target || 7} · 凭证${progress.tokenOwned ? "已持有" : "未持有"}`));
      card.append(button(equipped ? "当前装备" : unlocked ? "装备职业"
        : eligible ? "解锁并装备" : "条件未满足",
      () => act(unlocked ? "goldenEquipProfession" : "goldenUnlockProfession",
        { profession: item.id }), busy || equipped || (!unlocked && !eligible)));
      grid.append(card);
    });
    section.append(grid);
    return section;
  }

  function social(data, online, vote, reload, busy) {
    const section = P().node("section", "golden-panel golden-social");
    section.append(P().node("span", "event-type", "DZMM在线互动"),
      P().node("h3", "", "黄金都城传闻板"),
      P().node("p", "",
        "全服玩家每天匿名选择一种立场。热度为近似实时，只营造城市气氛。"));
    if (online.state === "loading") {
      section.append(P().node("p", "golden-social-state", "正在读取今日传闻…"));
      return section;
    }
    if (online.state === "error") {
      section.append(P().node("p", "golden-social-state", online.error),
        button("重新读取传闻板", reload, busy));
      return section;
    }
    if (online.state !== "ready") {
      section.append(button("读取今日全服传闻", reload, busy));
      return section;
    }
    const board = online.board || { counts: {}, total: 0 };
    section.append(P().node("strong", "golden-social-total",
      `今日已有 ${board.total || 0} 次立场记录`));
    const grid = P().node("div", "golden-social-grid");
    D().socialChoices.forEach((item) => {
      const selected = data.social?.choice === item.id;
      const card = P().node("article", selected ? "selected" : "");
      card.append(P().node("span", "", item.name),
        P().node("strong", "", String(board.counts?.[item.id] || 0)),
        button(selected ? "你的今日立场" : "留下立场",
          () => vote(item.id), busy || Boolean(data.social?.choice)));
      grid.append(card);
    });
    section.append(grid);
    return section;
  }

  LG.goldenHorizonExtraPanels = { mischief, professions, social };
})(window.LifeGame);
