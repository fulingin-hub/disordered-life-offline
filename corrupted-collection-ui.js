(function (LG) {
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function bookEntries() {
    const data = LG.infernalChurch.data();
    const owned = new Set(data.ownedBooks || []);
    return LG.INFERNAL_CHURCH_DATA.books.filter((book) => owned.has(book.id))
      .map((book) => ({
        kind: "book", id: book.id, name: book.name,
        description: book.effect, characterName: "七大欲女祭司",
        quantity: 1,
      }));
  }
  function itemEntries() {
    return LG.adventureGuild.corruptedItems().map((item) => ({
      ...item, kind: "corrupted", characterName: item.character,
    }));
  }
  function card(entry) {
    const item = node("article", "collectible-card owned");
    item.append(node("span", "collectible-mark",
      entry.kind === "book" ? "已获得" : `库存 ${entry.quantity}`),
    node("strong", "", entry.name), node("p", "", entry.description));
    if (entry.kind === "corrupted") {
      item.append(node("small", "adventure-guild-affix",
        `${entry.affixLabel}收益 +${entry.affixPercent}% · 重复库存可出售`));
      const button = node("button", "quiet-button", "前往公会回收");
      button.type = "button";
      button.addEventListener("click", () => LG.adventureGuildUI.open("inventory"));
      item.append(button);
    }
    return item;
  }
  LG.corruptedCollectionUI = {
    view() {
      const entries = [...bookEntries(), ...itemEntries()];
      LG.collectionFilters.updateCharacters(entries);
      const visible = LG.collectionFilters.apply(entries);
      const guild = LG.adventureGuild.data();
      const ownedUnique = itemEntries().length;
      const ownedTotal = Object.values(guild.corruptedInventory || {})
        .reduce((sum, quantity) => sum + Number(quantity || 0), 0);
      const total = (guild.catalog || []).length
        + LG.INFERNAL_CHURCH_DATA.books.length;
      return {
        count: ownedUnique + bookEntries().length,
        total,
        quantity: ownedTotal + bookEntries().length,
        cards: visible.map(card),
      };
    },
  };
})(window.LifeGame);
