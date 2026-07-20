(function (LG) {
  const sacrament = {
    health: -10, dignity: -100, shame: 500, dependence: 100,
  };
  const potion = {
    health: -10, autonomy: -100, shame: 100, dependence: 500,
  };
  const order = ["health", "autonomy", "dignity", "shame", "dependence"];

  function effects(item) {
    return { ...(["water", "gold"].includes(item?.specialKind)
      ? sacrament : potion) };
  }

  function text(values) {
    return order.filter((id) => Number(values?.[id]))
      .map((id) => `${id === "shame" ? "羞耻值" : LG.CONFIG.statMeta[id]}${
        Number(values[id]) > 0 ? "+" : ""}${Number(values[id])}`).join("，");
  }

  function apply(stats, values) {
    Object.entries(values || {}).forEach(([id, amount]) => {
      stats[id] = Math.max(0, Math.min(999999999,
        (Number(stats[id]) || 0) + Number(amount)));
    });
  }

  LG.potionEffects = { for: effects, text, apply };
})(window.LifeGame);
