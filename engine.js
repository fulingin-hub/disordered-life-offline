(function (LG) {
  LG.engine = {
    create(saved) {
      return saved && typeof saved === "object" ? saved : null;
    },
    current(state) {
      return state?.currentEvent || null;
    },
  };
})(window.LifeGame);
