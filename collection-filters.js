(function (LG) {
  let search = "";
  let character = "";
  const input = document.getElementById("collectionSearch");
  const select = document.getElementById("collectionCharacterFilter");
  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase("zh-CN");
  }
  function notify() {
    LG.collectiblesUI?.refresh?.();
  }
  input?.addEventListener("input", () => {
    search = normalize(input.value);
    notify();
  });
  select?.addEventListener("change", () => {
    character = select.value;
    notify();
  });
  LG.collectionFilters = {
    ownedSaintItems() {
      return LG.collectibles.characters().flatMap((character) =>
        LG.saintItems.items(character.id)).filter((item) =>
        LG.saintItems.owns(item.id));
    },
    ownedCard(item) {
      const card = document.createElement("article");
      card.className = "collectible-card owned";
      [["span", "collectible-mark", "已获得"], ["strong", "", item.name],
        ["p", "", item.description]].forEach(([tag, className, text]) => {
        const child = document.createElement(tag);
        if (className) child.className = className;
        child.textContent = text;
        card.append(child);
      });
      return card;
    },
    entries(regular, saint, career) {
      const roomName = (item) =>
        LG.COLLECTIBLE_CHARACTERS[item.character]?.name || item.character;
      const careerName = (item) => LG.CAREER_DATA.roster
        .find((entry) => entry.id === item.character)?.name || item.character;
      const wrap = (kind, item, characterName) => ({
        kind, item, name: item.name, description: item.description, characterName,
      });
      return [
        ...regular.map((item) => wrap("regular", item, roomName(item))),
        ...saint.map((item) => wrap("saint", item, roomName(item))),
        ...career.map((item) => wrap("career", item, careerName(item))),
      ];
    },
    apply(entries) {
      const visible = entries.filter((entry) => {
        if (character && entry.characterName !== character) return false;
        if (!search) return true;
        return normalize(`${entry.characterName} ${entry.name} ${
          entry.description || ""}`).includes(search);
      });
      return visible.sort((left, right) =>
        left.characterName.localeCompare(right.characterName, "zh-CN")
        || left.name.localeCompare(right.name, "zh-CN"));
    },
    updateCharacters(entries) {
      if (!select) return;
      const previous = character;
      const names = [...new Set(entries.map((entry) => entry.characterName)
        .filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
      select.replaceChildren(Object.assign(document.createElement("option"), {
        value: "", textContent: "全部角色",
      }), ...names.map((name) => Object.assign(document.createElement("option"), {
        value: name, textContent: name,
      })));
      character = names.includes(previous) ? previous : "";
      select.value = character;
    },
    resetCharacter() {
      character = "";
      if (select) select.value = "";
    },
  };
})(window.LifeGame);
