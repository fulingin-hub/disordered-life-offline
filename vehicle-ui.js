(function (LG) {
  const el = {};
  let activeStore = "points";
  let busy = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function format(value) {
    return Math.max(0, Number(value) || 0).toLocaleString("zh-CN");
  }

  function itemCard(item) {
    const owned = LG.vehicleStore.owns(item.id);
    const equipped = LG.vehicleStore.equipped()?.id === item.id;
    const actual = LG.vehicleStore.price(item);
    const card = node("article", `vehicle-item${owned ? " owned" : ""}`);
    const image = node("img", `vehicle-art tone-${item.tone}`);
    image.src = LG.CONFIG.assets[item.asset];
    image.alt = item.name;
    image.loading = "lazy";
    image.decoding = "async";
    const body = node("div", "vehicle-item-body");
    const heading = node("div", "vehicle-item-heading");
    heading.append(
      node("span", "event-type", `${item.tier}档`),
      node("strong", "", item.name),
    );
    const price = node("p", "vehicle-price");
    price.textContent = owned ? "已获得"
      : item.rewardOnly ? "剧情奖励 · 不可购买"
      : actual === item.price ? `${format(actual)} ${LG.VEHICLE_DATA.stores[item.store].label}`
        : `${format(actual)} ${LG.VEHICLE_DATA.stores[item.store].label} · 原价 ${format(item.price)}`;
    const fee = !owned && !item.rewardOnly
      && LG.otherworldCharacters?.vehicleMarkup?.() > 1
      ? " 女销售额外手续费 +10% · 账单明细：技术指导。" : "";
    const note = node("p", "vehicle-note",
      `${item.note || "公会认证战斗伙伴，可在职业系统调整协同方式。"}${
        item.unlockText ? ` ${item.unlockText}` : ""}${fee}`);
    const button = node("button", "", equipped
      ? "当前战斗伙伴" : owned ? "管理战斗伙伴"
        : item.rewardOnly ? "等待解锁" : "签约");
    button.type = "button";
    button.disabled = busy || equipped || item.rewardOnly;
    button.addEventListener("click", () => owned ? openProfile() : buy(item));
    body.append(heading, price, note, button);
    card.append(image, body);
    return card;
  }

  function render() {
    if (!el.dialog) return;
    const balances = LG.vehicleStore.balances();
    const tier = LG.vehicleStore.tier();
    const next = LG.vehicleStore.nextTier();
    el.points.textContent = format(balances.points);
    el.achievement.textContent = format(balances.achievement);
    el.coupons.textContent = format(balances.coupons);
    el.personality.textContent = format(balances.personality);
    el.vip.textContent = tier ? `${tier.name} · ${tier.discount}%折扣` : "访客 · 无折扣";
    el.spent.textContent = format(LG.vehicleStore.spent());
    el.next.textContent = next
      ? `再消费 ${format(next.threshold - LG.vehicleStore.spent())} 升至${next.name}`
      : "已达到璀璨会员，永久享受40%折扣";
    const meta = LG.VEHICLE_DATA.stores[activeStore];
    el.copy.textContent = meta.copy;
    el.tabs.forEach((button) => {
      const selected = button.dataset.vehicleStore === activeStore;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    el.grid.replaceChildren(...LG.VEHICLE_DATA.items
      .filter((item) => item.store === activeStore).map(itemCard));
  }

  async function buy(item) {
    if (busy) return;
    busy = true;
    el.status.textContent = `正在确认${item.name}的伙伴契约…`;
    render();
    try {
      const result = await LG.authority.mutate("buyVehicle", { itemId: item.id });
      el.status.textContent = result.message;
      window.dzmm?.toast?.success?.(result.message);
      LG.protagonistPortrait.render(result.life);
      LG.vehicleProfileUI?.render?.();
      LG.roomsUI?.refresh?.();
    } catch (err) {
      console.error("伙伴签约失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "交易失败，请稍后重试。";
    } finally {
      busy = false;
      render();
    }
  }

  function openProfile() {
    if (el.dialog.open) el.dialog.close();
    LG.careerUI?.open?.("companions");
  }

  function roomCard(onEnter) {
    const access = LG.vehicleStore.access();
    const card = node("article", `room-card area-room-card vehicle-room-card${
      access.allowed ? " unlocked" : ""}`);
    const image = node("img");
    image.src = LG.CONFIG.assets.vehicleExpoHall;
    image.alt = "万界商会";
    image.loading = "lazy";
    image.decoding = "async";
    const body = node("div", "room-card-body");
    const button = node("button", "", access.allowed ? "进入万界商会" : "尚未达到解锁条件");
    button.type = "button";
    button.disabled = !access.allowed;
    button.addEventListener("click", onEnter);
    body.append(
      node("span", "event-type", access.allowed ? "神秘销金窟 · 已开放" : "任一资源超过1000点"),
      node("h3", "", "万界商会"),
      node("p", "", access.allowed
        ? `已签约 ${LG.vehicleStore.data().owned.length}/${LG.VEHICLE_DATA.items.length} 位伙伴`
        : `当前最高资源 ${format(access.best)} 点`),
      node("p", "room-entry-hook", "异界联盟人联合终产者们成立的神秘销金窟，签约战斗伙伴并管理同行方式。"),
      button,
    );
    card.append(image, body);
    return card;
  }

  LG.vehicleUI = {
    init() {
      [
        ["dialog", "vehicleDialog"], ["points", "vehiclePoints"],
        ["achievement", "vehicleAchievement"], ["coupons", "vehicleCoupons"],
        ["personality", "vehiclePersonality"], ["vip", "vehicleVip"],
        ["spent", "vehicleSpent"], ["next", "vehicleVipNext"],
        ["copy", "vehicleStoreCopy"], ["grid", "vehicleItems"],
        ["status", "vehicleStatus"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.tabs = [...document.querySelectorAll("[data-vehicle-store]")];
      el.tabs.forEach((button) => button.addEventListener("click", () => {
        activeStore = button.dataset.vehicleStore;
        render();
      }));
      document.getElementById("closeVehicleButton").addEventListener("click", () => this.close());
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        this.close();
      });
    },
    open(store = "points") {
      if (!LG.vehicleStore.access().allowed) return;
      activeStore = LG.VEHICLE_DATA.stores[store] ? store : "points";
      el.status.textContent = "VIP折扣按实际成交价自动结算，累计消费跨周目保留。";
      render();
      el.dialog.showModal();
    },
    close() {
      if (el.dialog.open) el.dialog.close();
      LG.audio.scene("story");
    },
    roomCard,
    render,
  };
})(window.LifeGame);
