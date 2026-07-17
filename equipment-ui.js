(function (LG) {
  const el = {};
  let providers;
  let saving = false;
  let activePage = "traits";
  let lastRunId = null;

  function option(value, text, disabled = false) {
    const item = document.createElement("option");
    item.value = value;
    item.textContent = text;
    item.disabled = disabled;
    return item;
  }

  async function changeEquipment(slot, itemId) {
    if (saving) return;
    saving = true;
    el.status.textContent = "正在保存装备…";
    render();
    try {
      const result = await LG.authority.mutate("equipItem", { slot, itemId });
      el.status.textContent = result.message;
      if (result.life.endingId) LG.ui.render(result.life);
    } catch (err) {
      console.error("装备保存失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "装备保存失败，请重试。";
    } finally {
      saving = false;
      render();
    }
  }

  function slotCard(slot, state) {
    const card = document.createElement("article");
    card.className = "equipment-slot";
    const heading = document.createElement("div");
    heading.className = "equipment-slot-heading";
    const label = document.createElement("strong");
    label.textContent = slot.label;
    const value = document.createElement("span");
    const selected = LG.equipment.item(state.equipment[slot.id]);
    value.textContent = selected ? "+20羞耻" : "未装备";
    heading.append(label, value);
    const select = document.createElement("select");
    select.disabled = saving;
    select.setAttribute("aria-label", `${slot.label}装备`);
    select.append(option("", "不装备"));
    LG.equipment.items(slot.id, state).forEach((item) => {
      const locked = !LG.equipment.canEquip(state, item);
      select.append(option(item.id, `${item.name}${locked ? "（18岁解锁）" : ""}`, locked));
    });
    select.value = state.equipment[slot.id] || "";
    select.addEventListener("change", () => changeEquipment(slot.id, select.value));
    card.append(heading, select);
    return card;
  }

  function render() {
    if (!providers || !el.slots) return;
    const state = providers.getState();
    if (lastRunId !== state.runId) {
      lastRunId = state.runId;
      el.status.textContent = "";
    }
    const current = LG.equipment.summary(state);
    el.shame.textContent = String(current.total);
    el.reduction.textContent = `${current.reduction}点`;
    el.set.textContent = current.set ? `${current.set.prefix}套装 +100` : "未激活";
    el.slots.replaceChildren(...LG.EQUIPMENT_SLOTS.map((slot) => slotCard(slot, state)));
  }

  function show(page) {
    activePage = page === "equipment" ? "equipment" : "traits";
    el.traitsPage.hidden = activePage !== "traits";
    el.equipmentPage.hidden = activePage !== "equipment";
    el.tabs.forEach((button) => {
      const selected = button.dataset.traitsPage === activePage;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    if (activePage === "equipment") render();
  }

  LG.equipmentUI = {
    init(nextProviders) {
      providers = nextProviders;
      el.traitsPage = document.getElementById("traitsPage");
      el.equipmentPage = document.getElementById("equipmentPage");
      el.shame = document.getElementById("equipmentShame");
      el.reduction = document.getElementById("equipmentReduction");
      el.set = document.getElementById("equipmentSet");
      el.status = document.getElementById("equipmentStatus");
      el.slots = document.getElementById("equipmentSlots");
      el.tabs = [...document.querySelectorAll("[data-traits-page]")];
      el.tabs.forEach((button) => button.addEventListener("click", () =>
        show(button.dataset.traitsPage)));
      show("traits");
    },
    show,
    refresh: render,
    activePage() {
      return activePage;
    },
  };
})(window.LifeGame);
