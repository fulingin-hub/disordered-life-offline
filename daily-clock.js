(function (LG) {
  const RETRY_DELAY = 5 * 60 * 1000;
  let timer = 0;
  let syncing = false;
  let baselineServer = 0;
  let baselineMono = 0;
  let initialized = false;

  function monotonicNow() {
    return window.performance?.now?.() ?? Date.now();
  }

  function estimatedServerNow() {
    return baselineServer
      ? baselineServer + Math.max(0, monotonicNow() - baselineMono)
      : Date.now();
  }

  function dailyDataStale(snapshot) {
    const date = snapshot?.serverDate;
    const economy = snapshot?.economy;
    if (!date || !economy) return false;
    const dates = [
      economy.dailyTasks?.date,
      economy.career?.daily?.date,
      economy.career?.menu?.date,
      economy.blackMarket?.daily?.japan?.date,
      economy.blackMarket?.daily?.usa?.date,
      economy.goldenHorizon?.arenas?.date,
      economy.adventureGuild?.date,
    ].filter(Boolean);
    return dates.some((value) => value !== date);
  }

  function schedule(snapshot) {
    window.clearTimeout(timer);
    const date = snapshot?.serverDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return;
    const [year, month, day] = date.split("-").map(Number);
    const boundary = Date.UTC(year, month - 1, day + 1) + 1500;
    const delay = Math.max(250, Math.min(2147483647,
      boundary - estimatedServerNow()));
    timer = window.setTimeout(() => refresh("timer"), delay);
  }

  function refreshViews() {
    const state = LG.authority.state();
    if (state) LG.ui?.render?.(state);
    LG.dailyTasksUI?.refresh?.();
    LG.blackMarketUI?.refresh?.();
    LG.careerUI?.refresh?.();
    LG.goldenHorizonUI?.refresh?.();
    LG.adventureGuildUI?.render?.();
  }

  async function refresh(reason) {
    if (syncing) return;
    syncing = true;
    const previous = LG.authority.snapshot()?.serverDate;
    try {
      const result = await LG.authority.sync();
      refreshViews();
      if (previous && result.serverDate !== previous) {
        window.dzmm?.toast?.info?.("每日内容已刷新");
      }
    } catch (err) {
      console.warn("每日内容同步失败:",
        err?.code, err?.message, err?.stack, reason);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => refresh("retry"), RETRY_DELAY);
    } finally {
      syncing = false;
    }
  }

  function accept(snapshot) {
    const parsed = Date.parse(snapshot?.serverTime || "");
    baselineServer = Number.isFinite(parsed) ? parsed : Date.now();
    baselineMono = monotonicNow();
    if (dailyDataStale(snapshot)) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => refresh("stale"), 250);
      return;
    }
    schedule(snapshot);
  }

  function start() {
    if (initialized) return;
    initialized = true;
    LG.authority.subscribe(accept);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      const snapshot = LG.authority.snapshot();
      if (!snapshot) return;
      const estimatedDate = new Date(estimatedServerNow())
        .toISOString().slice(0, 10);
      if (estimatedDate !== snapshot.serverDate || dailyDataStale(snapshot)) {
        refresh("visible");
      } else {
        schedule(snapshot);
      }
    });
  }

  LG.dailyClock = { start };
  start();
})(window.LifeGame);
