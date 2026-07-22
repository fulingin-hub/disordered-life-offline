(function (LG) {
  let dialog, log, input, send, residentTitle, residentCopy, newsHost;
  let selected = "tavernKeeper";
  let busy = false;
  let requestSequence = 0;
  let viewGeneration = 0;
  let currentReports = null;
  const threads = {};
  const D = () => LG.GOLDEN_HORIZON_DATA;
  const P = () => LG.goldenHorizonPanels;

  function resident(id = selected) {
    return D().tavernResidents.find((item) => item.id === id)
      || D().tavernResidents[0];
  }

  function actionId() {
    try {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return `tavern:${[...bytes].map((value) =>
        value.toString(16).padStart(2, "0")).join("")}`;
    } catch (_) {
      return `tavern:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    }
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
      appendMessage("npc", `${resident().name}向你点头，示意你坐下聊聊今天的新闻。`);
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
    residentTitle.textContent = `${item.name} · ${item.role}`;
    residentCopy.textContent = item.intro;
    dialog.querySelectorAll("[data-tavern-resident]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.tavernResident === id);
    });
    renderThread();
  }

  function renderNews() {
    newsHost.replaceChildren(LG.goldenHorizonReports.newspaper(
      "酒馆墙上的【今日快讯】", currentReports?.week));
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
    busy = true;
    input.value = "";
    send.disabled = true;
    send.textContent = "交谈中…";
    appendMessage("player", text);
    const reply = appendMessage("npc pending", "正在听酒馆里的回声…");
    let content = "";
    let completed = false;
    try {
      for await (const chunk of window.dzmm.fn.invokeStream("dialogue", {
        kind: "tavern",
        sceneId: "golden-tavern",
        characterId: selected,
        userText: text,
        actionId: actionId(),
      }, { timeout: 60_000 })) {
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
    const slogan = P().node("p", "golden-tavern-slogan",
      "你并不孤独。所有职业者，都在共同改变这个世界。");
    newsHost = P().node("section", "golden-tavern-news");
    const residents = P().node("nav", "golden-tavern-residents");
    D().tavernResidents.forEach((item) => {
      const button = P().node("button", "", item.name);
      button.type = "button";
      button.dataset.tavernResident = item.id;
      button.addEventListener("click", () => setResident(item.id));
      residents.append(button);
    });
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
    dialog.append(heading, slogan, newsHost, residents,
      residentTitle, residentCopy, log, form);
    dialog.addEventListener("close", () => { viewGeneration += 1; });
    document.body.append(dialog);
    setResident(selected);
  }

  function open(reports) {
    currentReports = reports || currentReports;
    if (!dialog) build();
    send.disabled = busy; send.textContent = busy ? "交谈中…" : "发送";
    renderNews();
    if (!dialog.open) dialog.showModal();
  }

  function panel(reportState) {
    const section = P().node("section", "golden-panel golden-tavern-entry");
    const top = reportState.reports?.week?.professionRanking?.[0];
    section.append(P().node("span", "event-type", "居民AI对话"),
      P().node("h3", "", "金杯与远路酒馆"),
      P().node("p", "", top
        ? `酒馆里都在谈论本周活跃的${top.name}。去听听居民怎么说。`
        : "远征者与商旅正在交换今天的消息。"),
      P().node("p", "golden-tavern-note",
        "AI回复约需数秒；每次发送只请求一次，失败后由你决定是否重试。"));
    const button = P().node("button", "", "进入酒馆");
    button.type = "button";
    button.addEventListener("click", () => open(reportState.reports));
    section.append(button);
    return section;
  }

  LG.goldenHorizonTavern = { panel, open };
})(window.LifeGame);
