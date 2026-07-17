(function (LG) {
  const controls = {};
  let busy = false;

  function renderGroup(group) {
    const control = controls[group];
    if (!control) return;
    const complete = LG.blackPrison.canEquip(group);
    const equipped = LG.blackPrison.equippedOutfit() === group;
    control.status.textContent = equipped
      ? "当前已穿戴"
      : complete ? "已集齐，可穿戴" : "集齐五件后开放穿戴";
    control.button.textContent = equipped ? "脱下套装" : "穿戴套装";
    control.button.disabled = busy || !complete;
    control.wrap.dataset.equipped = String(equipped);
  }

  function render() {
    renderGroup("luxury");
    renderGroup("infernal");
  }

  async function equip(group) {
    if (busy) return;
    busy = true;
    render();
    const selected = LG.blackPrison.equippedOutfit() === group ? null : group;
    try {
      const result = await LG.authority.mutate("blackPrisonEquip", {
        group: selected,
      });
      render();
      LG.protagonistPortrait.render(result.life);
      if (result.life.endingId) {
        LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
        LG.ui.render(result.life);
      }
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("乐园套装穿戴失败:", err?.code, err?.message, err?.stack);
      window.dzmm?.toast?.error?.(err?.message || "套装穿戴失败。");
    } finally {
      busy = false;
      render();
    }
  }

  LG.blackPrisonOutfitUI = {
    init() {
      ["luxury", "infernal"].forEach((group) => {
        const prefix = group === "luxury"
          ? "blackPrisonLuxury" : "blackPrisonInfernal";
        controls[group] = {
          wrap: document.getElementById(`${prefix}Outfit`),
          status: document.getElementById(`${prefix}OutfitStatus`),
          button: document.getElementById(`${prefix}OutfitButton`),
        };
        controls[group].button.addEventListener("click", () => equip(group));
      });
      render();
    },
    refresh: render,
  };
})(window.LifeGame);
