(function (LG) {
  const known = new Set();
  const silentMethods = new Set([
    "sync", "unlockAllEndings", "unlockAllCollections", "selectGender",
    "selectContentMode",
  ]);
  let initialized = false;
  let dialog;
  let message;
  let pendingSpecialCg = null;

  function completed(result) {
    return (Array.isArray(result?.cinemaAchievements)
      ? result.cinemaAchievements : []).filter((item) => item?.unlocked);
  }

  function replaceKnown(items) {
    known.clear();
    items.forEach((item) => known.add(item.id));
  }

  function apply(result, method) {
    const items = completed(result);
    if (!initialized || method === "sync" || method === "deleteSave") {
      replaceKnown(items);
      initialized = true;
      return;
    }
    const unlocked = items.filter((item) => !known.has(item.id));
    items.forEach((item) => known.add(item.id));
    if (!unlocked.length || silentMethods.has(method)) return;
    pendingSpecialCg = unlocked.find((item) =>
      item.specialCg && item.autoPlaySpecialCg !== false)?.specialCg || null;
    LG.audio?.achievement?.();
    if (!dialog || !message) return;
    const prefix = unlocked.every((item) => item.specialCg)
      ? "特殊CG解锁" : "成就完成";
    message.textContent = `${prefix}：${unlocked.map((item) =>
      item.reward > 0 ? `${item.title}（+${item.reward}成就点）` : item.title)
      .join("、")}${pendingSpecialCg ? "。关闭后播放特殊CG。" : ""}`;
    if (!dialog.open) dialog.showModal();
  }

  function openPendingSpecialCg() {
    if (!pendingSpecialCg) return;
    const id = pendingSpecialCg;
    pendingSpecialCg = null;
    window.setTimeout(() => {
      LG.cgUI?.openSpecial?.(id, LG.authority.state()?.gender || "male");
    }, 0);
  }

  LG.achievementFeedback = {
    init() {
      dialog = document.getElementById("achievementDialog");
      message = document.getElementById("achievementMessage");
      document.getElementById("closeAchievementButton")
        .addEventListener("click", () => dialog.close());
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        dialog.close();
      });
      dialog.addEventListener("close", openPendingSpecialCg);
    },
    apply,
  };
})(window.LifeGame);
