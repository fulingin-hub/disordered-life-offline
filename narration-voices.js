(function (LG) {
  LG.NARRATOR_VOICE_PROFILES = {
    "female-b": {
      label: "女声旁白 · 成熟魅惑",
      hints: /xiaoxiao|huihui|tingting|yaoyao|meijia|female|woman|女声|晓晓|婷婷|慧慧/i,
      rate: 0.88,
      pitch: 0.78,
    },
    "male-c": {
      label: "男声旁白 · 冷峻威严",
      hints: /yunxi|yunyang|kangkang|danny|\bmale\b|\bman\b|男声|云希|云扬|康康/i,
      rate: 0.84,
      pitch: 0.62,
    },
    "en-female": {
      label: "English Narrator · Aria",
      hints: /aria|en-US|english/i,
      rate: 0.92,
      pitch: 1,
    },
    "ja-female": {
      label: "日本語ナレーター · Nanami",
      hints: /nanami|ja-JP|japanese|日本語/i,
      rate: 0.9,
      pitch: 1,
    },
  };
})(window.LifeGame);
