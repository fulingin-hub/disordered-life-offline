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

  function render(state) {
    const event = LG.ENDGAME_HOME_EVENT;
    if (!el) {
      el = Object.fromEntries(ids.map((id) =>
        [id, document.getElementById(id)]));
    }
    el.app.dataset.chapter = event.chapter;
    el.chapterLabel.textContent = "冒险者公会 · 异界联盟魔境 · 黄金都城";
    el.eventType.textContent = "世界征途 · 15+ RPG";
    el.routeLabel.textContent = "世界征途起点";
    el.eventTitle.textContent = event.title;
    el.eventSpeaker.textContent = event.speaker;
    el.eventSpeaker.hidden = false;
    el.eventText.textContent = event.text;
    el.eventQuote.textContent = event.quote;
    el.eventQuote.hidden = false;
    el.progressFill.style.width = "100%";
    el.portraitWrap.hidden = true;
    el.choiceList.replaceChildren(
      action("看看第一份悬赏", "从公会认识远征、整备与战利品循环",
        () => LG.guildOnboarding?.open?.("intro"), true),
      action("进入异界联盟魔境", "已自动开放，接悬赏并推进七层地狱",
        () => LG.infernalUI?.open?.()),
      action("完成今日入城见证", "七个不同日期，胜负都计入",
        () => LG.goldenHorizonUI?.open?.()),
      action("检查主角整备", "人格、战斗伙伴、装备与收藏",
        () => LG.traitsUI?.open?.()),
    );
    LG.dialogueUI?.reset?.();
    LG.cgUI?.showEvent?.(event);
    LG.audio?.scene?.("world");
    requestAnimationFrame(() => LG.narration?.speakEvent?.(event, state));
  }

  LG.endgameHome = { render };
})(window.LifeGame);
