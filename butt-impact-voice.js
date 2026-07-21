(function (LG) {
  const track = {
    zh: "傻逼丧志狗奴贱畜厕奴马桶（哦哦哦啊啊嗯哼哦）给我吃干净！呵～",
    ja: "このクソ馬鹿、意気地なしの犬奴隷、卑しい家畜、便所奴隷、便器め。"
      + "おお、おお、おお、ああ、ああ、んっ、ふん、おお……"
      + "全部きれいに食べなさい。はぁ。",
    src: "./assets/voices/ritual/butt-impact-ja.mp3",
  };
  let player = null, utterance = null, timer = 0, playId = 0;
  let fallbackId = -1;

  function audio() {
    if (!player) {
      player = new Audio();
      player.preload = "auto";
    }
    return player;
  }

  function voice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const japanese = voices.filter((item) => /^ja(?:-|_)/i.test(item.lang)
      || /japanese|日本|nanami/i.test(item.name));
    return japanese.find((item) =>
      /female|woman|nanami|kyoko|haruka|ayumi|sayaka|女/i.test(item.name))
      || japanese[0] || null;
  }

  function stop() {
    playId += 1;
    window.clearTimeout(timer);
    window.speechSynthesis?.cancel?.();
    if (player) {
      player.pause();
      player.onplay = null;
      player.onended = null;
      player.onerror = null;
    }
    utterance = null;
  }

  function fallback(dialog, id) {
    if (id !== playId || fallbackId === id || !dialog.open) return false;
    fallbackId = id;
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) {
      dialog.dataset.voiceState = "unavailable";
      return false;
    }
    utterance = new SpeechSynthesisUtterance(track.ja);
    utterance.lang = "ja-JP";
    utterance.rate = 0.78;
    utterance.pitch = 0.92;
    utterance.volume = 1;
    utterance.voice = voice();
    utterance.onstart = () => {
      dialog.dataset.voiceState = "playing";
      dialog.dataset.voiceSource = "system";
    };
    utterance.onend = () => {
      if (id === playId) dialog.dataset.voiceState = "ended";
    };
    utterance.onerror = () => {
      if (id === playId) dialog.dataset.voiceState = "error";
    };
    synth.resume?.();
    synth.speak(utterance);
    return true;
  }

  function prime() {
    if (!LG.audio?.isEnabled?.()) return false;
    const media = audio();
    media.src = track.src;
    media.volume = 0;
    try {
      Promise.resolve(media.play()).then(() => {
        media.pause();
        media.currentTime = 0;
        media.volume = 1;
      }).catch(() => { media.volume = 1; });
    } catch (_) {
      media.volume = 1;
    }
    return true;
  }

  function play(dialog, delay = 10000) {
    stop();
    const id = playId;
    fallbackId = -1;
    dialog.dataset.voiceDelay = String(delay);
    if (!LG.audio?.isEnabled?.()) {
      dialog.dataset.voiceState = "disabled";
      return false;
    }
    LG.narration?.stop?.();
    dialog.dataset.voiceState = "queued";
    timer = window.setTimeout(() => {
      if (id !== playId || !dialog.open) return;
      const media = audio();
      media.pause();
      media.src = track.src;
      media.currentTime = 0;
      media.volume = 1;
      media.onplay = () => {
        if (id !== playId) return;
        dialog.dataset.voiceState = "playing";
        dialog.dataset.voiceSource = "fixed";
      };
      media.onended = () => {
        if (id === playId) dialog.dataset.voiceState = "ended";
      };
      media.onerror = () => fallback(dialog, id);
      try {
        Promise.resolve(media.play()).catch(() => fallback(dialog, id));
      } catch (_) {
        fallback(dialog, id);
      }
    }, delay);
    return true;
  }

  LG.buttImpactVoice = {
    textZh: track.zh,
    textJa: track.ja,
    source: track.src,
    prime,
    play,
    stop,
  };
})(window.LifeGame);
