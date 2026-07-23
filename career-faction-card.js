(function (LG) {
  function routePanel(factionId, node) {
    const data = LG.CAREER_PATH_DATA.forFaction(factionId);
    const panel = node("div", "faction-career-paths");
    panel.append(node("span", "faction-career-heading", "可提供职业与转职方向"));
    data.routes.forEach((route) => {
      const row = node("div", "faction-career-route");
      row.append(node("strong", "", route.base),
        node("span", "", "→"),
        node("b", "", route.next),
        node("small", "", route.mastery));
      panel.append(row);
    });
    if (data.hidden) panel.append(node("p", "faction-career-hidden", data.hidden));
    return panel;
  }

  LG.careerFactionCard = {
    create(item, joinedThisRun, options) {
      const { busy, node, onJoin } = options;
      const meta = LG.CAREER_DATA.factions[item.id];
      const selected = joinedThisRun === item.id;
      const card = node("article", `faction-card${item.joined ? " joined" : ""}${
        selected ? " selected" : ""}`);
      const requirement = item.id === "church"
        ? "加入条件：无偿开放。"
        : item.threshold > 0
          ? `加入条件：累计${item.threshold}${LG.CAREER_DATA.stats[item.stat]}。`
          : "加入条件：可怜天下父母心已免除。";
      card.append(node("span", "career-kicker", meta.location),
        node("strong", "", item.name), node("p", "", meta.copy),
        routePanel(item.id, node), node("small", "", requirement));
      const label = selected ? "本轮已选择"
        : item.joined ? "选择此阵营"
          : item.id === "church" ? "无偿加入教会" : "递交聘用证明";
      const button = node("button", "",
        window.OfflineI18n?.translate?.(label) || label);
      button.type = "button";
      button.disabled = busy || Boolean(joinedThisRun);
      button.addEventListener("click", () => onJoin(item.id));
      card.append(button);
      return card;
    },
  };
})(window.LifeGame);
