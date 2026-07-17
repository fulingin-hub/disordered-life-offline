(function (LG) {
  const COST = 100;
  const DAILY_LIMIT = 3;

  Object.assign(LG.blackMarket, {
    refreshCost() {
      return COST;
    },
    refreshLimit() {
      return DAILY_LIMIT;
    },
    canRefresh(id) {
      return this.roomUnlocked(id) && this.kneelingCount(id) >= 30;
    },
    refreshesToday(id) {
      const country = this.country(id);
      if (!country) return 0;
      this.refreshDaily(country);
      return this._data().daily[country].refreshes || 0;
    },
    refreshStock(id) {
      if (!this.canRefresh(id)) {
        return { ok: false, message: "狂热媚外者勋章激活后才能刷新商品。" };
      }
      const country = this.country(id);
      this.refreshDaily(country);
      const daily = this._data().daily[country];
      if (daily.refreshes >= DAILY_LIMIT) {
        return { ok: false, message: `今日已刷新${DAILY_LIMIT}次，请等待明日库存。` };
      }
      if (!LG.traits.spendPoints(COST)) {
        return { ok: false, message: `属性点不足，刷新需要${COST}点。` };
      }
      daily.refreshes += 1;
      this.regenerateStock(country);
      return {
        ok: true,
        count: daily.refreshes,
        message: `黑市商品已刷新（${daily.refreshes}/${DAILY_LIMIT}），消耗${COST}点属性点。`,
      };
    },
  });
})(window.LifeGame);
