(function (LG) {
  const femaleHints =
    /xiaoxiao|huihui|tingting|yaoyao|meijia|female|woman|女声|晓晓|婷婷|慧慧/i;
  let synth;
  let voice;
  let enabled = true;
  let online = false;
  let lastEvent = "";

  function chooseVoice() {
    const voices = synth?.getVoices?.() || [];
    const chinese = voices.filter((item) =>
      String(item.lang || "").toLowerCase().startsWith("zh"));
    voice = chinese.find((item) => femaleHints.test(item.name))
      || chinese[0] || voices.find((item) => femaleHints.test(item.name)) || null;
  }

  function speakEvent(event, state) {
    const key = `${state?.runId || ""}:${event?.id || ""}`;
    if (key === lastEvent) return;
    lastEvent = key;
    if (!online || !enabled || !event?.speaker || !event?.quote) return;
    const text = String(event.quote).replace(/[“”"]/g, "").trim();
    if (!text) return;
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang || "zh-CN";
      utterance.voice = voice;
      utterance.rate = 0.88;
      utterance.pitch = 0.78;
      utterance.volume = 0.9;
      synth.cancel();
      synth.speak(utterance);
    } catch (err) {
      console.warn("事件旁白播放失败:", err?.message, err?.stack);
    }
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
    },
    speakEvent,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) synth?.cancel?.();
    },
    online() {
      return online;
    },
  };
})(window.LifeGame);
