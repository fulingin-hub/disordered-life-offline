(function (LG) {
  const el = {};
  let activeCharacter;
  let renderMarket;
  let marketBusy;
  let busy = false;

  function render() {
    const id = activeCharacter?.();
    if (!id || !el.button) return;
    const unlocked = LG.blackMarket.canRefresh(id);
    const count = LG.blackMarket.refreshesToday(id);
    const limit = LG.blackMarket.refreshLimit();
    const cost = LG.blackMarket.refreshCost();
    const enoughPoints = LG.traits.points() >= cost;
    el.count.textContent = `${count}/${limit}`;
    el.button.disabled = busy || marketBusy?.() || !unlocked
      || count >= limit || !enoughPoints;
    el.button.textContent = !unlocked ? "需狂热媚外者勋章"
      : count >= limit ? "今日刷新已用完"
        : !enoughPoints ? `需要${cost}属性点` : `刷新商品 · ${cost}点`;
  }

  async function refreshStock() {
    if (busy || marketBusy?.()) return;
    busy = true;
    renderMarket("正在由服务端刷新库存…");
    render();
    try {
      const result = await LG.authority.mutate("refreshMarket", {
        character: activeCharacter?.(),
      });
      renderMarket(result.message);
      LG.traitsUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("黑市刷新保存失败:", err.code, err.message, err.stack);
      renderMarket("刷新记录保存失败，请稍后重试。");
    } finally {
      busy = false;
      render();
    }
  }

  LG.blackMarketRefreshUI = {
    init(characterProvider, marketRenderer, busyProvider) {
      activeCharacter = characterProvider;
      renderMarket = marketRenderer;
      marketBusy = busyProvider;
      el.button = document.getElementById("blackMarketRefreshButton");
      el.count = document.getElementById("blackMarketRefreshCount");
      el.button.addEventListener("click", refreshStock);
    },
    render,
    isBusy() {
      return busy;
    },
  };
})(window.LifeGame);
