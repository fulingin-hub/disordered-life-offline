(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function actionButton(label, disabled, action) {
    const button = node("button", "", label);
    button.type = "button";
    button.disabled = disabled;
    button.addEventListener("click", action);
    return button;
  }
  function panel(active, shop, busy, mutate) {
    if (!shop || active.rankIndex !== 2) return null;
    const wrap = node("section", "faction-pilot-panel");
    wrap.append(node("span", "event-type", "六大势力二阶晋升"),
      node("h3", "", `${shop.factionName} · 构装机师计划`),
      node("p", "", "一阶职业代表个人顶级力量；二阶职业必须获得世界级势力培养、一级机师认证与重力体构装机甲。"),
      node("small", "", `对应一阶职业任务 ${shop.taskCompletions}/${shop.taskTarget} · ${
        shop.firstProfessionEquipped ? "已装备对应一阶职业" : "需装备对应一阶职业"}`));
    const grid = node("div", "faction-pilot-actions");
    const cert = shop.certification;
    grid.append(actionButton(cert.owned ? "一级机师认证 · 已获得"
      : `购买一级机师认证 · ${cert.cost.toLocaleString("zh-CN")}属性点`,
    busy || cert.owned || !cert.canBuy,
    () => mutate("buyPilotCertification", { characterId: active.id })));
    shop.mechs.forEach((mech) => {
      grid.append(actionButton(mech.owned ? `${mech.name} · 已获得`
        : `购买${mech.name} · ${mech.cost.toLocaleString("zh-CN")}属性点`,
      busy || mech.owned || !mech.canBuy,
      () => mutate("buyPilotMech", {
        characterId: active.id, mechType: mech.type,
      })));
    });
    wrap.append(grid);
    return wrap;
  }
  LG.factionPilotUI = { panel };
})(window.LifeGame);
