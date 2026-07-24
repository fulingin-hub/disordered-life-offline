(function (LG) {
  let mode = "normal";
  let previewGender = null;
  const selected = { normal: null, advanced: null, second: null, special: null };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function jobs(data) {
    return (data.professionDefinitions || []).filter((job) =>
      LG.careerPortraits.category(job.id) === mode
      || (mode === "normal" && job.id === "sigil-thrall"));
  }

  function build(data) {
    if (!previewGender) {
      previewGender = LG.authority.state()?.gender === "female" ? "female" : "male";
    }
    const panel = node("section", "career-portrait-panel");
    const tabs = node("div", "career-portrait-tabs");
    [["normal", "普通职业立绘"], ["advanced", "一阶职业立绘"],
      ["second", "二阶职业立绘"],
      ["special", "堕落职业立绘"]]
      .forEach(([id, label]) => {
        const button = node("button", mode === id ? "active" : "", label);
        button.type = "button";
        button.addEventListener("click", () => {
          mode = id;
          panel.replaceWith(build(LG.career.data()));
        });
        tabs.append(button);
      });
    const genderTabs = node("div", "career-portrait-tabs");
    [["male", "男主职业CG"], ["female", "女主职业CG"]]
      .forEach(([id, label]) => {
        const button = node("button", previewGender === id ? "active" : "", label);
        button.type = "button";
        button.addEventListener("click", () => {
          previewGender = id;
          panel.replaceWith(build(LG.career.data()));
        });
        genderTabs.append(button);
      });
    const options = jobs(data);
    const equipped = options.find((job) => job.id === data.equippedProfession);
    const chosen = options.find((job) => job.id === selected[mode])
      || equipped || options[0];
    if (chosen) selected[mode] = chosen.id;
    const select = node("select", "career-portrait-select");
    options.forEach((job) => {
      const option = new Option(`${job.name}${job.unlocked ? "" : " · 未解锁"}`, job.id);
      select.append(option);
    });
    select.value = chosen?.id || "";
    select.disabled = !chosen;
    select.addEventListener("change", () => {
      selected[mode] = select.value;
      panel.replaceWith(build(LG.career.data()));
    });
    const figure = node("figure", "career-cg-art");
    if (chosen?.id === "sigil-thrall" && mode === "special") {
      figure.classList.add("career-thrall-head");
    }
    const locked = chosen && !chosen.unlocked;
    if (chosen && !locked) {
      const image = node("img");
      image.src = LG.careerPortraits.previewSource(
        chosen.id, previewGender, mode);
      image.alt = `${previewGender === "female" ? "女" : "男"}主角·${chosen.name}职业CG`;
      const caption = node("figcaption", "", `${chosen.name} · ${
        chosen.id === "sigil-thrall" && mode === "special"
          ? "堕落职业头部立绘"
          : chosen.id === "sigil-thrall"
            ? "普通职业完整立绘预览"
          : mode === "special" ? "堕落职业CG逻辑预览"
          : mode === "second" ? "二阶职业套装立绘预览"
            : mode === "advanced" ? "一阶职业全身立绘预览"
              : "普通职业全身立绘预览"}`);
      figure.append(image, caption);
      if (chosen.pilotFaction) {
        figure.append(LG.careerAbilityData.plate(chosen.pilotFaction));
      }
    } else {
      figure.append(node("p", "career-portrait-empty", locked
        ? "完成该职业的解锁条件后才可查看立绘。"
        : "当前分类暂无职业资料。"));
    }
    const current = data.professionDefinitions?.find((job) =>
      job.id === data.equippedProfession);
    const bonus = node("div", "career-bonus-copy");
    bonus.append(node("strong", "", `当前装备：${current?.name || "未装备职业"}`),
      node("p", "", LG.careerPortraits.bonus(current)));
    panel.append(tabs, genderTabs, select, figure, bonus);
    return panel;
  }

  LG.careerArtUI = { panel: build };
})(window.LifeGame);
