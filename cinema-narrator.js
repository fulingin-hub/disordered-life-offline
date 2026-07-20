(function (LG) {
  const VOICE_KEY = "life-cinema-narrator-v1";
  const ENABLED_KEY = "life-cinema-narrator-enabled-v1";
  const voices = LG.narratorCatalog.available();
  const el = {};
  let selected = voices[0].id;
  let preferredEnabled = true;
  let masterEnabled = true;
  let player, requestId = 0, activeVoice = "";
  function voice() {
    return voices.find((item) => item.id === selected) || voices[0];
  }
  function effectiveEnabled() {
    return preferredEnabled && masterEnabled;
  }

  function buttonLabel(button) {
    const action = button.querySelector("b");
    if (!action) return;
    if (activeVoice === button.dataset.narratorId) action.textContent = "停止";
    else action.textContent = button.dataset.narratorId === selected
      ? "已选 · 试听" : "试听并选用";
  }

  function render() {
    el.buttons.forEach((button) => {
      const active = button.dataset.narratorId === selected;
      button.classList.toggle("selected", active);
      button.classList.toggle("playing",
        button.dataset.narratorId === activeVoice);
      button.setAttribute("aria-pressed", String(active));
      buttonLabel(button);
    });
    el.current.textContent = `当前旁白：${voice().label}`;
    const enabled = effectiveEnabled();
    el.toggle.textContent = masterEnabled
      ? `旁白：${preferredEnabled ? "已开启" : "已关闭"}`
      : "旁白：总声音已关闭";
    el.toggle.dataset.state = enabled ? "ready" : "disabled";
    el.toggle.setAttribute("aria-pressed", String(preferredEnabled));
    el.toggle.disabled = !masterEnabled;
  }

  function setStatus(message) {
    el.status.textContent = message;
  }

  function stop(message) {
    requestId += 1;
    activeVoice = "";
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    render();
    if (message) setStatus(message);
  }

  function createButton(item) {
    const button = document.createElement("button");
    const copy = document.createElement("span");
    const strong = document.createElement("strong"), small = document.createElement("small");
    const action = document.createElement("b");
    button.type = "button";
    button.className = "voice-sample narrator-choice";
    button.dataset.narratorId = item.id;
    strong.textContent = item.label;
    small.textContent = item.detail;
    copy.append(strong, small);
    button.append(copy, action);
    button.addEventListener("click", () => playSample(item));
    return button;
  }

  async function playSource(src, label, endingMode, fallbackText) {
    if (!effectiveEnabled()) {
      const message = "旁白已关闭，请先在人生电影院中开启。";
      if (endingMode) el.cgStatus.textContent = message;
      else setStatus(message);
      return;
    }
    LG.narration?.stop?.();
    stop();
    const id = ++requestId;
    activeVoice = endingMode ? "" : selected;
    render();
    const loading = `正在加载 ${label}...`;
    if (endingMode) el.cgStatus.textContent = loading;
    else setStatus(loading);
    player.src = src;
    player.onended = () => {
      if (id !== requestId) return;
      activeVoice = "";
      render();
      const message = `${label} 播放完成。`;
      if (endingMode) el.cgStatus.textContent = message;
      else {
        setStatus(`${message} 正在使用该声线朗读当前事件。`);
        LG.narration?.activate?.();
      }
    };
    try {
      await player.play();
      if (id !== requestId) return player.pause();
      const message = endingMode
        ? `正在播放 ${label}。点击画面可重播。`
        : `正在播放 ${label}。`;
      if (endingMode) el.cgStatus.textContent = message;
      else setStatus(message);
    } catch (err) {
      if (id !== requestId) return;
      activeVoice = "";
      render();
      const message = endingMode
        ? "固定旁白加载失败，请再次点击 CG 重试。"
        : "试听失败，请再次点击。";
      if (endingMode) el.cgStatus.textContent = message;
      else setStatus(message);
      console.warn("固定旁白播放降级:", err?.name, err?.message);
    }
  }

  function playSample(item) {
    selected = item.id;
    LG.narratorSettings.write(VOICE_KEY, selected);
    LG.narration?.setVoice?.(selected);
    render();
    return playSource(item.sample, item.label, false);
  }

  function toggleEnabled() {
    if (!masterEnabled) return;
    preferredEnabled = !preferredEnabled;
    LG.narratorSettings.write(ENABLED_KEY, preferredEnabled);
    LG.narration?.setEnabled?.(effectiveEnabled());
    if (!preferredEnabled) stop("场外旁白与事件语音已关闭。");
    else {
      render();
      setStatus("旁白已开启；点击声线可试听。");
      LG.narration?.activate?.();
    }
  }

  LG.cinemaNarrator = {
    async init() {
      el.list = document.querySelector("[data-narrator-list]");
      el.list.replaceChildren(...voices.map(createButton));
      el.buttons = [...document.querySelectorAll("[data-narrator-id]")];
      el.current = document.querySelector("[data-narrator-current]");
      el.status = document.querySelector("[data-narrator-status]");
      el.toggle = document.getElementById("narrationButton");
      el.cgStatus = document.getElementById("cgNarrationStatus");
      player = new Audio();
      player.preload = "none";
      const [savedVoice, savedEnabled] = await Promise.all([
        LG.narratorSettings.read(VOICE_KEY),
        LG.narratorSettings.read(ENABLED_KEY),
      ]);
      if (voices.some((item) => item.id === savedVoice)) selected = savedVoice;
      if (typeof savedEnabled === "boolean") preferredEnabled = savedEnabled;
      LG.narration?.setVoice?.(selected);
      el.toggle.addEventListener("click", toggleEnabled);
      window.addEventListener("pagehide", () => stop());
      render();
      LG.narration?.setEnabled?.(effectiveEnabled());
    },
    playEnding(ending) {
      if (!ending?.id) return;
      if (ending.fixedNarration?.src) {
        return playSource(
          ending.fixedNarration.src,
          ending.fixedNarration.label || ending.title,
          true,
          ending.text,
        );
      }
      const item = voice();
      const src = `./assets/voices/endings/${item.id}/${ending.id}.mp3`;
      return playSource(src, `${item.label} · ${ending.title}`, true, ending.text);
    },
    stop,
    setMasterEnabled(next) {
      masterEnabled = Boolean(next);
      LG.narration?.setEnabled?.(effectiveEnabled());
      if (!effectiveEnabled()) stop();
      render();
    },
    selected: () => selected,
    enabled: effectiveEnabled,
  };
})(window.LifeGame);
