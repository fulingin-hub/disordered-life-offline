(function (LG) {
  let active = null;
  let timers = [];

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  }

  function schedule(callback, delay, state) {
    timers.push(window.setTimeout(() => {
      if (active === state) callback();
    }, delay));
  }

  function finish(state) {
    if (active !== state) return;
    clearTimers();
    active = null;
    state.onFinish();
  }

  function enter(index, state, manual = false) {
    if (active !== state) return;
    clearTimers();
    state.index = index;
    state.enteredAt = performance.now();
    state.onPhase(state.phases[index], index);
    const duration = state.durations[index];
    if (index < state.phases.length - 1) {
      schedule(() => enter(index + 1, state), duration, state);
      return;
    }
    if (state.onFinalLead) {
      schedule(state.onFinalLead, manual
        ? 0
        : Math.max(0, duration - state.finalLead), state);
    }
    schedule(() => finish(state), duration, state);
  }

  function stop() {
    clearTimers();
    active = null;
  }

  function start(options) {
    stop();
    active = {
      ...options,
      index: 0,
      finalLead: Math.max(0, Number(options.finalLead) || 0),
    };
    enter(0, active);
  }

  function advance() {
    const state = active;
    if (!state) return false;
    const context = {
      phase: state.phases[state.index],
      index: state.index,
      elapsed: performance.now() - state.enteredAt,
      duration: state.durations[state.index],
    };
    if (state.canAdvance?.(context) === false) return false;
    if (state.index < state.phases.length - 1) {
      enter(state.index + 1, state, true);
    } else {
      finish(state);
    }
    return true;
  }

  LG.contributionRitualTimeline = { start, advance, stop };
})(window.LifeGame);
