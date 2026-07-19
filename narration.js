(function (LG) {
  const sample = { key: "__narration_sample__", text: "旁白语音已开启。" };
  let player, button, replayButton, pendingEvent, currentEvent;
  let voiceId = "female-b", lastEvent = "";
  let enabled = true, online = false, primed = false;
  let gestureListening = false, playId = 0;

  function setStatus(status, detail) {
    if (!button) return;
    button.dataset.speechState = status;
    button.title = detail || "点击试听旁白";
  }

  function eventPayload(event, state) {
    if (!event) return null;
    const body = typeof event.text === "function" ? event.text(state) : event.text;
    const quote = String(event.quote || "").replace(/[“”"]/g, "").trim();
    const text = [String(body || "").trim(), quote].filter(Boolean).join(" ");
    if (!text) return null;
    return { id: String(event.id || "event").replace(/[^a-zA-Z0-9_-]/g, "-"),
      key: `${state?.runId || ""}:${event.id || text}`, text };
  }

  function textHash(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function source(payload) {
    return `./assets/voices/events/${voiceId}/`
      + `${payload.id}-${textHash(payload.text)}.mp3`;
  }

  function voiceDetail(prefix) {
    return `${prefix}：${LG.NARRATOR_VOICE_PROFILES[voiceId].label} · 固定音频`;
  }

  function stopGestureListening() {
    if (!gestureListening) return;
    document.removeEventListener("pointerdown", primeFromGesture, true);
    document.removeEventListener("keydown", primeFromGesture, true);
    gestureListening = false;
  }

  function listenForGesture() {
    if (gestureListening || primed || !online || !enabled) return;
    document.addEventListener("pointerdown", primeFromGesture, true);
    document.addEventListener("keydown", primeFromGesture, true);
    gestureListening = true;
  }

  function markReady() {
    primed = true;
    stopGestureListening();
    setStatus("ready", voiceDetail("当前语音"));
  }

  function stop() {
    playId += 1;
    if (!player) return;
    player.pause();
    player.removeAttribute("src");
  }

  async function speak(payload, options = {}) {
    if (!online || !enabled || !payload || payload === sample) return false;
    const id = ++playId;
    const remember = options.remember !== false;
    LG.cinemaNarrator?.stop?.();
    player.pause();
    player.src = source(payload);
    player.onended = () => {
      if (id !== playId) return;
      if (remember) {
        lastEvent = payload.key;
        if (pendingEvent?.key === payload.key) pendingEvent = null;
      }
      setStatus("ready", voiceDetail("当前语音"));
    };
    player.onerror = () => {
      if (id !== playId) return;
      if (remember) pendingEvent = payload;
      setStatus("error", "固定旁白加载失败，点击重播");
      console.warn("事件固定旁白加载失败:", voiceId, payload.id);
    };
    setStatus("loading", `正在加载${LG.NARRATOR_VOICE_PROFILES[voiceId].label}`);
    try {
      await player.play();
      if (id !== playId) return player.pause();
      markReady();
      if (remember) {
        lastEvent = payload.key;
        if (pendingEvent?.key === payload.key) pendingEvent = null;
      }
      return true;
    } catch (err) {
      if (id !== playId) return false;
      if (remember) pendingEvent = payload;
      if (err?.name === "NotAllowedError") {
        primed = false;
        listenForGesture();
        setStatus("locked", "点击任意游戏按钮启用固定旁白");
      } else {
        setStatus("error", "固定旁白加载失败，点击重播");
      }
      console.warn("事件固定旁白播放失败:", err?.name, err?.message);
      return false;
    }
  }

  function primeFromGesture(event) {
    if (event?.target?.id === "narrationButton") return;
    if (!online || !enabled || primed) return;
    primed = true;
    stopGestureListening();
    speak(pendingEvent || currentEvent, {
      remember: Boolean(pendingEvent || currentEvent),
    });
  }

  function activate() {
    if (!online || !enabled) return false;
    primed = true;
    stopGestureListening();
    return speak(pendingEvent || currentEvent, {
      remember: Boolean(pendingEvent || currentEvent),
    });
  }

  function updateReplay(payload) {
    currentEvent = payload;
    if (replayButton) replayButton.hidden = !payload || !online;
  }

  function speakEvent(event, state) {
    const payload = eventPayload(event, state);
    updateReplay(payload);
    if (!online || !enabled || !payload) return;
    if (payload.key === lastEvent || payload.key === pendingEvent?.key) return;
    if (!primed) {
      pendingEvent = payload;
      setStatus("locked", "点击任意游戏按钮启用固定旁白");
      listenForGesture();
      return;
    }
    speak(payload);
  }

  LG.narration = {
    init() {
      button = document.getElementById("narrationButton");
      replayButton = document.getElementById("narrationReplayButton");
      replayButton?.addEventListener("click", activate);
      online = LG.narratorCatalog.available().length > 0;
      player = new Audio();
      player.preload = "none";
      setStatus("locked", "点击任意游戏按钮启用固定旁白");
      listenForGesture();
    },
    speakEvent,
    speakText() {
      return false;
    },
    activate,
    stop,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        stop();
        setStatus("disabled", "总声音已关闭");
        return;
      }
      setStatus(primed ? "ready" : "locked",
        primed ? voiceDetail("当前语音") : "点击任意游戏按钮启用固定旁白");
      listenForGesture();
    },
    setVoice(next) {
      if (!LG.NARRATOR_VOICE_PROFILES[next]) return;
      voiceId = next;
      stop();
      lastEvent = "";
      setStatus(primed ? "ready" : "locked",
        primed ? voiceDetail("当前语音")
          : `已选择${LG.NARRATOR_VOICE_PROFILES[voiceId].label}`);
    },
    selected: () => voiceId,
    online: () => online,
    ready: () => primed,
    source: (event, state) => source(eventPayload(event, state)),
  };
})(window.LifeGame);
