(function (LG) {
  let dialog, log, input, send, residentTitle, residentCopy, newsHost, lettersHost;
  let residentsNav, slogan, schedule, selected = "tavernKeeper";
  let busy = false;
  let requestSequence = 0;
  let viewGeneration = 0;
  let currentReports = null;
  const threads = {};
  const D = () => LG.GOLDEN_HORIZON_DATA;
  const P = () => LG.goldenHorizonPanels;
  function resident(id = selected) {
    const source = schedule?.residents || D().tavernResidents;
    return source.find((item) => item.id === id) || source[0];
  }
  function appendMessage(role, text) {
    threads[selected] = threads[selected] || [];
    threads[selected].push({ role, text });
    const row = P().node("p", `golden-tavern-message ${role}`, text);
    log.append(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }
  function renderThread() {
    log.replaceChildren();
    const items = threads[selected] || [];
    if (!items.length) {
      appendMessage("npc", LG.goldenHorizonResidents.welcome(resident(),
        LG.infernalRealm.stats().reputation, LG.authority.snapshot()
          ?.economy?.infernalTitles?.active?.title));
      return;
    }
    items.forEach((item) => {
      log.append(P().node("p", `golden-tavern-message ${item.role}`, item.text));
    });
    log.scrollTop = log.scrollHeight;
  }

  function setResident(id) {
    if (busy) return;
    selected = id;
    const item = resident();
    residentTitle.textContent = LG.goldenHorizonResidents.label(item);
    residentCopy.textContent = LG.goldenHorizonResidents.warmIntro(
      item, LG.infernalRealm.stats().reputation);
    dialog.querySelectorAll("[data-tavern-resident]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.tavernResident === id);
    });
    renderThread();
  }

  function refreshResidents() {
    const roster = LG.goldenHorizonTavernRoster.refresh(
      residentsNav, selected, setResident, P().node);
    schedule = roster.schedule; selected = roster.selected;
    slogan.textContent = LG.goldenHorizonResidents.tavernSlogan(
      schedule, LG.infernalRealm.stats().reputation);
    setResident(selected);
  }
  function renderNews() {
    newsHost.replaceChildren(LG.goldenHorizonReports.newspaper(
      "酒馆墙上的【今日快讯】", currentReports?.week));
  }
  function renderLetters() {
    LG.goldenHorizonTavernSupport.renderLetters(
      lettersHost, LG.goldenHorizon.data(), P().node);
  }

  function serverError(chunk) {
    const error = new Error(chunk?.message || "居民暂时没有回应。");
    error.code = chunk?.code || "AI_FAILED";
    return error;
  }

  async function submit(event) {
    event.preventDefault();
    const text = input.value.trim().slice(0, 160);
    if (!text || busy) return;
    const requestId = ++requestSequence;
    const generation = viewGeneration;
    const residentId = selected;
    busy = true;
    input.value = "";
    send.disabled = true;
    send.textContent = "交谈中…";
    appendMessage("player", text);
    const reply = appendMessage("npc pending", "正在听酒馆里的回声…");
    let content = "";
    let completed = false;
    try {
      const localText = () => LG.goldenHorizonResidents.localReply(
        resident(), text, LG.infernalRealm.stats().reputation);
      for await (const chunk of LG.playerRuntime.stream("dialogue", {
        kind: "tavern",
        sceneId: "golden-tavern",
        characterId: residentId,
        userText: text,
        actionId: LG.goldenHorizonTavernSupport.actionId(),
      }, { timeout: 60_000 }, localText)) {
        if (requestId !== requestSequence || generation !== viewGeneration) continue;
        if (chunk?.type === "error") throw serverError(chunk);
        if (chunk?.type === "delta") {
          content += chunk.delta || "";
          reply.textContent = content;
          reply.classList.remove("pending");
          log.scrollTop = log.scrollHeight;
        }
        if (chunk?.type === "done") completed = true;
      }
      if (!completed) throw serverError({
        code: "INCOMPLETE_STREAM", message: "对话未完整送达，请再次点击发送。",
      });
      if (generation === viewGeneration) {
        reply.textContent = content || "居民若有所思地点了点头。";
        reply.classList.remove("pending");
        threads[selected][threads[selected].length - 1].text = reply.textContent;
      }
      try {
        await LG.authority.mutate("goldenTavernBond", {
          resident: residentId,
        });
        if (generation === viewGeneration) {
          residentTitle.textContent = LG.goldenHorizonResidents.label(resident());
          residentCopy.textContent = LG.goldenHorizonResidents.warmIntro(
            resident(), LG.infernalRealm.stats().reputation);
          renderLetters();
        }
      } catch (bondError) {
        console.warn("酒馆关系记录失败:",
          bondError?.code, bondError?.message, bondError?.stack);
      }
    } catch (error) {
      console.error("黄金城酒馆对话失败:",
        error?.code, error?.message, error?.stack);
      if (generation === viewGeneration) {
        reply.textContent = error?.message || "消息没有送达，请明确再次发送。";
        reply.className = "golden-tavern-message error";
        threads[selected][threads[selected].length - 1].text = reply.textContent;
        threads[selected][threads[selected].length - 1].role = "error";
      }
    } finally {
      busy = false;
      if (generation === viewGeneration) {
        send.disabled = false;
        send.textContent = "发送";
        input.focus();
      }
    }
  }

  function build() {
    dialog = P().node("dialog", "golden-tavern-dialog");
    const heading = P().node("header", "golden-dialog-heading");
    const title = P().node("div");
    title.append(P().node("span", "event-type", "黄金都城居民交流"),
      P().node("h2", "", "金杯与远路酒馆"));
    const close = P().node("button", "quiet-button", "关闭");
    close.type = "button";
    close.addEventListener("click", () => dialog.close());
    heading.append(title, close);
    slogan = P().node("p", "golden-tavern-slogan",
      "你并不孤独。所有职业者，都在共同改变这个世界。");
    newsHost = P().node("section", "golden-tavern-news");
    lettersHost = P().node("section", "golden-tavern-letter-host");
    residentsNav = P().node("nav", "golden-tavern-residents");
    residentTitle = P().node("h3");
    residentCopy = P().node("p", "golden-tavern-resident-copy");
    log = P().node("div", "golden-tavern-log");
    const form = P().node("form", "golden-tavern-form");
    input = document.createElement("input");
    input.maxLength = 160;
    input.placeholder = "聊聊今天的新闻…";
    input.setAttribute("aria-label", "与酒馆居民交谈");
    send = P().node("button", "", "发送");
    send.type = "submit";
    form.append(input, send);
    form.addEventListener("submit", submit);
    dialog.append(heading, slogan, newsHost, lettersHost, residentsNav,
      residentTitle, residentCopy, log, form);
    dialog.addEventListener("close", () => { viewGeneration += 1; });
    document.body.append(dialog);
  }

  function open(reports) {
    currentReports = reports || currentReports;
    if (!dialog) build();
    send.disabled = busy; send.textContent = busy ? "交谈中…" : "发送";
    renderNews();
    renderLetters();
    refreshResidents();
    if (!dialog.open) dialog.showModal();
  }

  function panel(reportState) {
    return LG.goldenHorizonTavernSupport.entryPanel(
      reportState, open, P().node, LG.goldenHorizon.data());
  }

  LG.goldenHorizonTavern = { panel, open, refreshResidents };
})(window.LifeGame);
