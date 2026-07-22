(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function tierCard(entry, soul) {
    const active = soul.tier === entry.id;
    const card = node("article", `soul-guide-card${active ? " active" : ""}`);
    card.dataset.color = entry.color;
    card.append(
      node("i", "soul-guide-spark"),
      node("strong", "", `${entry.name} · ${entry.range}`),
      node("p", "", entry.lore),
      node("span", "", entry.effect),
    );
    return card;
  }

  function colorCard(entry, soul) {
    const active = soul.colors.includes(entry.id);
    const card = node("article", `soul-color-card${active ? " active" : ""}`);
    card.dataset.color = entry.id;
    card.append(
      node("i", "soul-color-swatch"),
      node("strong", "", `${entry.name}色灵魂`),
      node("p", "", entry.effect),
      node("span", "", active ? "本轮已点亮" : "本轮未点亮"),
    );
    return card;
  }

  LG.soulFlameGuideUI = {
    render(soul) {
      const tiers = document.getElementById("soulTierGuide");
      const colors = document.getElementById("soulColorGuide");
      if (!tiers || !colors) return;
      tiers.replaceChildren(...LG.INFERNAL_CHURCH_DATA.soulTiers
        .map((entry) => tierCard(entry, soul)));
      colors.replaceChildren(...LG.INFERNAL_CHURCH_DATA.soulColors
        .map((entry) => colorCard(entry, soul)));
    },
  };
})(window.LifeGame);
