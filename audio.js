(function (LG) {
  let enabled = true;

  function tone(frequency, duration, volume) {
    if (!enabled) return;
    try {
      LG.music?.effect?.(frequency, duration, volume);
    } catch (err) {
      console.warn("声音播放失败:", err.message, err.stack);
    }
  }

  LG.audio = {
    init() {
      LG.music?.init?.();
      LG.music?.setScene?.("story");
    },
    choose() {
      tone(240, 0.12, 0.05);
    },
    ending(ordinary) {
      tone(ordinary ? 520 : 150, ordinary ? 0.5 : 0.38, 0.07);
    },
    achievement() {
      tone(520, 0.18, 0.06);
      window.setTimeout(() => tone(660, 0.26, 0.06), 120);
    },
    toggle() {
      enabled = !enabled;
      LG.music?.setEnabled?.(enabled);
      LG.narration?.setEnabled?.(enabled);
      return enabled;
    },
    scene(value) {
      LG.music?.setScene?.(value);
    },
    isEnabled() {
      return enabled;
    },
  };
})(window.LifeGame);
