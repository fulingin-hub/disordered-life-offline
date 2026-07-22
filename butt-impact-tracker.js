(function (LG) {
  function itemKind(value) {
    const text = String(value || "");
    if (/(^|-)holy-water$|(^|-)water$/.test(text)) return "water";
    if (/(^|-)golden-sacrament$|(^|-)gold$/.test(text)) return "gold";
    return null;
  }

  function roomCount(id, kind) {
    return Math.max(0, Math.floor(Number(
      LG.blackMarket._data()?.roomUsage?.[id]?.[kind],
    ) || 0));
  }

  function marketCount(kind) {
    const totals = LG.blackMarket.usageTotals();
    return kind === "water"
      ? Math.max(0, Number(totals.holyWater) || 0)
      : Math.max(0, Number(totals.goldenSacrament) || 0);
  }

  function captureRoom(character, value) {
    const meta = LG.buttImpactMeta.room(character);
    const kind = itemKind(value);
    if (!meta || !kind) return null;
    LG.buttImpactVoice?.prime?.();
    return { meta, kind, source: "room", before: roomCount(meta.id, kind) };
  }

  function captureMarket(character, itemId) {
    const item = LG.blackMarket.potions().find((entry) => entry.id === itemId);
    const meta = LG.buttImpactMeta.room(character);
    const kind = itemKind(item?.specialKind);
    if (!meta || !kind) return null;
    LG.buttImpactVoice?.prime?.();
    return { meta, kind, source: "market", before: marketCount(kind) };
  }

  function complete(token) {
    if (!token) return false;
    const after = token.source === "market"
      ? marketCount(token.kind) : roomCount(token.meta.id, token.kind);
    return after > token.before && after % 10 === 0
      && LG.buttImpactPopup.showCharacter(token.meta, after, token.kind);
  }

  LG.buttImpactTracker = { captureRoom, captureMarket, complete, itemKind };
})(window.LifeGame);
