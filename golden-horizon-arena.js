(function (LG) {
  let selected = "university";
  const A = () => LG.GOLDEN_ARENA_DATA;
  const P = () => LG.goldenHorizonPanels;
  const moveNames = { rock: "石头", paper: "布", scissors: "剪刀" };

  function button(label, onClick, disabled, cls = "") {
    const item = P().node("button", cls, label);
    item.type = "button";
    item.disabled = disabled;
    item.addEventListener("click", onClick);
    return item;
  }

  function crowdLine(arena) {
    const reputation = LG.infernalRealm.stats().reputation;
    const title = LG.authority.snapshot()?.economy?.infernalTitles?.active?.title;
    if (reputation >= 1500) {
      return title
        ? `“是${title}阁下！深渊远征的那位英雄！”观众席已经认出了你。`
        : "“是他！深渊远征的那个家伙！”观众席已经认出了你。";
    }
    if (reputation >= 500) return `“我听说过这位冒险者。”${arena.crowd}`;
    return arena.crowd;
  }

  function result(run) {
    if (!run?.lastRound) return null;
    const last = run.lastRound;
    const labels = { win: "胜利", tie: "平局", loss: "失败" };
    const row = P().node("div", `golden-arena-result ${last.outcome}`);
    row.append(
      P().node("strong", "", `第${last.round}轮 · ${labels[last.outcome]}`),
      P().node("span", "", `你：${moveNames[last.player]} · 对手：${
        moveNames[last.opponent]}`),
      P().node("span", "", `本轮 +${last.reward} · 本场累计 ${
        run.earned || 0} 点`),
    );
    return row;
  }

  function progress(run) {
    const track = P().node("div", "golden-arena-streak");
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `十轮进度，已胜${run?.wins || 0}轮`);
    for (let round = 1; round <= 10; round += 1) {
      const cls = round <= (run?.wins || 0) ? "won"
        : round === (run?.round || 1) && run?.status === "active"
          ? "current" : "";
      track.append(P().node("span", cls, String(round)));
    }
    return track;
  }

  function arenaDetail(data, act, busy) {
    const arena = A().arenas.find((item) => item.id === selected) || A().arenas[0];
    const run = data.arenas.runs?.[arena.id];
    const done = data.arenas.completed.includes(arena.id);
    const detail = P().node("article", `golden-arena-stage theme-${arena.theme}`);
    detail.append(
      P().node("span", "event-type", arena.host),
      P().node("h4", "", arena.name),
      P().node("strong", "golden-arena-champion", arena.champion),
      P().node("p", "golden-arena-venue", arena.venue),
      P().node("p", "golden-arena-host-line", `“${arena.welcome}”`),
      P().node("p", "golden-arena-crowd", crowdLine(arena)),
      progress(run),
    );
    const last = result(run);
    if (last) detail.append(last);
    if (run?.status === "won") {
      detail.append(P().node("p", "golden-arena-performance", arena.victory));
    } else if (run?.status === "lost" || done) {
      detail.append(P().node("p", "golden-arena-finished",
        "今日资格已经使用。主持人开始为下一组冒险者报幕。"));
    } else {
      detail.append(P().node("strong", "golden-arena-round",
        `当前第 ${run?.round || 1}/10 轮 · 已胜 ${run?.wins || 0} 轮`));
      const moves = P().node("div", "golden-arena-moves");
      ["rock", "scissors", "paper"].forEach((move) => {
        moves.append(button(moveNames[move], () => {
          LG.audio?.choose?.();
          act("goldenArena", { faction: arena.id, move });
        }, busy));
      });
      detail.append(moves);
    }
    return detail;
  }

  function rewardCard(item, owned, image, description, act, data, busy) {
    const card = P().node("article", `golden-champion-item${owned ? " owned" : ""}`);
    if (image) {
      const art = P().node("img");
      art.src = image; art.alt = item.name; art.loading = "lazy";
      card.append(art);
    }
    card.append(P().node("strong", "", item.name),
      P().node("p", "", description),
      button(owned ? "已兑换" : `${item.cost.toLocaleString("zh-CN")}点兑换`,
        () => act("goldenArenaExchange", { item: item.id }),
        busy || owned || data.championship.certificates < item.cost));
    return card;
  }

  function store(data, act, busy) {
    const section = P().node("section", "golden-champion-store");
    section.append(P().node("div", "golden-panel-heading",
      `冠军奖状商城 · 当前 ${data.championship.certificates.toLocaleString("zh-CN")} 点`));
    const medal = P().node("div", "golden-champion-medal");
    medal.append(rewardCard(A().medal, data.championship.medalUnlocked, null,
      "角斗场冠军身份凭证。购买后可在职业系统的职业勋章栏装备。",
      act, data, busy));
    const set = P().node("div", "golden-champion-set");
    A().setPieces.forEach((item) => set.append(rewardCard(
      item, data.championship.setPieces.includes(item.id), null,
      "集齐五件后，每轮胜利与失败获得的冠军奖状×5。", act, data, busy)));
    const gender = LG.authority.state()?.gender === "female" ? "female" : "male";
    const showcase = P().node("div", "golden-champion-showcase");
    showcase.append(
      rewardCard(A().king, data.championship.kingUnlocked,
        A().king[gender],
        "黄金都城魔法与科技结合的黑金重甲特战构装体。装备时胜利奖状×50，坐骑只能跟随。",
        act, data, busy),
      rewardCard(A().dragon, data.championship.dragonUnlocked,
        A().dragon.image,
        "黑金机甲构筑的西方巨龙。无视地形，萨卢卡斯挑战进错门也不会失败。",
        act, data, busy),
    );
    section.append(medal, set, showcase);
    return section;
  }

  function panel(data, act, busy, rerender) {
    const section = P().node("section", "golden-panel golden-arenas");
    const champions = A().arenas.filter((arena) =>
      data.arenas.runs?.[arena.id]?.status === "won").length;
    const totalVictories = A().arenas.reduce((sum, arena) =>
      sum + (Number(data.arenaVictories?.[arena.id]) || 0), 0);
    section.append(P().node("span", "event-type", "每日六场 · 每场一次"),
      P().node("h3", "", "六大势力冠军角斗场"),
      P().node("p", "", "每场共10轮。胜利进入下一轮，失败结束今日资格，平局原轮重赛。"),
      P().node("strong", "golden-arena-summary",
        `今日已结算 ${data.arenas.completed.length}/6 · 十轮冠军 ${
          champions}/6 · 累计胜利 ${totalVictories}`));
    const grid = P().node("div", "golden-arena-grid");
    A().arenas.forEach((arena) => {
      const done = data.arenas.completed.includes(arena.id);
      const run = data.arenas.runs?.[arena.id];
      const state = run?.status === "won" ? "冠军"
        : run?.status === "lost" ? `止步第${run.lastRound?.round || 1}轮`
          : run ? `第${run.round}/10轮` : "待挑战";
      const classes = [
        selected === arena.id ? "selected" : "",
        run?.status === "won" ? "arena-won" : "",
        run?.status === "lost" ? "arena-lost" : "",
      ].filter(Boolean).join(" ");
      const victories = Number(data.arenaVictories?.[arena.id]) || 0;
      grid.append(button(`${arena.name} · ${state} · 累计${victories}次`, () => {
        selected = arena.id;
        rerender();
      }, false, classes));
    });
    section.append(grid, arenaDetail(data, act, busy), store(data, act, busy));
    return section;
  }

  LG.goldenHorizonArena = { panel };
})(window.LifeGame);
