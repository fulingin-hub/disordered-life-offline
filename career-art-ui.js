(function (LG) {
  let mode = "normal";
  let previewGender = null;
  const selected = { normal: null, advanced: null, special: null };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function jobs(data) {
    return (data.professionDefinitions || []).filter((job) =>
      LG.careerPortraits.category(job.id) === mode);
  }

  function build(data) {
    if (!previewGender) {
      previewGender = LG.authority.state()?.gender === "female" ? "female" : "male";
    }
    const panel = node("section", "career-portrait-panel");
    const tabs = node("div", "career-portrait-tabs");
    [["normal", "普通职业立绘"], ["advanced", "一转职业立绘"],
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
    const advancementLocked = mode === "advanced" && !data.firstAdvanceUnlocked;
    const specialLocked = mode === "special" && !chosen?.unlocked;
    if (chosen && !advancementLocked && !specialLocked) {
      const image = node("img");
      image.src = LG.careerPortraits.previewSource(chosen.id, previewGender);
      image.alt = `${previewGender === "female" ? "女" : "男"}主角·${chosen.name}职业CG`;
      const caption = node("figcaption", "", `${chosen.name} · ${
        mode === "special" ? "堕落职业CG逻辑预览"
          : mode === "advanced" ? "一转职业全身立绘预览" : "普通职业全身立绘预览"}`);
      figure.append(image, caption);
    } else {
      figure.append(node("p", "career-portrait-empty", advancementLocked
        ? "首次装备职业大师套装后，永久解锁一转职业与一转立绘。"
        : specialLocked ? "完成对应堕落职业解锁条件后才可查看立绘。"
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
