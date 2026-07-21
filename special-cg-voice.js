(function (LG) {
  let speech = null;
  const originalPlay = LG.cinemaNarrator.playEnding.bind(LG.cinemaNarrator);
  const originalStop = LG.cinemaNarrator.stop.bind(LG.cinemaNarrator);

  function status(text) {
    const node = document.getElementById("cgNarrationStatus");
    if (node) node.textContent = text;
  }

  function voice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const japanese = voices.filter((item) => /^ja(?:-|_)/i.test(item.lang)
      || /japanese|日本|nanami/i.test(item.name));
    return japanese.find((item) =>
      /female|woman|nanami|kyoko|haruka|ayumi|女/i.test(item.name))
      || japanese[0] || null;
  }

  function stop() {
    window.speechSynthesis?.cancel?.();
    speech = null;
  }

  function play(ending) {
    originalStop();
    stop();
    if (!LG.cinemaNarrator.enabled()) {
      status("旁白已关闭，请先在人生电影院中开启。");
      return;
    }
    if (!window.SpeechSynthesisUtterance || !window.speechSynthesis) {
      status("当前浏览器没有可用的日语语音。");
      return;
    }
    speech = new SpeechSynthesisUtterance(ending.japaneseNarration);
    speech.lang = "ja-JP";
    speech.rate = 0.84;
    speech.pitch = 0.94;
    speech.voice = voice();
    speech.onstart = () => status("正在播放 日本語女声。点击画面可重播。");
    speech.onend = () => status("日本語女声 播放完成。");
    speech.onerror = (event) => {
      status("日语女声播放失败，请再次点击 CG 重试。");
      console.warn("特殊CG日语旁白失败:", event?.error || "unknown");
    };
    window.speechSynthesis.speak(speech);
  }

  LG.cinemaNarrator.playEnding = function playEnding(ending) {
    if (ending?.japaneseNarration) return play(ending);
    return originalPlay(ending);
  };
  LG.cinemaNarrator.stop = function stopNarrator(message) {
    stop();
    return originalStop(message);
  };
})(window.LifeGame);
