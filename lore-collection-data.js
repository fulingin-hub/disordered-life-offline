(function (LG) {
  const oldNotes = [
    ["old-01", "残页一", "门后有眼。"],
    ["old-02", "残页二", "恶念有价。"],
    ["old-03", "残页三", "灵魂会沉。"],
    ["old-04", "残页四", "教会在数。"],
    ["old-05", "残页五", "七色曾一。"],
    ["old-06", "残页六", "神并未死。"],
    ["old-07", "残页七", "牧场无墙。"],
    ["old-08", "残页八", "欲望回流。"],
    ["old-09", "残页九", "圣徒知情。"],
    ["old-10", "残页十", "黑潮向上。"],
  ].map(([id, name, description]) => ({
    id: `lore-${id}`, name: `古老手札·${name}`, description,
    privacy: "normal", source: "random-lore", equippable: false,
  }));
  const soulNotes = [
    ["black", "黑魂", LG.INFERNAL_CHURCH_DATA.blackTruth],
    ["red", "赤魂", "赤色灵魂象征行动与牺牲。它燃烧得最猛烈，也最接近把意志化为现实的神性。"],
    ["orange", "橙魂", "橙色灵魂象征创造与丰收。它能让有限之物结出超越常理的复数果实。"],
    ["yellow", "黄魂", "黄色灵魂象征衡量与交换。它看见万物的代价，也能重新书写交易的尺度。"],
    ["green", "绿魂", "绿色灵魂象征生长与庇护。它以生命的韧性抵挡侵入灵魂的魔气。"],
    ["blue", "蓝魂", "蓝色灵魂象征秩序与守望。它让自我在漫长侵蚀中仍保持清醒。"],
    ["silver", "银魂", "银色灵魂象征记忆与不朽。它把经历铸成壁垒，使灵魂不被岁月轻易改写。"],
    ["purple", "紫魂", "紫色灵魂象征秘密与超越。它能触碰欲望背后的法则，却也最容易被深渊注视。"],
  ].map(([id, name, description]) => ({
    id: `lore-god-${id}`, name: `古神手札·${name}`, description,
    privacy: "normal", source: "soul-lore", equippable: false, hidden: true,
  }));
  LG.LORE_COLLECTION_DATA = { oldNotes, soulNotes, items: [...oldNotes, ...soulNotes] };
})(window.LifeGame);
