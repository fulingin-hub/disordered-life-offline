(function (LG) {
  let active = null;
  let delayTimer = 0;
  let repeatTimer = 0;
  let suppressClickUntil = 0;

  function clearTimers() {
    window.clearTimeout(delayTimer);
    window.clearTimeout(repeatTimer);
    delayTimer = 0;
    repeatTimer = 0;
  }

  function stop() {
    if (active?.repeated) suppressClickUntil = Date.now() + 500;
    active = null;
    clearTimers();
  }

  function repeat() {
    if (!active) return;
    active.repeated = true;
    active.action();
    repeatTimer = window.setTimeout(repeat, 85);
  }

  function bind(button, action) {
    button.addEventListener("pointerdown", (event) => {
      if (button.disabled || (event.pointerType === "mouse" && event.button !== 0)) {
        return;
      }
      stop();
      active = { action, repeated: false };
      delayTimer = window.setTimeout(repeat, 360);
    });
    button.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      action();
    });
  }

  document.addEventListener("pointerup", stop, true);
  document.addEventListener("pointercancel", stop, true);
  window.addEventListener("blur", stop);
  document.addEventListener("contextmenu", (event) => {
    if (active) event.preventDefault();
  }, true);

  LG.traitHoldControls = { bind, stop };
})(window.LifeGame);
