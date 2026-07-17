(function (LG) {
  let context = null;
  let enabled = true;

  function tone(frequency, duration, volume) {
    if (!enabled) return;
    try {
      context = context || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch (err) {
      console.warn("声音播放失败:", err.message, err.stack);
    }
  }

  LG.audio = {
    choose() {
      tone(240, 0.12, 0.05);
    },
    ending(ordinary) {
      tone(ordinary ? 520 : 150, ordinary ? 0.5 : 0.38, 0.07);
    },
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    isEnabled() {
      return enabled;
    },
  };
})(window.LifeGame);
