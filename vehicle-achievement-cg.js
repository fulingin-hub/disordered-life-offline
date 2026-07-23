(function (LG) {
  const entries = [
    {
      vehicleId: "reputation-blood-wolf",
      cgId: "reputation-blood-wolf",
      title: "血色狼王 · 并肩初征",
      threshold: 1500,
      family: "blood-wolf",
      text: "声望达到1500点后，血色狼王正式承认你与搭档为前线伙伴。",
    },
    {
      vehicleId: "reputation-blood-tiger",
      cgId: "reputation-blood-tiger",
      title: "血色虎王 · 威名远扬",
      threshold: 2000,
      family: "blood-tiger",
      text: "声望达到2000点后，血色虎王载着你穿过为英雄让开的公会长街。",
    },
    {
      vehicleId: "reputation-blood-trex",
      cgId: "reputation-blood-dragon",
      title: "血色龙王 · 深渊传奇",
      threshold: 3000,
      family: "blood-dragon",
      text: "声望达到3000点后，血色龙王与你一同接受异界冒险者们的致意。",
    },
  ];

  entries.forEach((entry) => {
    LG.CG_ASSETS.specialMeta[entry.cgId] = {
      title: entry.title,
      label: "异界声望战斗伙伴成就CG",
      text: entry.text,
      fixedNarration: false,
    };
    LG.CG_ASSETS.special[entry.cgId] = {
      male: LG.CONFIG.assets[`mounted-reputation-${entry.family}-male`],
      female: LG.CONFIG.assets[`mounted-reputation-${entry.family}-female`],
    };
  });

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function card(entry, gender, reputation) {
    const owned = LG.vehicleStore.owns(entry.vehicleId);
    const available = owned && LG.contentMode?.isTeen?.() !== true;
    const item = node("article",
      `vehicle-achievement-cg${owned ? " unlocked" : " locked"}`);
    const heading = node("div", "vehicle-achievement-cg-heading");
    heading.append(node("strong", "", entry.title),
      node("span", "", owned ? "已解锁" : `${reputation}/${entry.threshold}`));
    item.append(heading);
    if (available) {
      const image = node("img");
      image.src = LG.CG_ASSETS.special[entry.cgId][gender];
      image.alt = `${entry.title}成就CG`;
      image.loading = "lazy";
      image.decoding = "async";
      image.dataset.adultGallery = "true";
      item.append(image);
    } else {
      item.append(node("p", "", owned
        ? "15+模式不显示画廊CG。"
        : `异界声望达到${entry.threshold}点后自动获得战斗伙伴并解锁。`));
    }
    const button = node("button", "quiet-button",
      available ? "查看成就CG" : owned ? "当前模式不可查看" : "尚未解锁");
    button.type = "button";
    button.disabled = !available;
    button.dataset.vehicleAchievementCg = entry.cgId;
    button.dataset.adultGallery = "true";
    button.addEventListener("click", () => LG.cgUI?.openSpecial?.(entry.cgId, gender));
    item.append(button);
    return item;
  }

  LG.vehicleAchievementCG = {
    entries,
    render(container, gender) {
      if (!container) return;
      const reputation = Math.max(0, LG.infernalRealm.stats().reputation);
      const selectedGender = gender === "female" ? "female" : "male";
      container.replaceChildren(...entries.map((entry) =>
        card(entry, selectedGender, reputation)));
    },
  };
})(window.LifeGame);
