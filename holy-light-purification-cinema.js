(function (LG) {
  const narration = "迷途知返从来都不用觉得羞耻，孩子不要害怕，人生还长着呢";
  const endingIds = [
    "healthy-life", "beautiful-life", "reject-temptation", "penitentiary-reborn",
  ];
  let dialog, layers, caption, resultText;
  let slides = [], index = 0, activeLayer = 0, timer = 0;
  let previousScene = "story", utterance = null;

  function source(id, gender) {
    return LG.CG_ASSETS?.endingSrc?.(id, gender) || null;
  }

  function positiveScenes() {
    const gender = LG.authority.state()?.gender === "female" ? "female" : "male";
    return endingIds.map((id) => source(id, gender)).filter(Boolean);
  }

  function maleVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const chinese = voices.filter((voice) => /^zh(?:-|_)/i.test(voice.lang)
      || /chinese|mandarin|中文|普通话/i.test(voice.name));
    const male = /male|man|yunxi|yunyang|yunjian|kangkang|danny|aaron|男/i;
    const female = /female|woman|xiaoxiao|huihui|yaoyao|tingting|女/i;
    return chinese.find((voice) => male.test(voice.name) && !female.test(voice.name))
      || chinese.find((voice) => male.test(voice.name)) || chinese[0] || null;
  }

  function speak() {
    if (!LG.audio?.isEnabled?.()) {
      dialog.dataset.voiceState = "disabled";
      return;
    }
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) {
      dialog.dataset.voiceState = "unavailable";
      return;
    }
    LG.narration?.stop?.();
    LG.cinemaNarrator?.stop?.();
    synth.cancel();
    utterance = new SpeechSynthesisUtterance(narration);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    utterance.pitch = 0.78;
    utterance.voice = maleVoice();
    utterance.onstart = () => { dialog.dataset.voiceState = "playing"; };
    utterance.onend = () => { dialog.dataset.voiceState = "ended"; };
    utterance.onerror = () => { dialog.dataset.voiceState = "error"; };
    synth.resume?.();
    synth.speak(utterance);
  }

  function showSlide(nextIndex) {
    if (!slides.length) return;
    index = nextIndex % slides.length;
    const incoming = layers[activeLayer ? 0 : 1];
    incoming.src = slides[index];
    incoming.alt = `净化心灵的美好场景 ${index + 1}`;
    layers[activeLayer].classList.remove("active");
    incoming.classList.add("active");
    activeLayer = activeLayer ? 0 : 1;
    caption.textContent = `净化心灵 · ${index + 1}/${slides.length}`;
  }

  function stop(restoreScene = true) {
    window.clearInterval(timer);
    timer = 0;
    window.speechSynthesis?.cancel?.();
    utterance = null;
    if (restoreScene) LG.music?.setScene?.(previousScene);
  }

  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "purification-cinema-dialog";
    dialog.innerHTML = `<header><div><span class="event-type">圣光教团 · 心灵净化</span>
      <h2>圣光的祝福</h2></div><button type="button">关闭</button></header>
      <div class="purification-stage"><img class="purification-bg" alt="圣光教团净化圣堂">
      <img class="purification-scene active" alt=""><img class="purification-scene" alt="">
      <div class="purification-radiance" aria-hidden="true"></div>
      <img class="purification-saint" alt="圣徒">
      <div class="purification-copy"><span></span><blockquote></blockquote>
      <p></p></div></div><footer><span>圣歌与净化场景正在循环</span>
      <button type="button">结束净化</button></footer>`;
    dialog.querySelector(".purification-bg").src =
      LG.CONFIG.assets.worldSanctuaryCampus || LG.CONFIG.assets.background;
    dialog.querySelector(".purification-saint").src =
      LG.CONFIG.assets.protagonistFemaleSaintSet;
    layers = [...dialog.querySelectorAll(".purification-scene")];
    caption = dialog.querySelector(".purification-copy span");
    dialog.querySelector("blockquote").textContent = narration;
    resultText = dialog.querySelector(".purification-copy p");
    dialog.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("close", stop);
    document.body.append(dialog);
  }

  function open(detail = {}) {
    if (!dialog) build();
    const currentScene = LG.music?.currentScene?.() || "story";
    stop(false);
    slides = positiveScenes();
    index = 0;
    activeLayer = 0;
    layers.forEach((layer, layerIndex) => {
      layer.classList.toggle("active", layerIndex === 0);
      layer.removeAttribute("src");
    });
    const fallback = LG.CONFIG.assets.background;
    layers[0].src = slides[0] || fallback;
    layers[0].alt = "净化心灵的美好场景 1";
    caption.textContent = slides.length ? `净化心灵 · 1/${slides.length}` : "净化心灵";
    resultText.textContent = detail.message || `已净化1000点${detail.kind === "shame"
      ? "羞耻值" : "败北值"}。`;
    previousScene = currentScene;
    LG.music?.setScene?.("purification");
    if (!dialog.open) dialog.showModal();
    if (slides.length > 1) {
      timer = window.setInterval(() => showSlide(index + 1), 4500);
    }
    speak();
  }

  LG.holyLightPurificationCinema = { open, stop };
})(window.LifeGame);
