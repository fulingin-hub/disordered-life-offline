(function (LG) {
  let busy = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  async function teleport(areaId) {
    if (busy) return;
    const current = LG.authority.snapshot()?.worldTravel?.currentArea;
    if (current === areaId) return LG.roomLobbyUI.openArea(areaId);
    busy = true;
    LG.worldMapUI.setMessage("正在传送...");
    try {
      await LG.authority.mutate("teleportWorldArea", { areaId });
      LG.roomLobbyUI.openArea(areaId);
    } catch (err) {
      console.error("世界传送失败:", err?.code, err?.message, err?.stack);
      LG.worldMapUI.setMessage(err?.message || "传送失败，请稍后重试。");
    } finally {
      busy = false;
    }
  }

  function boardingPage(areaId) {
    const context = LG.worldMapUI.context();
    if (!context) return;
    const { elements } = context;
    const destination = LG.worldMapData.name(areaId);
    const travel = LG.authority.snapshot()?.worldTravel || { currentArea: "xia" };
    const skyDragon = LG.vehicleStore.equipped()?.id
      === "champion-salukas-sky-dragon";
    const transport = skyDragon ? "sky-dragon" : "airship";
    const points = LG.traits.points();
    elements.title.textContent = "界航式跨域飞艇";
    elements.intro.textContent =
      "民间俗称“界舟”，由黄金都城主导制造，是六大势力共同使用的跨区域公共交通工具。";
    const page = node("section", "airship-page");
    const visual = node("div", `airship-visual${
      skyDragon ? " sky-dragon-visual" : ""}`);
    const image = node("img");
    image.src = skyDragon
      ? LG.CONFIG.assets.vehicleSalukasSkyDragon
      : LG.CONFIG.assets.worldAirshipBoarding;
    image.alt = skyDragon ? "萨卢卡斯的天空龙" : "界航式跨域飞艇界舟";
    const badge = node("span", "airship-badge", skyDragon
      ? "冠军载具 · 萨卢卡斯的天空龙"
      : "界航式跨域飞艇 · 界舟");
    visual.append(image, badge);
    const copy = node("div", "airship-copy");
    copy.append(
      node("span", "event-type", "黄金都城公共航线"),
      node("h3", "", `规划前往${destination}的航线`),
      node("p", "", skyDragon
        ? "萨卢卡斯的天空龙将随行。普通飞行沿航线移动；全速模式消耗1,000属性点，并在5秒内抵达。"
        : "界舟沿地图节点之间的既定航线移动，可按顺序添加途经地点并另选最终下船地点。"),
    );
    LG.worldRoutePlanner.mount(copy, {
      current: travel.currentArea,
      destination: areaId,
      transport,
      points,
      async onStart(route) {
        if (busy) return;
        busy = true;
        try {
          await LG.authority.mutate("startWorldTravel", route);
          LG.roomLobbyUI.renderWorld();
        } catch (err) {
          console.error("世界旅途出发失败:",
            err?.code, err?.message, err?.stack);
          throw err;
        } finally {
          busy = false;
        }
      },
      onLeave() { LG.roomLobbyUI.renderWorld(); },
    });
    page.append(visual, copy);
    elements.cards.replaceChildren(page);
    elements.cards.scrollTop = 0;
    requestAnimationFrame(() => { elements.cards.scrollTop = 0; });
  }

  LG.worldMapActions = { teleport, boardingPage };
})(window.LifeGame);
