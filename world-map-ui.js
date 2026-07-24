(function (LG) {
  let current = null, selected = null, timer = 0, serverOffset = 0, serverStamp = "";
  let confirming = false, confirmFailed = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className; if (text !== undefined) item.textContent = text; return item;
  }
  const now = () => Date.now() + serverOffset;
  const travel = () => LG.authority.snapshot()?.worldTravel
    || { currentArea: "xia", visited: ["xia"], trip: null };
  function updateClock(snapshot) {
    const stamp = snapshot?.serverTime || "", parsed = Date.parse(stamp);
    if (!stamp || stamp === serverStamp) return;
    if (Number.isFinite(parsed)) serverOffset = parsed - Date.now(); serverStamp = stamp;
  }
  function routeLine([fromId, toId], visited) {
    const from = LG.worldMapData.byId[fromId], to = LG.worldMapData.byId[toId];
    const line = node("span", `world-route${
      visited.has(fromId) && visited.has(toId) ? " explored" : ""}`);
    const dx = to.x - from.x, dy = to.y - from.y;
    line.style.left = `${from.x}%`; line.style.top = `${from.y}%`;
    line.style.width = `${Math.hypot(dx, dy)}%`;
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    return line;
  }
  function areaNode(meta, state, visited) {
    const area = LG.worldMapData.area(meta.id);
    const explored = visited.has(meta.id);
    const button = node("button", `world-node${explored ? " visited" : " unknown"}${
      state.currentArea === meta.id ? " current" : ""}${
      selected === meta.id ? " selected" : ""}`);
    button.type = "button";
    button.disabled = Boolean(state.trip);
    button.style.left = `${meta.x}%`; button.style.top = `${meta.y}%`;
    button.setAttribute("aria-label", `${area.name}，${explored ? "已探索" : "尚未探索"}`);
    if (explored) {
      button.append(node("i", "world-node-beacon"), node("span", "", area.name));
    } else {
      button.append(node("i", "world-node-beacon"), node("span", "", "未知航点"));
    }
    button.addEventListener("click", () => {
      if (state.trip) return;
      selected = meta.id; render(current);
    });
    return button;
  }
  function transportToken(state) {
    const position = state.trip
      ? LG.worldMapData.position(state.trip, now())
      : LG.worldMapData.byId[state.currentArea];
    const token = node("div", `world-party${
      state.trip ? ` traveling ${state.trip.transport}` : ""}`);
    token.style.left = `${position.x}%`; token.style.top = `${position.y}%`;
    if (state.trip?.transport === "airship") {
      const airship = node("span", "world-airship");
      airship.setAttribute("role", "img"); airship.setAttribute("aria-label", "界航式跨域飞艇");
      token.append(airship);
    } else if (state.trip?.transport === "sky-dragon") {
      const image = node("img", "world-sky-dragon");
      image.src = LG.CONFIG.assets.vehicleSalukasSkyDragon;
      image.alt = "萨卢卡斯的天空龙";
      token.append(image);
    } else {
      const marker = node("span", "world-current-marker");
      marker.setAttribute("role", "img");
      marker.setAttribute("aria-label", "当前位置");
      token.append(marker);
    }
    return token;
  }
  function idlePanel(state, visited) {
    if (!selected) {
      const prompt = node("aside", "world-map-panel world-map-prompt");
      prompt.append(node("span", "event-type", "世界航线"),
        node("h3", "", "选择地区"),
        node("p", "", "点击地图航点后显示地区场景与行动。"));
      return prompt;
    }
    const areaId = selected;
    const area = LG.worldMapData.area(areaId);
    const panel = node("aside", "world-map-panel");
    const scene = node("img", "world-area-scene");
    scene.src = LG.CONFIG.assets[area.image];
    scene.alt = `${area.name}地区场景`;
    panel.append(
      scene,
      node("span", "event-type", visited.has(areaId) ? "已探索区域" : "薄雾笼罩"),
      node("h3", "", area.name),
      node("p", "", area.description),
    );
    const actions = node("div", "world-map-actions"), teleport =
      node("button", "", state.currentArea === areaId
      ? "进入区域地图" : state.teleportAccess?.unlocked ? "传送"
        : "传送·轮回50次解锁");
    const journey = node("button", "quiet-button", "旅途");
    teleport.type = journey.type = "button";
    journey.disabled = state.currentArea === areaId; teleport.disabled =
      state.currentArea !== areaId && !state.teleportAccess?.unlocked;
    teleport.addEventListener("click", () => LG.worldMapActions.teleport(areaId));
    journey.addEventListener("click", () =>
      LG.worldMapActions.boardingPage(areaId));
    actions.append(teleport, journey); panel.append(actions);
    if (!state.teleportAccess?.unlocked) panel.append(node(
      "p", "world-teleport-lock", `地图传送：人生重开 ${
        state.teleportAccess?.count || 0}/${state.teleportAccess?.required || 50} 次`));
    return panel;
  }
  function travelPanel(state) {
    const remaining = Math.max(0, state.trip.arrivesAt - now());
    const panel = node("aside", "world-map-panel travel-panel"); panel.append(
      node("span", "event-type", state.trip.transport === "sky-dragon"
        ? state.trip.fastMode ? "天空龙全速飞行中" : "天空龙航行中"
        : "界舟航行中"),
      node("h3", "", `${LG.worldMapData.name(state.trip.from)} → ${
        LG.worldMapData.name(state.trip.to)}`),
      node("p", "world-travel-time", remaining
        ? `预计剩余 ${Math.ceil(remaining / 1000)}秒`
        : confirmFailed ? "抵达确认失败，请手动重试。"
          : "正在确认抵达..."),
    );
    const phone = node("button", "", "打开手机"); phone.type = "button";
    phone.addEventListener("click", () => LG.phoneUI.open()); panel.append(phone);
    if (!remaining && confirmFailed) {
      const retry = node("button", "quiet-button", "确认抵达"); retry.type = "button";
      retry.addEventListener("click", confirmArrival);
      panel.append(retry);
    }
    return panel;
  }
  async function confirmArrival() {
    if (confirming) return;
    confirming = true; confirmFailed = false;
    try { await LG.authority.sync(); }
    catch (err) {
      console.error("世界旅途抵达同步失败:", err?.code, err?.message, err?.stack);
      confirmFailed = true; render(current);
    } finally { confirming = false; }
  }
  function schedule(state) {
    window.clearTimeout(timer);
    if (!state.trip) return;
    const remaining = state.trip.arrivesAt - now();
    if (remaining <= 0) {
      if (!confirmFailed) confirmArrival();
      return;
    }
    timer = window.setTimeout(() => render(current), Math.min(500, remaining + 20));
  }
  function render(options) {
    if (!options) return; current = options; const state = travel(),
      visited = new Set(state.visited);
    const visibleNodes = LG.worldMapData.visibleNodes(); selected = selected
      && visibleNodes.some((item) => item.id === selected) ? selected : null;
    options.elements.title.textContent = "世界地图";
    options.elements.intro.textContent = state.trip ? "旅途中不能离开世界地图，也不能开始七层地狱或无尽深渊挑战。"
      : "点击地区选择传送或旅途；未探索地区会保持低饱和与薄雾。";
    const map = node("section", "world-map-board"); map.style.backgroundImage =
      `url("${LG.CONFIG.assets.worldMapBackground}")`;
    const reveals = node("div", "world-reveals");
    visibleNodes.filter((meta) => visited.has(meta.id)).forEach((meta) => {
      const reveal = node("span", "world-reveal");
      reveal.style.backgroundImage = map.style.backgroundImage; reveal.style.clipPath =
        `circle(${meta.id === state.currentArea ? 17 : 13}% at ${meta.x}% ${meta.y}%)`;
      reveals.append(reveal);
    });
    const routes = node("div", "world-routes"); routes.append(...LG.worldMapData
      .visibleEdges().map((edge) => routeLine(edge, visited))); const nodes = node("div", "world-nodes");
    nodes.append(...visibleNodes.map((meta) =>
      areaNode(meta, state, visited)), transportToken(state));
    map.append(reveals, routes, nodes);
    const shell = node("section", "world-map-shell"); shell.append(
      map, state.trip ? travelPanel(state) : idlePanel(state, visited));
    const children = [shell];
    if (!state.trip && options.extras?.length) {
      children.push(node("h3", "world-facilities-title", "世界设施"), ...options.extras);
    }
    options.elements.cards.replaceChildren(...children);
    schedule(state);
  }
  LG.worldMapUI = {
    render, resetSelection() { selected = null; },
    context() { return current; },
    isTraveling() { return Boolean(travel().trip); },
    lockNotice() {
      if (current) current.elements.intro.textContent =
        "航程结束前不能退出世界地图；你仍可打开手机与已解锁角色对话。";
      window.dzmm?.toast?.warning?.("旅途中不能退出世界地图");
    },
    setMessage(text) {
      if (current) current.elements.intro.textContent = text;
    },
  };
  LG.authority.subscribe((snapshot) => { updateClock(snapshot);
    if (!snapshot.worldTravel?.trip) { confirmFailed = false; confirming = false; }
    const lobby = document.getElementById("roomsLobby"),
      dialog = document.getElementById("roomsDialog");
    if (snapshot.worldTravel?.trip && dialog && !dialog.open) LG.roomsUI?.open?.();
    else if (dialog?.open && lobby && !lobby.hidden && current) render(current);
  });
})(window.LifeGame);
