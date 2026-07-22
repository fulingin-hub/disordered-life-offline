(function (LG) {
  function node(tag, cls, text) {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function explorations(board) {
    return Object.values(board?.professionCounts || {})
      .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  }

  function frontline(board) {
    if (board?.frontlineWinner === "holy-light") {
      return "圣光教团已在东部要塞方向取得优势。";
    }
    if (board?.frontlineWinner === "infernal-church") {
      return "魔纹教会正在东部要塞方向扩大活动。";
    }
    return "圣光教团与魔纹教会仍在东部要塞一线僵持。";
  }

  function newspaper(title, board) {
    const article = node("article", "golden-newspaper");
    article.append(node("span", "golden-newspaper-date", board?.period || ""),
      node("h4", "", title));
    if (!board) {
      article.append(node("p", "golden-report-empty", "送报员尚未带回可靠消息。"));
      return article;
    }
    const top = board.professionRanking?.[0];
    const total = explorations(board);
    const list = node("div", "golden-news-copy");
    list.append(node("p", "", frontline(board)));
    list.append(node("p", "", top
      ? `本期最活跃职业：${top.name}。`
      : "本期最活跃职业尚未产生。"));
    list.append(node("p", "", total
      ? `职业者已累计探索深渊 ${total.toLocaleString()} 次。`
      : "深渊远征队仍在等待第一份归来记录。"));
    if ((board.frontline?.["infernal-church"] || 0) > 0) {
      list.append(node("p", "",
        "魔纹教会疑似出现新的七欲祭司，城防厅尚未证实传闻。"));
    }
    const quote = node("blockquote", "", top
      ? `“最近${top.name}可真不少。”——黄金都城酒馆老板`
      : "“报纸空着，不代表世界没有动静。”——黄金都城酒馆老板");
    article.append(list, quote);
    return article;
  }

  function panel(state, reload, busy) {
    const section = node("section", "golden-panel golden-reports");
    section.append(node("span", "event-type", "DZMM在线互动"),
      node("h3", "", "《黄金日报》"),
      node("p", "golden-world-slogan",
        "你并不孤独。虽然每个人都在独自冒险，但所有职业者，都在共同改变这个世界。"));
    if (state.state === "loading") {
      section.append(node("p", "golden-social-state", "正在等待今日报纸送达…"));
      return section;
    }
    if (state.state === "error") {
      const button = node("button", "", "重新联系送报员");
      button.type = "button";
      button.disabled = busy;
      button.addEventListener("click", reload);
      section.append(node("p", "golden-social-state", state.error), button);
      return section;
    }
    const reports = state.reports;
    if (!reports?.available) {
      const button = node("button", "", "读取今日《黄金日报》");
      button.type = "button";
      button.disabled = busy;
      button.addEventListener("click", reload);
      section.append(button);
      return section;
    }
    const grid = node("div", "golden-report-grid");
    grid.append(newspaper("【今日快讯】", reports.week),
      newspaper("【本月纪事】", reports.month));
    const archived = node("details", "golden-report-archive");
    archived.append(node("summary", "", "翻阅往期报纸"),
      newspaper("【上周终刊】", reports.lastWeek),
      newspaper("【上月合订本】", reports.lastMonth));
    section.append(grid, archived);
    return section;
  }

  LG.goldenHorizonReports = { panel, newspaper };
})(window.LifeGame);
