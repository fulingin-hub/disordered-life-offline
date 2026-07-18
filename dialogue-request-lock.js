(function (LG) {
  let latest = 0;
  let active = 0;

  LG.dialogueRequestLock = {
    begin() {
      if (active) return 0;
      active = ++latest;
      return active;
    },
    cancel() {
      latest += 1;
      active = 0;
    },
    current(id) {
      return id === latest;
    },
    finish(id) {
      if (active === id) active = 0;
    },
    busy() {
      return active !== 0;
    },
  };
})(window.LifeGame);
