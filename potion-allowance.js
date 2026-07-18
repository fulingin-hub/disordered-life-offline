(function (LG) {
  LG.blackMarket.potionAllowance = function potionAllowance(itemId, state) {
    const data = this._data();
    const item = data.potions.find((entry) => entry.id === itemId);
    if (!item) return { remaining: 0, label: "无库存", exhausted: true };
    if (state?.endingId) {
      return { remaining: 0, label: "当前人生已结束，请重新出生", exhausted: true };
    }
    if (item.specialKind === "water" || item.specialKind === "gold") {
      return { remaining: Infinity, label: "本轮可重复饮用", exhausted: false };
    }
    const runId = state?.runId;
    const used = Array.isArray(data.uses?.[runId]) ? data.uses[runId] : [];
    const firstUsed = used.includes(item.effectKey);
    const infernal = LG.blackPrison?.outfitCategory?.() === "infernal";
    const bonusUsed = Math.max(0, Math.floor(Number(
      data.bonusPotionUses?.[runId]?.[item.effectKey],
    ) || 0));
    const remaining = firstUsed ? (infernal ? Math.max(0, 10 - bonusUsed) : 0)
      : 1 + (infernal ? 10 : 0);
    return {
      remaining,
      exhausted: remaining <= 0,
      label: infernal
        ? `恶魔馈赠生效 · 本轮还可饮用 ${remaining} 次`
        : firstUsed ? "本轮已达上限 · 未启用恶魔馈赠" : "本轮可饮用 1 次",
    };
  };
})(window.LifeGame);
