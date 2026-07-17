(function (LG) {
  const outfits = [
    { id: "normal", name: "普通装备" },
    {
      id: "luxury", name: "权贵奢华",
      fullName: "权贵的奢华套装",
      effect: "来自财富的累积：每次人生重新开始时增加100点属性点",
    },
    {
      id: "infernal", name: "恶魔神秘",
      fullName: "恶魔的神秘套装",
      effect: "来自恶魔的馈赠：每轮人生可额外使用药剂10次",
    },
    {
      id: "penitentiary", name: "影狱丧志",
      fullName: "影狱的人格丧志套装",
      effect: "来自无尽的欲望：羞耻度固定为满值250点",
    },
  ];
  let buttons;
  let effect;
  let status;
  let providers;
  let busy = false;

  function current() {
    if (LG.penitentiary.outfitEquipped()) return "penitentiary";
    return LG.blackPrison.equippedOutfit() || "normal";
  }

  function available(id) {
    if (id === "normal") return true;
    if (id === "penitentiary") {
      return LG.penitentiary.access().allowed && LG.penitentiary.outfitComplete();
    }
    return LG.blackPrison.access().allowed && LG.blackPrison.canEquip(id);
  }

  function effectText(id, ordinary) {
    const special = outfits.find((item) => item.id === id)?.effect;
    if (special) return special;
    return ordinary?.set ? "羞耻值 +100" : "无套装效果";
  }

  function createButton(outfit, selected) {
    const unlocked = available(outfit.id);
    const button = document.createElement("button");
    const name = document.createElement("strong");
    const detail = document.createElement("span");
    button.type = "button";
    button.className = selected ? "selected" : "";
    button.disabled = busy || selected || !unlocked;
    button.setAttribute("aria-pressed", String(selected));
    name.textContent = outfit.name;
    detail.textContent = selected ? "已穿戴" : unlocked ? "选择" : "尚未集齐";
    button.append(name, detail);
    button.addEventListener("click", () => select(outfit.id));
    return button;
  }

  function render(state, ordinary) {
    if (!buttons || !effect) return;
    const selected = current();
    buttons.replaceChildren(...outfits.map((outfit) =>
      createButton(outfit, outfit.id === selected)));
    effect.textContent = effectText(selected, ordinary || LG.equipment.summary(state));
  }

  async function select(id) {
    if (busy || id === current() || !available(id)) return;
    busy = true;
    status.textContent = "正在切换特殊套装…";
    render(providers.getState());
    try {
      let result;
      if (id === "normal") {
        if (LG.penitentiary.outfitEquipped()) {
          result = await LG.authority.mutate("penitentiaryEquip", { equipped: false });
        }
        if (LG.blackPrison.equippedOutfit()) {
          result = await LG.authority.mutate("blackPrisonEquip", { group: null });
        }
      } else if (id === "penitentiary") {
        result = await LG.authority.mutate("penitentiaryEquip", { equipped: true });
      } else {
        result = await LG.authority.mutate("blackPrisonEquip", { group: id });
      }
      if (result) {
        status.textContent = result.message;
        if (result.life.endingId) {
          LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
        }
        providers.onChange();
        window.dzmm?.toast?.success?.(result.message);
      }
    } catch (err) {
      console.error("特殊套装切换失败:", err?.code, err?.message, err?.stack);
      status.textContent = err?.message || "特殊套装切换失败。";
    } finally {
      busy = false;
      LG.blackPrisonOutfitUI?.refresh?.();
      render(providers.getState());
    }
  }

  LG.specialOutfitUI = {
    init(nextProviders) {
      providers = nextProviders;
      buttons = document.getElementById("specialOutfitButtons");
      effect = document.getElementById("equipmentEffect");
      status = document.getElementById("equipmentStatus");
    },
    current,
    outfit() {
      return outfits.find((item) => item.id === current()) || outfits[0];
    },
    render,
  };
})(window.LifeGame);
