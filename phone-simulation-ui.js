(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function metric(label, value) {
    const item = node("div", "phone-simulation-metric");
    item.append(node("span", "", label), node("strong", "", String(value)));
    return item;
  }

  function render(content, status) {
    const progress = LG.authority.lifeCinemaProgress();
    const simulation = progress.simulation || {};
    const maps = progress.simulationMaps || {};
    const life = LG.authority.state() || {};
    const active = simulation.active === true;
    const unlockedMaps = ["golden", "casino", "paradise", "penitentiary", "infernal"]
      .filter((id) => Number(maps[id]) >= Number(maps.target || 100)).length;
    const shell = node("section", "phone-simulation");
    const heading = node("div", "phone-simulation-heading");
    heading.append(
      node("span", "event-type", active ? "当前轮回" : "IF轮回档案"),
      node("h3", "", active ? "模拟人生进行中" : simulation.resumable
        ? "可继续上次模拟人生" : "开始新的模拟人生"),
      node("p", "", active
        ? `当前年龄 ${Math.max(0, Number(life.age) || 0)} 岁，进度已接入权威存档。`
        : "从人生电影院进入独立轮回，结算后可带回属性点与职业成长。"),
    );
    const metrics = node("div", "phone-simulation-metrics");
    metrics.append(
      metric("完成轮回", simulation.completions || 0),
      metric("待带回属性", simulation.points || 0),
      metric("累计带回", simulation.transferredPoints || 0),
      metric("IF地图", `${unlockedMaps}/5`),
    );
    const open = node("button", "phone-simulation-open",
      active ? "管理当前模拟人生" : "打开人生电影院");
    open.type = "button";
    open.addEventListener("click", () => {
      LG.phoneUI.close();
      document.getElementById("recoveryButton")?.click();
    });
    shell.append(heading, metrics, open);
    status.textContent = active
      ? "模拟人生正在进行，旁白、音乐与存档设置保持同步。"
      : "模拟人生由人生电影院统一管理。";
    content.replaceChildren(shell);
  }

  LG.phoneSimulationUI = { render };
})(window.LifeGame);
