(function (LG) {
  const el = {};
  let providers;
  let busy = false;

  function option(value, text) {
    const item = document.createElement("option");
    item.value = value;
    item.textContent = text;
    return item;
  }

  function renderEffect(item) {
    const effect = item?.effect;
    el.effect.dataset.active = String(Boolean(effect));
    el.effectState.textContent = effect ? "已激活" : item ? "无特殊加成" : "未激活";
    el.effectTitle.textContent = effect?.title
      || (item ? "标准乘骑" : "选择载具后显示当前乘骑加成");
    const bonuses = effect?.bonuses || [item
      ? "当前载具仅更换乘骑立绘，不提供特殊数值加成。"
      : "普通载具仅更换乘骑立绘，不提供特殊加成。"];
    el.effectBonuses.replaceChildren(...bonuses.map((text) => {
      const row = document.createElement("li");
      row.textContent = text;
      return row;
    }));
  }

  async function equip(itemId) {
    if (busy) return;
    busy = true;
    el.status.textContent = "正在保存乘骑选择…";
    render();
    try {
      const result = await LG.authority.mutate("equipVehicle", {
        itemId: itemId || null,
      });
      el.status.textContent = result.message;
      LG.protagonistPortrait.render(result.life);
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("载具切换失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "载具切换失败，请重试。";
    } finally {
      busy = false;
      render();
    }
  }

  function render() {
    if (!providers || !el.select) return;
    const state = providers.getState();
    const equipped = LG.vehicleStore.equipped();
    const owned = LG.vehicleStore.data().owned
      .map((id) => LG.VEHICLE_DATA.byId[id]).filter(Boolean);
    el.select.replaceChildren(option("", "不乘骑"),
      ...owned.map((item) => option(item.id,
        `${LG.VEHICLE_DATA.stores[item.store].label} · ${item.name}`)));
    el.select.value = equipped?.id || "";
    el.select.disabled = busy || !owned.length;
    el.current.textContent = equipped?.name || "未选择载具";
    el.vip.textContent = LG.vehicleStore.tier()
      ? `${LG.vehicleStore.tier().name}会员 · ${LG.vehicleStore.discount()}%折扣`
      : "访客";
    renderEffect(equipped);
    if (!equipped) {
      el.rider.removeAttribute("src");
      el.mount.removeAttribute("src");
      el.riderWrap.hidden = true;
      el.mountWrap.hidden = true;
      el.empty.hidden = false;
      return;
    }
    const gender = state.gender === "female" ? "female" : "male";
    el.rider.src = LG.vehicleStore.riderAsset(equipped.store, gender);
    el.rider.alt = `${gender === "female" ? "女" : "男"}主角·${
      LG.VEHICLE_DATA.stores[equipped.store].outfit}`;
    el.mount.src = LG.CONFIG.assets[equipped.asset];
    el.mount.alt = equipped.name;
    el.mount.className = `vehicle-profile-mount tone-${equipped.tone}`;
    el.riderWrap.hidden = false;
    el.mountWrap.hidden = false;
    el.empty.hidden = true;
  }

  LG.vehicleProfileUI = {
    init(nextProviders) {
      providers = nextProviders;
      [
        ["select", "vehicleSelect"], ["current", "vehicleCurrent"],
        ["vip", "vehicleProfileVip"], ["status", "vehicleProfileStatus"],
        ["rider", "vehicleRiderArt"], ["mount", "vehicleMountArt"],
        ["riderWrap", "vehicleRiderFigure"], ["mountWrap", "vehicleMountFigure"],
        ["empty", "vehicleProfileEmpty"], ["effect", "vehicleEffect"],
        ["effectState", "vehicleEffectState"], ["effectTitle", "vehicleEffectTitle"],
        ["effectBonuses", "vehicleEffectBonuses"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.select.addEventListener("change", () => equip(el.select.value));
      document.getElementById("openVehicleHallButton").addEventListener("click", () => {
        LG.traitsUI.close();
        LG.vehicleUI.open();
      });
      render();
    },
    render,
  };
})(window.LifeGame);
