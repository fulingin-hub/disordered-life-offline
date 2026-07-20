(function (LG) {
  LG.blackMarket.usePotion = function usePotion(itemId, gameState) {
    if (this.currentAge(gameState) < 18) {
      return { ok: false, message: "成人道具仅限主角18岁后饮用。" };
    }
    if (gameState.endingId) {
      return { ok: false, message: "本次人生已经结束，无法饮用药剂。" };
    }
    const data = this._data();
    const item = data.potions.find((entry) =>
      entry.id === itemId && entry.quantity > 0);
    if (!item) return { ok: false, message: "药剂库存不足。" };
    const unlimited = item.specialKind === "water" || item.specialKind === "gold";
    const used = Array.isArray(data.uses[gameState.runId])
      ? data.uses[gameState.runId] : [];
    const repeated = !unlimited && used.includes(item.effectKey);
    const bonusByPotion = data.bonusPotionUses[gameState.runId] || {};
    const bonusUsed = Math.max(0,
      Math.floor(Number(bonusByPotion[item.effectKey]) || 0));
    const infernal = LG.blackPrison?.outfitCategory?.() === "infernal";
    if (repeated && (!infernal || bonusUsed >= 10)) {
      return { ok: false, message: "本次人生已经达到该药剂的饮用上限。" };
    }
    const effects = item.effects || LG.potionEffects.for(item);
    const previousHealth = Number(gameState.stats.health) || 0;
    LG.potionEffects.apply(gameState.stats, effects);
    item.quantity -= 1;
    LG.blackMarketPotions.recordUse(data, item,
      unlimited && previousHealth > 0 && gameState.stats.health === 0);
    if (repeated) {
      data.bonusPotionUses[gameState.runId] = {
        ...bonusByPotion, [item.effectKey]: bonusUsed + 1,
      };
    } else if (!unlimited) {
      data.uses[gameState.runId] = [...used, item.effectKey];
      const runIds = Object.keys(data.uses);
      if (runIds.length > 40) {
        runIds.slice(0, -40).forEach((id) => delete data.uses[id]);
      }
    }
    const bonus = repeated
      ? `来自恶魔的馈赠，该药剂本轮额外饮用次数剩余${9 - bonusUsed}次。` : "";
    return {
      ok: true, item,
      message: `已饮用${item.name}：${LG.potionEffects.text(effects)}。${bonus}`,
    };
  };
})(window.LifeGame);
