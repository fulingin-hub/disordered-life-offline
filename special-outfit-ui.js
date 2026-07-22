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
      effect: "来自恶魔的馈赠：每轮人生可额外饮用每种药剂各10次",
    },
    {
      id: "penitentiary", name: "影狱丧志",
      fullName: "影狱的人格丧志套装",
      effect: "来自无尽的欲望：羞耻度固定为满值250点",
    },
    {
      id: "holy-inquisitor", name: "圣光审判官",
      fullName: "圣光审判官五件套",
      effect: "圣者永存：显示圣光审判官二阶职业专属立绘",
    },
    {
      id: "sigil-lord", name: "魔纹领主",
      fullName: "魔纹领主套装",
      effect: "七大欲的宠奴：显示魔纹领主二阶职业专属立绘",
    },
  ];
  let buttons;
  let effect;
  let status;
  let providers;
  let busy = false;

  function current() {
    const careerOutfit = LG.holyLight?.data?.().specialOutfit;
    if (careerOutfit) return careerOutfit;
    if (LG.penitentiary.outfitEquipped()) return "penitentiary";
    return LG.blackPrison.equippedOutfit() || "normal";
  }

  function available(id) {
    if (id === "normal") return true;
    if (id === "penitentiary") {
      return LG.penitentiary.access().allowed && LG.penitentiary.outfitComplete();
    }
    if (id === "holy-inquisitor") {
      const holy = LG.holyLight?.data?.();
      return holy?.judgeSetOwned === true
        && holy?.professionUnlocks?.holyInquisitor === true;
    }
    if (id === "sigil-lord") {
      return LG.holyLight?.has?.("seven-desires-pet") === true;
    }
    return LG.blackPrison.access().allowed && LG.blackPrison.canEquip(id);
  }

  function effectText(id, ordinary) {
    const special = outfits.find((item) => item.id === id)?.effect;
    if (special) return special;
    if (ordinary?.saintSet) {
      return "自我意志不灭：锁定坏结局；异界魔境失败不增加败北值、不能满足欲望，胜利额外获得500人格值，完整一轮再获得500属性点与500人格值";
    }
    if (ordinary?.edenSet) {
      return "伊甸园的馈赠：完成任务时额外获得一次同额报酬";
    }
    if (ordinary?.penitentiarySet) {
      return "影狱权限：黑街与影狱角色商店的饮品、食物、药剂全部免费";
    }
    if (ordinary?.realmHunterSet) {
      return "异界猎人：跳过七层地狱小怪；每层按层数获得600点人格值；完成欲望任务额外获得100败北值";
    }
    if (ordinary?.realmBlackKnightSet) {
      return "魔境黑骑：异界胜利额外获得200人格值；完整一轮额外获得5000属性点与5000人格值；完成欲望任务额外获得100败北值";
    }
    if (ordinary?.careerMasterSet) {
      return "职业大师：激活职业大师收益、任务奖励与一转职业立绘；作为普通五件套计算羞耻值";
    }
    if (ordinary?.careerConsumableSet) {
      return "对应势力隐秘套装：激活职业耗材收益；对应势力领袖的特殊道具免费无限使用，每累计6次播放特殊动画";
    }
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
        if (LG.holyLight?.data?.().specialOutfit) {
          result = await LG.authority.mutate("equipCareerSpecialOutfit",
            { outfitId: null });
        }
        if (LG.penitentiary.outfitEquipped()) {
          result = await LG.authority.mutate("penitentiaryEquip", { equipped: false });
        }
        if (LG.blackPrison.equippedOutfit()) {
          result = await LG.authority.mutate("blackPrisonEquip", { group: null });
        }
      } else if (id === "penitentiary") {
        result = await LG.authority.mutate("penitentiaryEquip", { equipped: true });
      } else if (["holy-inquisitor", "sigil-lord"].includes(id)) {
        result = await LG.authority.mutate("equipCareerSpecialOutfit",
          { outfitId: id });
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
