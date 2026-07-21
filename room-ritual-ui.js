(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function panel(character) {
    const uses = LG.roomConsumables.totalUsage(character.id);
    const unlocked = LG.roomConsumables.ritualUnlocked(character.id);
    const section = node("section", "room-ritual-panel");
    section.dataset.ritualUses = String(uses);
    section.dataset.ritualUnlocked = String(unlocked);
    const actions = node("div", "room-ritual-actions");
    [["献上灵魂", "offering"], ["灵魂支配", "showcase"]]
      .forEach(([label, mode]) => {
        const button = node("button", "",
          unlocked ? label : `${label} · ${uses}/100`);
        button.type = "button";
        button.disabled = !unlocked;
        button.addEventListener("click", () =>
          LG.contributionRitual.showRoom(character, mode));
        actions.append(button);
      });
    const magic = node("button", "", "魔气入脑");
    magic.type = "button";
    magic.addEventListener("click", () => LG.infernalChurchUI.cast(
      character.name, null, { roomCharacter: character.id }));
    actions.append(magic);
    section.append(node("strong", "", "供奉与支配"),
      node("p", "", unlocked
        ? "该房间已开放献上灵魂与灵魂支配，也可发动魔气入脑。"
        : `使用该角色售卖的药剂累计${uses}/100次后，开放供奉与支配。`),
      actions);
    return section;
  }

  LG.roomRitualUI = { panel };
})(window.LifeGame);
