(function (LG) {
  const femaleHints =
    /xiaoxiao|huihui|tingting|yaoyao|meijia|female|woman|女声|晓晓|婷婷|慧慧/i;
  let synth;
  let voice;
  let enabled = true;
  let online = false;
  let lastEvent = "";
  let pendingEvent = null;
  let primed = false;
  let speechId = 0;
  let gestureListening = false;

  function chooseVoice() {
    const voices = synth?.getVoices?.() || [];
    const chinese = voices.filter((item) =>
      String(item.lang || "").toLowerCase().startsWith("zh"));
    voice = chinese.find((item) => femaleHints.test(item.name))
      || chinese[0] || voices.find((item) => femaleHints.test(item.name)) || null;
  }

  function eventPayload(event, state) {
    if (!event?.speaker || !event?.quote) return null;
    const text = String(event.quote).replace(/[“”"]/g, "").trim();
    if (!text) return null;
    return {
      key: `${state?.runId || ""}:${event.id || text}`,
      text,
    };
  }

  function utterance(text, quiet) {
    const item = new window.SpeechSynthesisUtterance(text);
    item.lang = voice?.lang || "zh-CN";
    item.voice = voice;
    item.rate = quiet ? 2 : 0.88;
    item.pitch = quiet ? 1 : 0.78;
    item.volume = quiet ? 0.01 : 0.9;
    return item;
  }

  function speak(payload, cancelFirst) {
    const id = ++speechId;
    try {
      chooseVoice();
      synth.resume?.();
      if (cancelFirst) synth.cancel();
      const item = utterance(payload.text, false);
      item.onerror = (event) => {
        const reason = String(event?.error || "unknown");
        if (id !== speechId || reason === "interrupted" || reason === "canceled") return;
        if (lastEvent === payload.key) lastEvent = "";
        pendingEvent = payload;
        if (reason === "not-allowed") primed = false;
        console.warn("事件旁白播放失败:", reason);
      };
      synth.speak(item);
      lastEvent = payload.key;
      pendingEvent = null;
      return true;
    } catch (err) {
      console.warn("事件旁白播放失败:", err?.message, err?.stack);
      pendingEvent = payload;
      return false;
    }
  }

  function stopGestureListening() {
    if (!gestureListening) return;
    document.removeEventListener("pointerdown", primeFromGesture, true);
    document.removeEventListener("keydown", primeFromGesture, true);
    gestureListening = false;
  }

  function primeFromGesture() {
    if (!online || !enabled || primed) return;
    try {
      synth.resume?.();
      const primer = utterance("。", true);
      primer.onerror = (event) => {
        const reason = String(event?.error || "unknown");
        if (reason !== "interrupted" && reason !== "canceled") {
          console.warn("网页语音解锁失败:", reason);
        }
      };
      synth.speak(primer);
      primed = true;
      stopGestureListening();
      if (pendingEvent) speak(pendingEvent, false);
    } catch (err) {
      console.warn("网页语音解锁失败:", err?.message, err?.stack);
    }
  }

  function listenForGesture() {
    if (gestureListening || primed || !online) return;
    document.addEventListener("pointerdown", primeFromGesture, true);
    document.addEventListener("keydown", primeFromGesture, true);
    gestureListening = true;
  }

  function speakEvent(event, state) {
    if (!online || !enabled) return;
    const payload = eventPayload(event, state);
    if (!payload || payload.key === lastEvent || payload.key === pendingEvent?.key) return;
    if (!primed) {
      pendingEvent = payload;
      listenForGesture();
      return;
    }
    speak(payload, true);
  }

  LG.narration = {
    init() {
      online = !window.OfflineDialogueRuntime
        && !document.title.includes("离线版");
      synth = online ? window.speechSynthesis : null;
      if (!synth || typeof window.SpeechSynthesisUtterance !== "function") {
        online = false;
        return;
      }
      chooseVoice();
      synth.addEventListener?.("voiceschanged", chooseVoice);
      listenForGesture();
    },
    speakEvent,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        speechId += 1;
        synth?.cancel?.();
        return;
      }
      listenForGesture();
      primeFromGesture();
    },
    online() {
      return online;
    },
  };
})(window.LifeGame);
