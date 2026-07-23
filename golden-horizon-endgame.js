(function (LG) {
  const P = () => LG.goldenHorizonPanels;
  const fronts = [
    {
      id: "holy-light", title: "圣光教团",
      copy: "完成本周圣光周常，击破魔纹教会女主教。",
      open: () => LG.holyLightUI.open(),
    },
    {
      id: "infernal-church", title: "魔纹教会",
      copy: "完成本周魔纹周常，攻打圣光教团圣徒。",
      open() {
        LG.infernalChurchUI.renderChurch();
        document.getElementById("infernalChurchDialog")?.showModal();
      },
    },
    {
      id: "endless-abyss", title: "七层地狱 · 无尽深渊",
      copy: "先突破七层地狱，再于本周完整通关一次无尽深渊。",
      open: () => LG.infernalUI.open(),
    },
    {
      id: "vehicle-expo", title: "万界载具博览会",
      copy: "解锁博览会，装备任意载具并切换为乘骑模式。",
      open: () => LG.vehicleUI.open(),
    },
    {
      id: "golden-horizon", title: "黄金都城",
      copy: "本周至少通过一次萨卢卡斯每日试炼。",
      local: true,
      open: () => document.querySelector(".golden-trial")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    },
  ];

  function button(label, onClick, disabled, cls = "") {
    const item = P().node("button", cls, label);
    item.type = "button";
    item.disabled = disabled;
    if (onClick) item.addEventListener("click", onClick);
    return item;
  }

  function leaveAndOpen(open) {
    document.querySelector(".golden-horizon-dialog")?.close();
    window.setTimeout(open, 0);
  }

  function panel(data, act, busy) {
    const section = P().node("section", "golden-panel golden-endgame");
    const endgame = data.endgame || { fronts: [], complete: false };
    const state = Object.fromEntries((endgame.fronts || [])
      .map((item) => [item.id, item]));
    section.append(P().node("span", "event-type", "DZMM终局挑战 · 每周固定副本"),
      P().node("h3", "", "五界终局远征"),
      P().node("p", "",
        "完成五条既有战线，权威存档会自动登记进度；周一刷新后重新开始。"));
    const progress = P().node("div", "golden-endgame-progress");
    fronts.forEach((front) => {
      const cleared = state[front.id]?.cleared === true;
      const ready = state[front.id]?.ready === true;
      const card = P().node("article", cleared ? "cleared" : "");
      card.append(P().node("span", "", cleared ? "已完成" : "未完成"),
        P().node("strong", "", front.title),
        P().node("p", "", front.copy),
        button(cleared ? "本周已登记"
          : front.id === "vehicle-expo" && ready ? "登记本周参战载具"
          : front.local ? "前往今日试炼" : "前往战线",
        front.id === "vehicle-expo" && ready
          ? () => act("goldenRegisterVehicle")
          : front.local ? front.open : () => leaveAndOpen(front.open),
        busy || cleared));
      progress.append(card);
    });
    const count = (endgame.fronts || []).filter((item) => item.cleared).length;
    section.append(progress, P().node("strong", "golden-endgame-count",
      `本周战线 ${count}/${fronts.length}`),
    button(endgame.rewardClaimed ? "本周终局奖励已领取"
      : endgame.complete ? "领取终局远征奖励" : "完成五条战线后解锁",
    () => act("goldenEndgameReward"), busy || !endgame.complete
      || endgame.rewardClaimed, "golden-primary"));
    return section;
  }

  LG.goldenHorizonEndgame = { panel };
})(window.LifeGame);
