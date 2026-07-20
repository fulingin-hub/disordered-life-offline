(function (LG) {
  const consumables = [
    ["water", "美味圣水", "圣水瓶", 20, "健康-10，尊严-100，羞耻值+500，依赖+100", "consumable"],
    ["gold", "黄金圣餐", "黄金盆", 40, "健康-10，尊严-100，羞耻值+500，依赖+100", "consumable"],
  ];
  const foods = ["rare", "demon"].flatMap((group) =>
    LG.BLACK_PRISON_DATA.groups[group].map((item) => [
      item.id, item.name, `${item.name}餐盘`, item.price,
      group === "rare" ? "食用后健康 +10" : "本轮记为食用恶魔餐饮",
      group,
    ]));
  function makeItems(character, raw) {
    return raw.map(([id, name, equipment, price, effect, group]) => ({
      id,
      name: `${character.name}的${name}`,
      equipmentId: `eden-${character.id}-${id}`,
      equipmentName: `${character.name}的${equipment}`,
      price,
      group,
      description: `${effect}；首次购买永久加入装备图鉴。`,
    }));
  }
  const chef = {
    id: "edenChef",
    name: "塞拉菲娜",
    role: "神明餐饮店女厨师",
    location: "伊甸园餐饮店办公室",
    portrait: LG.CONFIG.assets.edenChefClerk,
  };
  chef.items = makeItems(chef, [...foods, ...consumables]);
  const fashion = {
    id: "edenFashion",
    name: "奥蕾莉亚",
    role: "神明服装店女店员",
    location: "伊甸园高定店办公室",
    portrait: LG.CONFIG.assets.edenFashionClerk,
  };
  fashion.items = makeItems(fashion, consumables);
  const characters = [chef, fashion];
  LG.EDEN_CHARACTER_DATA = {
    characters,
    byId: Object.fromEntries(characters.map((item) => [item.id, item])),
  };
})(window.LifeGame);
