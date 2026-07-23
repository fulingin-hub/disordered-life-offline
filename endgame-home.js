(function (LG) {
  const ids = [
    "app", "chapterLabel", "eventType", "routeLabel", "eventTitle",
    "eventSpeaker", "eventText", "eventQuote", "choiceList", "progressFill",
    "portraitWrap",
  ];
  let el;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function action(label, hint, callback, primary = false) {
    const button = node("button",
      `choice-button${primary ? " primary" : ""}`);
    button.type = "button";
    button.append(node("span", "", label), node("small", "", hint));
    button.addEventListener("click", callback);
    return button;
  }

  function render() {
    if (!el) {
      el = Object.fromEntries(ids.map((id) =>
        [id, document.getElementById(id)]));
    }
    el.app.dataset.chapter = "幸福人生";
    el.chapterLabel.textContent = "冒险者公会 · 异界魔境 · 黄金都城";
    el.eventType.textContent = "幸福人生 · 15+ RPG";
    el.routeLabel.textContent = "终局远征起点";
    el.eventTitle.textContent = "第一份远征记录";
    el.eventSpeaker.textContent = "米蕾娅与维奥拉";
    el.eventSpeaker.hidden = false;
    el.eventText.textContent =
      "异界魔境已经随终局开放。米蕾娅把悬赏登记册推到你面前，斯与卡则在另一侧等待你完成今日的萨卢卡斯见证。";
    el.eventQuote.textContent =
      "不用先学会所有规矩。选一件现在想做的事，世界会用结果告诉你下一步。";
    el.eventQuote.hidden = false;
    el.progressFill.style.width = "100%";
    el.portraitWrap.hidden = true;
    el.choiceList.replaceChildren(
      action("看看第一份悬赏", "从公会认识远征、整备与战利品循环",
        () => LG.guildOnboarding?.open?.("intro"), true),
      action("进入异界魔境", "已自动开放，接悬赏并推进七层地狱",
        () => LG.infernalUI?.open?.()),
      action("完成今日入城见证", "七个不同日期，胜负都计入",
        () => LG.goldenHorizonUI?.open?.()),
      action("检查主角整备", "人格、战斗伙伴、装备与收藏",
        () => LG.traitsUI?.open?.()),
    );
    LG.dialogueUI?.reset?.();
    LG.cgUI?.showEvent?.({ id: "endgame-guild-hub" });
    LG.audio?.scene?.("world");
  }

  LG.endgameHome = { render };
})(window.LifeGame);
