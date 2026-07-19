(function (LG) {
  const catalog = {
    "female-b": {
      label: "女声旁白 · 成熟魅惑",
      detail: "御姐女声，低音慢速，温暖而有距离感",
      sample: "./assets/voices/samples/voice-b-mature-seductive-v3.mp3",
    },
    "male-c": {
      label: "男声旁白 · 冷峻威严",
      detail: "成熟男声，更低更慢，适合庄重或压迫感结局",
      sample: "./assets/voices/samples/male-c-commanding.mp3",
    },
    "en-female": {
      label: "English Narrator · Aria",
      detail: "Packaged English narration for offline events and endings",
      sample: "./assets/voices/samples/en-female.mp3",
    },
    "ja-female": {
      label: "日本語ナレーター · Nanami",
      detail: "オフラインのイベントとエンディング用固定音声",
      sample: "./assets/voices/samples/ja-female.mp3",
    },
  };

  function offline() {
    return Boolean(window.OfflineDialogueRuntime)
      || document.title.includes("离线版");
  }

  function locale() {
    return window.OfflineI18n?.locale?.() || "zh-CN";
  }

  LG.narratorCatalog = {
    available() {
      const ids = !offline() || locale() === "zh-CN"
        ? ["female-b", "male-c"]
        : locale() === "ja" ? ["ja-female"] : ["en-female"];
      return ids.map((id) => ({ id, ...catalog[id] }));
    },
    has(id) {
      return this.available().some((item) => item.id === id);
    },
    offline,
    locale,
  };
})(window.LifeGame);
