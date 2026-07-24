(function (LG) {
  let state = { phase: "idle", reports: null, error: "" };
  let requestId = 0;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function localNews() {
    const data = LG.goldenHorizon.data();
    const article = node("article", "phone-news-lead");
    article.append(node("span", "event-type", "黄金都城公告"),
      node("h3", "", data.cityUnlocked ? "七门通行状态正常" : "萨卢卡斯见证进行中"),
      node("p", "", data.cityUnlocked
        ? `商行点数 ${data.currency}，本周成功印记 ${data.clearedDays.length}/7。`
        : `入城见证 ${Math.min(7, Number(data.entryDays) || 0)}/7。`));
    return article;
  }

  function render(content, status) {
    const shell = node("section", "phone-news");
    shell.append(localNews());
    if (state.phase === "loading") {
      shell.append(node("p", "phone-news-state", "正在接收《黄金日报》…"));
    } else if (state.phase === "error") {
      const retry = node("button", "", "重新接收");
      retry.type = "button";
      retry.addEventListener("click", () => load(content, status));
      shell.append(node("p", "phone-news-state", state.error), retry);
    } else if (state.reports?.available) {
      const grid = node("div", "phone-news-grid");
      grid.append(
        LG.goldenHorizonReports.newspaper("【今日快讯】", state.reports.week),
        LG.goldenHorizonReports.newspaper("【本月纪事】", state.reports.month),
      );
      shell.append(grid);
    } else {
      const loadButton = node("button", "", "接收《黄金日报》");
      loadButton.type = "button";
      loadButton.addEventListener("click", () => load(content, status));
      shell.append(node("p", "phone-news-state", "尚未下载今日资讯。"),
        loadButton);
    }
    status.textContent = state.phase === "loading"
      ? "新闻资讯加载中" : "信息来源：黄金都城公告与《黄金日报》";
    content.replaceChildren(shell);
  }

  async function load(content, status) {
    if (state.phase === "loading") return;
    const activeRequest = ++requestId;
    state = { phase: "loading", reports: state.reports, error: "" };
    render(content, status);
    try {
      const result = await LG.authority.inspect("goldenCompetitionBoard");
      if (activeRequest !== requestId) return;
      state = { phase: "ready", reports: result.reports, error: "" };
    } catch (err) {
      if (activeRequest !== requestId) return;
      console.error("手机新闻读取失败:", err?.code, err?.message, err?.stack);
      state = {
        phase: "error",
        reports: null,
        error: err?.message || "新闻暂时无法接收。",
      };
    }
    render(content, status);
  }

  LG.phoneNewsUI = {
    open(content, status) {
      render(content, status);
      if (state.phase === "idle") void load(content, status);
    },
    cancel() {
      requestId += 1;
      if (state.phase === "loading") state.phase = "idle";
    },
  };
})(window.LifeGame);
