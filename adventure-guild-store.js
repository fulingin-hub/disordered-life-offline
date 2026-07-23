(function (LG) {
  const empty = () => ({
    stock: [], supplies: {}, equipment: {}, corruptedInventory: {},
    catalog: [], lootBoxes: 0, refreshesUsed: 0, refreshesRemaining: 3,
    refreshCost: 1, points: 0, bonuses: {},
    rewards: {
      firstExpedition: {}, professionSet: { options: [] },
      abyssShares: 0, expeditionUnlocked: false,
    },
  });
  function data() {
    return LG.authority?.snapshot?.()?.economy?.adventureGuild || empty();
  }
  function catalogMap() {
    return new Map((data().catalog || []).map((item) => [item.id, item]));
  }
  LG.adventureGuild = {
    data,
    stock(kind) {
      return (data().stock || []).filter((item) => item.kind === kind);
    },
    catalogItem(id) {
      return catalogMap().get(id) || null;
    },
    corruptedItems() {
      const state = data();
      const map = new Map((state.catalog || []).map((item) => [item.id, item]));
      return Object.entries(state.corruptedInventory || {})
        .map(([id, quantity]) => ({ ...map.get(id), id, quantity }))
        .filter((item) => item.name && item.quantity > 0)
        .sort((a, b) => a.character.localeCompare(b.character, "zh-CN")
          || a.name.localeCompare(b.name, "zh-CN"));
    },
    equipmentItems() {
      return Object.entries(data().equipment || {})
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([id, quantity]) => ({ id, quantity }));
    },
    supplyItems() {
      return Object.entries(data().supplies || {})
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([id, quantity]) => ({ id, quantity }));
    },
  };
})(window.LifeGame);
