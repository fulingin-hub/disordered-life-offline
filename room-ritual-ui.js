(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function panel(character) {
    const section = node("section", "room-ritual-panel");
    const actions = node("div", "room-ritual-actions");
    [["献上灵魂", "offering"], ["洗脑榨取", "showcase"]]
      .forEach(([label, mode]) => {
        const button = node("button", "", label);
        button.type = "button";
        button.addEventListener("click", () =>
          LG.contributionRitual.showRoom(character, mode));
        actions.append(button);
      });
    const magic = node("button", "", "魔气洗脑");
    magic.type = "button";
    magic.addEventListener("click", () => LG.infernalChurchUI.cast(character.name));
    actions.append(magic);
    section.append(node("strong", "", "魔纹术式"),
      node("p", "", "可选择献上灵魂、洗脑榨取，或让该角色发动魔气洗脑。"),
      actions);
    return section;
  }

  LG.roomRitualUI = { panel };
})(window.LifeGame);
