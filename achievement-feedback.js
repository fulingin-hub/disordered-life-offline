(function (LG) {
  const known = new Set();
  const silentMethods = new Set([
    "sync", "unlockAllEndings", "unlockAllCollections", "selectGender",
  ]);
  let initialized = false;
  let dialog;
  let message;

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
    LG.audio?.achievement?.();
    if (!dialog || !message) return;
    message.textContent = `成就完成：${
      unlocked.map((item) => item.title).join("、")}`;
    if (!dialog.open) dialog.showModal();
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
    },
    apply,
  };
})(window.LifeGame);
