(function (LG) {
  const presets = {
    story: { notes: [220, 277.18, 329.63, 415.3], drone: [55, 82.41],
      wave: "triangle", interval: 2100, filter: 1100, volume: 0.032 },
    world: { notes: [174.61, 220, 261.63, 349.23], drone: [43.65, 65.41],
      wave: "sine", interval: 2500, filter: 900, volume: 0.028 },
    xia: { notes: [196, 246.94, 293.66, 392], drone: [49, 73.42],
      wave: "triangle", interval: 1900, filter: 1250, volume: 0.03 },
    island: { notes: [220, 261.63, 329.63, 440], drone: [55, 82.41],
      wave: "sine", interval: 2300, filter: 1500, volume: 0.027 },
    rice: { notes: [164.81, 207.65, 246.94, 329.63], drone: [41.2, 61.74],
      wave: "triangle", interval: 1750, filter: 1050, volume: 0.03 },
    blackStreet: { notes: [73.42, 87.31, 110, 146.83], drone: [36.71, 55],
      wave: "sawtooth", interval: 2800, filter: 420, volume: 0.022 },
    sanctuary: { notes: [261.63, 329.63, 392, 523.25], drone: [65.41, 98],
      wave: "sine", interval: 3000, filter: 1800, volume: 0.024 },
    casino: { notes: [220, 277.18, 329.63, 440], drone: [55, 110],
      wave: "square", interval: 850, filter: 1350, volume: 0.018 },
    eden: { notes: [261.63, 329.63, 392, 523.25], drone: [65.41, 130.81],
      wave: "triangle", interval: 1450, filter: 2100, volume: 0.03 },
    shadow: { notes: [65.41, 77.78, 98, 130.81], drone: [32.7, 49],
      wave: "sawtooth", interval: 2400, filter: 360, volume: 0.024 },
    ending: { notes: [130.81, 164.81, 196, 261.63], drone: [32.7, 65.41],
      wave: "sine", interval: 3200, filter: 800, volume: 0.026 },
  };
  const roomScenes = {
    qin: "xia", lin: "xia", su: "xia", shen: "xia",
    restaurantCouple: "xia", agencyCouple: "xia",
    reina: "island", miki: "island", mari: "island", kaori: "island",
    japanOfficial: "blackStreet", usaOfficial: "blackStreet",
    streetThug: "blackStreet", beggar: "blackStreet",
    evelyn: "rice", claire: "rice", ruth: "rice", victoria: "rice",
    qinghe: "sanctuary", ciyun: "sanctuary", agnes: "sanctuary",
  };
  let context, master, filter, timer, scene = "story", enabled = true;
  let drones = [];

  function sceneKey(value) {
    const raw = String(value || "story");
    if (raw.startsWith("room:")) {
      const id = raw.slice(5);
      if (id.startsWith("casino")) return "casino";
      if (id.startsWith("eden")) return "eden";
      if (id.startsWith("penitentiary")) return "shadow";
      return roomScenes[id] || "world";
    }
    if (raw.startsWith("area:")) return raw.split(":")[1] || "world";
    if (raw.startsWith("eden")) return "eden";
    if (raw.startsWith("shadow") || raw.startsWith("penitentiary")) return "shadow";
    return presets[raw] ? raw : "story";
  }

  function ensureContext() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    master = context.createGain();
    filter = context.createBiquadFilter();
    filter.type = "lowpass";
    master.gain.value = 0;
    filter.connect(master);
    master.connect(context.destination);
    return context;
  }

  function stopLayer() {
    window.clearInterval(timer);
    timer = null;
    drones.forEach((oscillator) => {
      try { oscillator.stop(); } catch (_) {}
    });
    drones = [];
  }

  function note(frequency, duration, volume, wave) {
    if (!enabled || !context || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(filter);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.05);
  }

  function schedule() {
    const preset = presets[scene];
    const frequency = preset.notes[Math.floor(Math.random() * preset.notes.length)];
    note(frequency, Math.min(2.8, preset.interval / 700), preset.volume, preset.wave);
  }

  function startLayer() {
    if (!enabled || !context || context.state !== "running") return;
    stopLayer();
    const preset = presets[scene];
    filter.frequency.setTargetAtTime(preset.filter, context.currentTime, 0.4);
    master.gain.setTargetAtTime(0.75, context.currentTime, 0.6);
    preset.drone.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.008 / (index + 1);
      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start();
      drones.push(oscillator);
    });
    schedule();
    timer = window.setInterval(schedule, preset.interval);
  }

  async function unlock() {
    const audioContext = ensureContext();
    if (!audioContext || !enabled) return;
    try {
      await audioContext.resume();
      if (!timer) startLayer();
    } catch (error) {
      console.warn("背景音乐启动失败:", error.message, error.stack);
    }
  }

  LG.music = {
    init() {
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
    },
    setScene(value) {
      const next = sceneKey(value);
      if (next === scene) return;
      scene = next;
      startLayer();
    },
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        stopLayer();
        if (master && context) master.gain.setTargetAtTime(0.0001, context.currentTime, 0.1);
      } else {
        unlock();
      }
    },
    effect(frequency, duration, volume) {
      unlock().then(() => note(frequency, duration, volume, "sine"));
    },
    currentScene() { return scene; },
    sceneKey,
  };
})(window.LifeGame);
