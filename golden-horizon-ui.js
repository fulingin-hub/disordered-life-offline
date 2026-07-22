(function (LG) {
  let dialog, content, status, button;
  let busy = false;
  let guide = "si";
  let socialRequest = 0;
  let reportRequest = 0;
  let reportTimer = 0;
  let online = { state: "idle", board: null, error: "" };
  let reports = { state: "idle", reports: null, error: "" };
  const P = () => LG.goldenHorizonPanels;
  const E = () => LG.goldenHorizonExtraPanels;
  const R = () => LG.goldenHorizonReports;
  const T = () => LG.goldenHorizonTavern;

  async function loadSocial() {
    if (online.state === "loading") return;
    const requestId = ++socialRequest;
    online = { state: "loading", board: online.board, error: "" };
    render();
    try {
      const result = await LG.authority.inspect("goldenSocialBoard");
      if (requestId !== socialRequest) return;
      online = { state: "ready", board: result.board, error: "" };
    } catch (err) {
      if (requestId !== socialRequest) return;
      console.error("黄金都城传闻板读取失败:",
        err?.code, err?.message, err?.stack);
      online = {
        state: "error", board: null,
        error: err?.message || "今日传闻暂时无法读取。",
      };
    }
    render();
  }

  async function act(method, body) {
    if (busy) return;
    busy = true; render("正在提交黄金都城账本…");
    try {
      const result = await LG.authority.mutate(method, body);
      if (method === "goldenSocialVote") {
        const board = result.economy?.goldenHorizon?.social?.board;
        if (board) online = { state: "ready", board, error: "" };
      }
      render(result.message);
      LG.traitsUI?.refresh?.();
      LG.dailyTasksUI?.refresh?.();
    } catch (err) {
      console.error("黄金地平线结算失败:",
        err?.code, err?.message, err?.stack);
      if (method === "goldenSocialVote") {
        online = {
          state: "error", board: online.board,
          error: err?.message || "传闻板提交失败，请明确重试。",
        };
      }
      render(err?.message || "黄金都城账本暂时无法回应。");
    } finally {
      busy = false; render(status?.textContent);
    }
  }
  async function loadReports() {
    if (reports.state === "loading") return;
    const requestId = ++reportRequest;
    reports = { state: "loading", reports: reports.reports, error: "" };
    render();
    try {
      const result = await LG.authority.inspect("goldenCompetitionBoard");
      if (requestId !== reportRequest) return;
      reports = { state: "ready", reports: result.reports, error: "" };
    } catch (err) {
      if (requestId !== reportRequest) return;
      console.error("黄金都城前线战报读取失败:",
        err?.code, err?.message, err?.stack);
      reports = {
        state: "error", reports: null,
        error: err?.message || "前线战报暂时无法读取。",
      };
    }
    render();
  }
  function scheduleReports() {
    window.clearTimeout(reportTimer);
    if (!dialog?.open) return;
    reportTimer = window.setTimeout(async () => {
      await loadReports();
      scheduleReports();
    }, 30_000);
  }
  function hero(data) {
    const section = P().node("section", "golden-hero");
    const image = P().node("img");
    image.src = LG.CONFIG.assets.goldenHorizonCapital;
    image.alt = "黄金都城贸易中心";
    const copy = P().node("div");
    copy.append(P().node("span", "event-type", "新版本 · 金色的地平线"),
      P().node("h2", "", "黄金都城"),
      P().node("p", "", "在神秘圣徒带领下，七魔王与无尽深渊的战火平息。两个世界都相信对面是遍地黄金的天国，由异世界国王、领主与六大机构共同建立的贸易中心由此诞生。"),
      P().node("strong", "", `商行点数 ${data.currency} · 馈赠 ${data.gifts}`));
    section.append(image, copy); return section;
  }
  function render(message) {
    const data = LG.goldenHorizon.data();
    if (online.board?.date && online.board.date !== data.today.date) {
      online = { state: "idle", board: null, error: "" };
    }
    if (button) button.textContent = data.today.success ? "金色地平线·已通行"
      : data.today.attempted ? "金色地平线·今日失败" : "金色地平线";
    if (!content) return;
    if (message !== undefined && status) status.textContent = message || "";
    content.replaceChildren(
      hero(data),
      P().companions(data, guide, (id) => { guide = id; render(); }, busy),
      P().weekly(data),
      P().trial(data, guide, act, busy),
      P().arenas(data, act, busy),
      E().mischief(data, act, busy),
      E().social(data, online,
        (choice) => act("goldenSocialVote", { choice }), loadSocial, busy),
      R().panel(reports, loadReports, busy),
      T().panel(reports),
      E().professions(data, act, busy),
      P().inventory(data, act, busy),
      P().exchange(data, act, busy),
      P().hidden(data, act, busy),
    );
  }
  function build() {
    dialog = P().node("dialog", "golden-horizon-dialog");
    const header = P().node("header", "golden-dialog-heading");
    const title = P().node("div");
    title.append(P().node("span", "event-type", "两界和平贸易中心"),
      P().node("h2", "", "金色的地平线"));
    const close = P().node("button", "quiet-button", "关闭");
    close.type = "button"; close.addEventListener("click", () => dialog.close());
    header.append(title, close);
    status = P().node("p", "system-status golden-status");
    status.setAttribute("role", "status");
    content = P().node("main", "golden-scroll");
    dialog.append(header, status, content);
    dialog.addEventListener("close", () => {
      window.clearTimeout(reportTimer);
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault(); dialog.close();
    });
    document.body.append(dialog);
  }
  function open() {
    if (!dialog) build();
    render();
    if (!dialog.open) dialog.showModal();
    if (online.state === "idle") void loadSocial();
    if (reports.state === "idle") void loadReports();
    scheduleReports();
  }
  function roomCard() {
    const data = LG.goldenHorizon.data();
    const card = P().node("article", "room-card area-room-card golden-room-card unlocked");
    const image = P().node("img"); image.src = LG.CONFIG.assets.goldenHorizonCapital;
    image.alt = "黄金都城"; image.loading = "lazy";
    const body = P().node("div", "room-card-body");
    body.append(P().node("span", "event-type", "无入场要求"),
      P().node("h3", "", "黄金都城"),
      P().node("p", "", `萨卢卡斯印记 ${data.clearedDays.length}/7 · 商行点数 ${data.currency}`));
    const enter = P().node("button", "", "进入金色的地平线");
    enter.type = "button"; enter.addEventListener("click", open);
    body.append(enter); card.append(image, body); return card;
  }
  LG.goldenHorizonUI = {
    init() {
      button = document.getElementById("goldenHorizonButton");
      button.addEventListener("click", open);
      this.refresh();
    },
    open, roomCard, render,
    refresh() { if (button) render(); },
  };
})(window.LifeGame);
