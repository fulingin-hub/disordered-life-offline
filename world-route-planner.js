(function (LG) {
  const costs = { airship: 10000, "sky-dragon": 500, "sky-dragon-fast": 1000 };

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function option(area, selected) {
    const item = node("option", "", area.name);
    item.value = area.id;
    item.selected = area.id === selected;
    return item;
  }

  function mount(container, settings) {
    let destination = settings.destination;
    let waypoints = [];
    let fastMode = false;
    const form = node("div", "world-route-planner");
    const destinationLabel = node("label", "world-route-field");
    destinationLabel.append(node("span", "", "最终下船地点"));
    const destinationSelect = node("select");
    destinationLabel.append(destinationSelect);
    const waypointRow = node("div", "world-route-waypoint-row");
    const waypointSelect = node("select");
    const addWaypoint = node("button", "quiet-button", "添加途经点");
    addWaypoint.type = "button";
    waypointRow.append(waypointSelect, addWaypoint);
    const stops = node("div", "world-route-stops");
    const mode = node("div", "world-route-modes");
    const normal = node("button", "active", "普通航行");
    const fast = node("button", "", "全速模式");
    normal.type = fast.type = "button";
    normal.setAttribute("aria-pressed", "true");
    fast.setAttribute("aria-pressed", "false");
    if (settings.transport === "sky-dragon") mode.append(normal, fast);
    const summary = node("p", "airship-fare");
    const status = node("p", "system-status");
    const actions = node("div", "airship-actions");
    const board = node("button", "", "确认航线并出发");
    const leave = node("button", "quiet-button", "离开");
    board.type = leave.type = "button";
    actions.append(board, leave);
    form.append(destinationLabel, node("span", "world-route-label", "自定义途经地点"),
      waypointRow, stops, mode, summary, status, actions);
    container.append(form);

    function availableAreas() {
      return LG.worldMapData.nodes.map(({ id }) => LG.worldMapData.area(id))
        .filter((area) => area && area.id !== settings.current);
    }

    function currentCost() {
      if (settings.transport === "airship") return costs.airship;
      return fastMode ? costs["sky-dragon-fast"] : costs["sky-dragon"];
    }

    function render() {
      destinationSelect.replaceChildren(...availableAreas()
        .map((area) => option(area, destination)));
      const blocked = new Set([settings.current, destination, ...waypoints]);
      const candidates = availableAreas().filter((area) => !blocked.has(area.id));
      waypointSelect.replaceChildren(...candidates.map((area) => option(area)));
      addWaypoint.disabled = !candidates.length;
      stops.replaceChildren(...waypoints.map((areaId, index) => {
        const chip = node("span", "world-route-stop");
        chip.append(node("b", "", `${index + 1}. ${LG.worldMapData.name(areaId)}`));
        const remove = node("button", "", "×");
        remove.type = "button";
        remove.title = `移除${LG.worldMapData.name(areaId)}`;
        remove.setAttribute("aria-label", remove.title);
        remove.addEventListener("click", () => {
          waypoints.splice(index, 1);
          render();
        });
        chip.append(remove);
        return chip;
      }));
      const route = LG.worldMapData.customRoute(
        settings.current, waypoints, destination);
      const duration = fastMode ? 5 : route.steps * 5;
      const cost = currentCost();
      const routeNames = [settings.current, ...waypoints, destination]
        .map(LG.worldMapData.name).join(" → ");
      summary.textContent = `${routeNames} · 预计航程${duration}秒 · 消耗${
        cost.toLocaleString("zh-CN")}属性点`;
      const enough = settings.points >= cost;
      status.textContent = enough
        ? "航线已就绪，出发后抵达前不能离开世界地图。"
        : `属性点不足，还需要${(cost - settings.points).toLocaleString("zh-CN")}点。`;
      board.disabled = !enough;
    }

    destinationSelect.addEventListener("change", () => {
      destination = destinationSelect.value;
      waypoints = waypoints.filter((id) => id !== destination);
      render();
    });
    addWaypoint.addEventListener("click", () => {
      if (!waypointSelect.value) return;
      waypoints.push(waypointSelect.value);
      render();
    });
    [normal, fast].forEach((button) => button.addEventListener("click", () => {
      fastMode = button === fast;
      normal.classList.toggle("active", !fastMode);
      fast.classList.toggle("active", fastMode);
      normal.setAttribute("aria-pressed", String(!fastMode));
      fast.setAttribute("aria-pressed", String(fastMode));
      render();
    }));
    board.addEventListener("click", async () => {
      board.disabled = true;
      leave.disabled = true;
      status.textContent = "正在登记航线并准备出发...";
      try {
        await settings.onStart({ areaId: destination, waypoints, fastMode });
      } catch (err) {
        status.textContent = err?.message || "暂时无法出发。";
        leave.disabled = false;
        render();
      }
    });
    leave.addEventListener("click", settings.onLeave);
    render();
  }

  LG.worldRoutePlanner = { mount };
})(window.LifeGame);
