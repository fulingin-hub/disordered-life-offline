(function (LG) {
  const el = {};
  let draft = {};
  let saving = false;

  function draftTotal() {
    return Object.values(draft).reduce((sum, value) => sum + value, 0);
  }

  function button(text, className) {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  function adjust(id, amount) {
    const trait = LG.traits.all().find((item) => item.id === id);
    if (!trait.available) return;
    const next = Math.max(0, (draft[id] || 0) + amount);
    if (trait.value + next > trait.threshold) return;
    if (draftTotal() - (draft[id] || 0) + next > LG.traits.points()) return;
    draft[id] = next;
    render();
  }

  async function equip(id, tier) {
    if (saving) return;
    saving = true;
    try {
      const result = await LG.authority.mutate("equipTrait", {
        traitId: id,
        tier,
      });
      el.status.textContent = result.message;
    } catch (err) {
      console.error("称号装备失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "称号装备失败，请稍后重试。";
    } finally {
      saving = false;
      render();
    }
  }

  function traitRow(trait) {
    const pending = draft[trait.id] || 0;
    const shown = trait.value + pending;
    const row = document.createElement("article");
    row.className = `trait-row${trait.unlocked ? " unlocked" : ""}`
      + `${trait.available ? "" : " locked"}`;
    const heading = document.createElement("div");
    heading.className = "trait-heading";
    const name = document.createElement("strong");
    name.textContent = trait.label;
    const value = document.createElement("b");
    value.textContent = `${shown}/${trait.threshold}`;
    heading.append(name, value);
    const description = document.createElement("p");
    description.textContent = trait.unlockHint || trait.description;
    const track = document.createElement("div");
    track.className = "trait-track";
    const fill = document.createElement("span");
    fill.style.width = `${shown}%`;
    track.append(fill);
    const controls = document.createElement("div");
    controls.className = "trait-controls";
    const minus = button("−", "trait-step");
    minus.title = `减少${trait.label}暂存点数`;
    minus.disabled = pending <= 0;
    minus.addEventListener("click", () => adjust(trait.id, -1));
    const pendingText = document.createElement("span");
    pendingText.textContent = pending ? `待分配 +${pending}` : "未分配";
    const plus = button("+", "trait-step");
    plus.title = `增加${trait.label}暂存点数`;
    plus.disabled = !trait.available || shown >= trait.threshold
      || draftTotal() >= LG.traits.points();
    plus.addEventListener("click", () => adjust(trait.id, 1));
    controls.append(minus, pendingText, plus);
    const titles = document.createElement("div");
    titles.className = "trait-titles";
    trait.tiers.forEach((tier) => {
      const title = button(
        `${tier.equipped ? "已装备" : tier.unlocked ? "装备" : "未解锁"}`
          + ` · ${tier.value}点 · ${tier.title}`,
        `trait-title tier-${tier.value}${tier.equipped ? " equipped" : ""}`,
      );
      title.disabled = !tier.unlocked;
      title.addEventListener("click", () =>
        equip(tier.equipped ? null : trait.id, tier.value));
      titles.append(title);
    });
    row.append(heading, description, track, controls, titles);
    return row;
  }

  function render() {
    const remaining = LG.traits.points() - draftTotal();
    const active = LG.traits.active();
    el.points.textContent = String(remaining);
    el.active.textContent = active ? active.title : "未装备";
    el.list.replaceChildren(...LG.traits.all().map(traitRow));
    el.commit.disabled = saving || draftTotal() === 0;
    el.commit.textContent = saving
      ? "保存中…" : draftTotal() ? `确认分配 ${draftTotal()} 点` : "确认分配";
    LG.traitsUI.refresh();
  }

  async function commit() {
    if (saving) return;
    saving = true;
    try {
      const result = await LG.authority.mutate("allocateTraits", { changes: draft });
      draft = {};
      el.status.textContent = result.message;
      LG.equipmentUI?.refresh?.();
      LG.collectiblesUI?.refresh?.();
      LG.roomsUI?.refresh?.();
    } catch (err) {
      console.error("属性分配失败:", err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "属性分配失败，请稍后重试。";
    } finally {
      saving = false;
      render();
    }
  }

  LG.traitsUI = {
    init() {
      el.dialog = document.getElementById("traitsDialog");
      el.button = document.getElementById("traitsButton");
      el.points = document.getElementById("traitPoints");
      el.active = document.getElementById("activeTraitTitle");
      el.list = document.getElementById("traitList");
      el.status = document.getElementById("traitsStatus");
      el.commit = document.getElementById("commitTraitsButton");
      el.button.addEventListener("click", () => this.open());
      document.getElementById("closeTraitsButton").addEventListener("click", () => this.close());
      el.commit.addEventListener("click", commit);
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        this.close();
      });
      this.refresh();
    },
    open() {
      draft = {};
      el.status.textContent = "前五项按30/60/90/100解锁称号；全部100后解锁丧志。";
      render();
      LG.equipmentUI?.show?.("traits");
      el.dialog.showModal();
    },
    close() {
      draft = {};
      el.dialog.close();
    },
    refresh() {
      if (!el.button) return;
      const active = LG.traits.active();
      el.button.textContent = LG.traits.points()
        ? `属性·${LG.traits.points()}` : active ? "属性·称号" : "属性";
      el.button.title = active
        ? `当前称号：${active.title}（${active.attitude}态度）` : "角色属性";
    },
  };
})(window.LifeGame);
