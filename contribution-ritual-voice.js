(function (LG) {
  const tracks = {
    offering: {
      zh: "将你的生命、精气、大脑、你有的一切都贡给吾等吧（啊哈哈、哦哦）",
      ja: "お前の命も、精気も、思考も、持てるすべてを我らに捧げなさい。あはは、そうよ。",
      src: "./assets/voices/ritual/contribution-offering-ja.mp3",
    },
    showcase: {
      zh: "嗯嗯嗯（敷衍态度）贡上精气就滚吧傻逼狗奴",
      ja: "ん、ん……どうでもいいわ。精気を捧げたら、さっさと消えなさい、この馬鹿な犬奴隷。",
      src: "./assets/voices/ritual/contribution-showcase-ja.mp3",
    },
    dismiss: {
      zh: "贡完精气就滚吧",
      ja: "精気を捧げ終えたなら、さっさと消えなさい。",
      src: "./assets/voices/ritual/contribution-dismiss-ja.mp3",
    },
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

  function japaneseVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const japanese = voices.filter((voice) => /^ja(?:-|_)/i.test(voice.lang)
      || /japanese|日本|nanami/i.test(voice.name));
    return japanese.find((voice) =>
      /female|woman|nanami|kyoko|haruka|ayumi|sayaka|女/i.test(voice.name))
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

  function fallback(dialog, track, id) {
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
    utterance.pitch = 0.9;
    utterance.volume = 1;
    const voice = japaneseVoice();
    if (voice) utterance.voice = voice;
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

  function playFixed(dialog, track, id) {
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
    media.onerror = () => fallback(dialog, track, id);
    try {
      const result = media.play();
      Promise.resolve(result).catch(() => fallback(dialog, track, id));
    } catch (_) {
      fallback(dialog, track, id);
    }
  }

  function prime(mode = "showcase") {
    if (!LG.audio?.isEnabled?.()) return false;
    const track = tracks[mode] || tracks.showcase;
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

  function speak(dialog, track, delay = 80) {
    stop();
    const id = playId;
    fallbackId = -1;
    if (!LG.audio?.isEnabled?.()) {
      dialog.dataset.voiceState = "disabled";
      return false;
    }
    LG.narration?.stop?.();
    dialog.dataset.voiceState = "queued";
    timer = window.setTimeout(() => {
      if (id === playId && dialog.open) playFixed(dialog, track, id);
    }, delay);
    return true;
  }

  function copy(mode) {
    return mode === "offering" ? tracks.offering : tracks.showcase;
  }

  LG.contributionRitualVoice = {
    textZh: tracks.showcase.zh,
    textJa: tracks.showcase.ja,
    offeringZh: tracks.offering.zh,
    offeringJa: tracks.offering.ja,
    dismissZh: tracks.dismiss.zh,
    dismissJa: tracks.dismiss.ja,
    copy,
    prime,
    play: (dialog, mode = "showcase") => speak(dialog, copy(mode)),
    dismiss: (dialog) => speak(dialog, tracks.dismiss, 20),
    stop,
  };
})(window.LifeGame);
