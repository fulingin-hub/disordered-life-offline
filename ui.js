(function (LG) {
  const el = {}; let callbacks = {};
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function renderStats(state) {
    el.stats.replaceChildren();
    Object.entries(LG.CONFIG.statMeta).forEach(([key, label]) => {
      const value = state.stats[key];
      const stat = node("div", "stat");
      stat.dataset.key = key;
      if (key === "dignity" && value <= 25) stat.classList.add("critical");
      const heading = node("div", "stat-heading");
      heading.append(node("span", "", label), node("b", "", String(value)));
      const track = node("div", "stat-track");
      const fill = node("span");
      const maximum = Math.max(100, value);
      fill.style.width = `${Math.min(100, value / maximum * 100)}%`;
      track.append(fill);
      stat.append(heading, track);
      el.stats.append(stat);
    });
  }
  function addChoice(choice, index, state) {
    const button = node("button", `choice-button${index === 0 ? " primary" : ""}`);
    const details = [choice.hint, choice.requirementText].filter(Boolean).join(" · ");
    button.type = "button";
    button.disabled = Boolean(choice.locked);
    if (choice.locked) button.classList.add("requirement-locked");
    button.append(node("span", "", choice.label), node("small", "", details));
    button.addEventListener("click", () => callbacks.onChoice(index));
    el.choiceList.append(button);
  }

  function setSpeaker(event, state) {
    el.portrait.removeAttribute("src");
    el.portraitWrap.hidden = true;
    el.eventSpeaker.textContent =
      LG.characterDemographics?.speaker?.(event, state) || event.speaker || "";
    el.eventSpeaker.hidden = !el.eventSpeaker.textContent;
  }

  function renderEvent(state) {
    const event = LG.engine.current(state);
    el.app.dataset.chapter = event.chapter;
    const age = state.timeline?.ageYears ?? event.age,
      ageText = LG.characterDemographics.ageLabel(state.timeline, event.age);
    el.chapterLabel.textContent = `${event.chapter} · ${ageText} · ${
      LG.endingArchive.label(state.gender)}`;
    el.eventType.textContent = "人生事件";
    el.routeLabel.textContent = state.route === "university"
      ? "大学路线" : state.route === "work" ? "工作路线"
        : state.route === "japan" ? `${state.studyAbroad?.city || "岛国"}留学线`
          : state.route === "usa" ? `${state.studyAbroad?.city || "米国"}留学线`
            : state.route === "sanctuary" ? "虚构机构路线"
              : state.route === "teacher" ? "沈静秋路线" : "尚未分流";
    el.eventTitle.textContent = event.title;
    el.eventText.textContent = typeof event.text === "function" ? event.text(state) : event.text;
    el.eventQuote.textContent = event.quote || "";
    el.eventQuote.hidden = !event.quote;
    el.progressFill.style.width = `${Math.min(96, Math.round(age / 28 * 100))}%`;
    el.choiceList.replaceChildren();
    event.choices.forEach((choice, index) => addChoice(choice, index, state));
    LG.cgUI.showEvent(event);
    setSpeaker(event, state);
    LG.dialogueUI.configure(state, event);
    requestAnimationFrame(() => LG.narration?.speakEvent?.(event, state));
  }

  function renderEnding(state) {
    const ending = state.currentEnding;
    if (!ending) return;
    el.app.dataset.chapter = "结局";
    const endingAge = LG.characterDemographics.ageLabel(state.timeline,
      state.lastEventAge || 28);
    const gender = LG.endingArchive.label(state.gender);
    el.chapterLabel.textContent = ending.universal
      ? `隐藏结局 · ${endingAge} · 通用`
      : ending.hidden
      ? `隐藏结局 · ${endingAge} · ${gender}`
      : state.endingId === "dignity-zero"
      ? `尊严归零 · ${endingAge} · ${gender}` : `结局 · ${endingAge} · ${gender}`;
    el.eventType.textContent = "人生结局";
    el.routeLabel.textContent = ending.hidden
      ? ending.ordinary ? "隐藏普通结局" : "隐藏失败结局"
      : ending.ordinary ? "普通结局" : "失败结局";
    el.eventTitle.textContent = ending.title;
    el.eventText.textContent = ending.text;
    el.eventQuote.hidden = true;
    el.progressFill.style.width = "100%";
    LG.cgUI.showEnding(ending, state.gender);
    el.portraitWrap.hidden = true;
    el.choiceList.replaceChildren();
    LG.dialogueUI.reset();

    const mark = node("span", `ending-mark${ending.ordinary ? " ordinary" : ""}`,
      ending.ordinary ? "你守住了自己" : "人生已偏离");
    el.eventText.prepend(mark, document.createElement("br"));

    const restart = node("button", "choice-button primary");
    restart.type = "button";
    restart.dataset.restartLife = "true";
    restart.append(node("span", "", "再次出生"), node("small", "", "重新选择"));
    restart.addEventListener("click", () => callbacks.onRestart(true));
    const archive = node("button", "choice-button");
    archive.type = "button";
    archive.dataset.adultGallery = "true";
    archive.append(node("span", "", "查看人生结局"), node("small", "", "收集进度"));
    archive.addEventListener("click", callbacks.onArchive);
    const traits = node("button", "choice-button");
    traits.type = "button";
    traits.append(node("span", "", "分配属性点"), node("small", "", "解锁称号"));
    traits.addEventListener("click", () => LG.traitsUI.open());
    el.choiceList.append(restart, traits, archive);
  }

  LG.ui = {
    init(nextCallbacks) {
      callbacks = nextCallbacks;
      [
        "app", "chapterLabel", "stats", "portraitWrap", "portrait", "portraitName",
        "eventPanel", "eventType", "routeLabel", "eventTitle", "eventSpeaker",
        "eventText", "eventQuote",
        "choiceList", "progressFill", "outcomeToast", "archiveDialog",
        "archiveCount", "archiveList", "soundButton", "restartButton",
      ].forEach((id) => { el[id] = document.getElementById(id); });
      document.getElementById("closeArchiveButton").addEventListener("click", () => el.archiveDialog.close());
      el.restartButton.addEventListener("click", () => { document.getElementById("recoveryDialog")?.close(); callbacks.onRestart(false); });
      el.soundButton.addEventListener("click", callbacks.onSound);
    },
    render(state) {
      el.app.dataset.gender = state.gender || ""; el.app.dataset.mode = state.gameMode || "";
      LG.audio.scene(state.endingId ? "ending" : "story");
      el.stats.hidden = state.gameMode === "endgame"; renderStats(state);
      if (state.gameMode === "endgame") LG.endgameHome.render(state);
      else if (state.endingId) renderEnding(state);
      else renderEvent(state);
      LG.protagonistPortrait?.render?.(state);
      LG.equipmentUI?.refresh?.();
    },
    setLocked(locked) {
      el.choiceList.querySelectorAll("button").forEach((button) => {
        button.disabled = locked || button.classList.contains("requirement-locked");
      });
    },
    setRestarting(active) {
      el.restartButton.disabled = active;
      el.restartButton.textContent = active ? "正在重新出生…" : "重新出生";
      el.choiceList.querySelectorAll("[data-restart-life]").forEach((button) => {
        button.disabled = active;
        button.querySelector("span").textContent =
          active ? "正在重新出生…" : "再次出生";
      });
    },
    showOutcome(text, retry) {
      el.outcomeToast.replaceChildren(node("span", "", text));
      if (retry) {
        const button = node("button", "quiet-button", "重新尝试");
        button.type = "button"; button.addEventListener("click", retry); el.outcomeToast.append(" ", button);
      }
      el.outcomeToast.hidden = false;
    },
    hideOutcome() {
      el.outcomeToast.hidden = true;
    },
    showArchive(collection, gender) {
      if (LG.contentMode?.guardGallery?.()) return;
      const count = LG.endingArchive.count(collection, gender);
      const endings = LG.authority.archiveView(gender);
      el.archiveCount.textContent = `${LG.endingArchive.label(gender)} 已发现 ${count}/${
        LG.authority.endingCount()}`;
      el.archiveList.replaceChildren();
      endings.forEach((ending) => {
        const known = !ending.locked;
        const entry = node("article", `archive-entry${known ? " known" : " locked"}`);
        entry.append(
          node("strong", "", known ? ending.title : "尚未发现"),
          node("p", "", known ? ending.text : "继续生活，寻找这条人生支线。"),
        );
        if (known) LG.cgUI.decorateArchive(entry, ending, gender);
        el.archiveList.append(entry);
      });
      el.archiveDialog.showModal();
    },
    updateSound(enabled) {
      el.soundButton.textContent = `声音：${enabled ? "开" : "关"}`;
    },
    transition(render) {
      el.eventPanel.classList.add("switching");
      window.setTimeout(() => {
        render();
        el.eventPanel.classList.remove("switching");
      }, 170);
    },
  };
})(window.LifeGame);
