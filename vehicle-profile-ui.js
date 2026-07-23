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

  function applySprite(image, sprite) {
    image.classList.toggle("career-vehicle-sprite", Boolean(sprite));
    if (sprite) {
      image.style.setProperty("--sprite-columns", sprite.columns);
      image.style.setProperty("--sprite-rows", sprite.rows);
      image.style.setProperty("--sprite-column", sprite.column);
      image.style.setProperty("--sprite-row", sprite.row);
      return;
    }
    ["--sprite-columns", "--sprite-rows", "--sprite-column", "--sprite-row"]
      .forEach((name) => image.style.removeProperty(name));
  }

  function renderEffect(item, mode) {
    const effect = item?.effect;
    el.effect.dataset.active = String(Boolean(effect));
    el.effectState.textContent = !effect ? item ? "无特殊加成" : "未激活"
      : item.skipMobsOnRide && mode === "follow"
        ? "跟随支援·先锋效果不生效" : item.skipMobsOnRide
          ? "先锋协同·直面首领" : "已激活";
    el.effectTitle.textContent = effect?.title
      || (item ? "标准战斗伙伴" : "选择伙伴后显示当前协同加成");
    const bonuses = effect?.bonuses || [item
      ? "当前伙伴仅更换同行立绘，不提供特殊数值加成。"
      : "普通伙伴仅更换同行立绘，不提供特殊加成。"];
    el.effectBonuses.replaceChildren(...bonuses.map((text) => {
      const row = document.createElement("li");
      row.textContent = text;
      return row;
    }));
  }

  async function equip(itemId) {
    if (busy) return;
    busy = true;
    el.status.textContent = "正在登记战斗伙伴…";
    render();
    try {
      const result = await LG.authority.mutate("equipVehicle", {
        itemId: itemId || null,
      });
      el.status.textContent = result.message;
      LG.protagonistPortrait.render(result.life);
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("战斗伙伴切换失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "战斗伙伴切换失败，请重试。";
    } finally {
      busy = false;
      render();
    }
  }

  async function setMode(mode) {
    if (busy || mode === LG.vehicleStore.displayMode()) return;
    busy = true;
    el.status.textContent = "正在保存伙伴协同方式…";
    render();
    try {
      const result = await LG.authority.mutate("setVehicleDisplayMode", { mode });
      el.status.textContent = result.message;
      LG.protagonistPortrait.render(result.life);
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("伙伴协同方式切换失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "协同方式切换失败，请重试。";
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
    el.select.replaceChildren(option("", "不带战斗伙伴"),
      ...owned.map((item) => option(item.id,
        `${LG.VEHICLE_DATA.stores[item.store].label} · ${item.name}`)));
    el.select.value = equipped?.id || "";
    el.select.disabled = busy || !owned.length;
    el.current.textContent = equipped?.name || "未选择战斗伙伴";
    el.vip.textContent = LG.vehicleStore.tier()
      ? `${LG.vehicleStore.tier().name}会员 · ${LG.vehicleStore.discount()}%折扣`
      : "访客";
    const mode = LG.vehicleStore.displayMode();
    const kingEquipped = LG.career.data().equippedProfession
      === "second-king-of-kings";
    el.ride.setAttribute("aria-pressed", String(mode === "ride"));
    el.follow.setAttribute("aria-pressed", String(mode === "follow"));
    el.ride.disabled = busy || !equipped || equipped.followOnly || kingEquipped;
    el.follow.disabled = busy || !equipped;
    el.ride.title = equipped?.followOnly
      ? "该伙伴只能跟随支援"
      : kingEquipped ? "万王之王只能让伙伴跟随支援" : "切换为先锋协同";
    el.stage.dataset.mode = mode;
    renderEffect(equipped, mode);
    LG.vehicleAchievementCG?.render?.(el.achievementCgs, state.gender);
    if (!equipped) {
      el.rider.removeAttribute("src");
      el.mount.removeAttribute("src");
      el.riderWrap.hidden = true;
      el.mountWrap.hidden = true;
      el.empty.hidden = false;
      return;
    }
    const gender = state.gender === "female" ? "female" : "male";
    const resolved = LG.vehicleCareerPortraits.resolve(equipped, gender, mode);
    el.stage.dataset.combination = resolved.match;
    el.riderWrap.classList.toggle(
      "vehicle-profile-composite", mode === "ride");
    if (mode === "ride") {
      el.rider.src = resolved.primarySrc;
      el.rider.alt = `${gender === "female" ? "女" : "男"}主角·${resolved.label}`;
      el.rider.className = `vehicle-profile-mounted${
        resolved.applyTone ? ` tone-${equipped.tone}` : " career-vehicle-composite"}`;
      applySprite(el.rider, resolved.sprite);
      el.riderCaption.textContent = ["exact", "career-database"].includes(resolved.match)
        ? "先锋协同·职业专属立绘" : "先锋协同·伙伴立绘";
      el.mount.removeAttribute("src");
      el.mountWrap.hidden = true;
      el.riderWrap.hidden = false;
      el.empty.hidden = true;
      return;
    }
    el.rider.src = resolved.primarySrc;
    el.rider.alt = `${gender === "female" ? "女" : "男"}主角·${
      resolved.career?.name || LG.VEHICLE_DATA.stores[equipped.store].outfit}`;
    el.rider.className = resolved.career
      ? "career-main-portrait"
      : "";
    applySprite(el.rider, null);
    el.riderCaption.textContent =
      `跟随支援·${resolved.career ? "职业" : "角色"}立绘`;
    el.mount.src = resolved.mountSrc;
    el.mount.alt = equipped.name;
    el.mount.className = `vehicle-profile-mount tone-${equipped.tone}`;
    el.mountCaption.textContent = "跟随支援·伙伴立绘";
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
        ["effectBonuses", "vehicleEffectBonuses"], ["stage", "vehicleProfileStage"],
        ["ride", "vehicleRideModeButton"], ["follow", "vehicleFollowModeButton"],
        ["riderCaption", "vehicleRiderCaption"], ["mountCaption", "vehicleMountCaption"],
        ["achievementCgs", "vehicleAchievementCgList"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.select.addEventListener("change", () => equip(el.select.value));
      el.ride.addEventListener("click", () => setMode("ride"));
      el.follow.addEventListener("click", () => setMode("follow"));
      document.getElementById("openVehicleHallButton").addEventListener("click", () => {
        LG.careerUI?.close?.();
        LG.vehicleUI.open();
      });
      render();
    },
    render,
  };
})(window.LifeGame);
