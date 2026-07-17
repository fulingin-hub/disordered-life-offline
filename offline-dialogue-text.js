(function (global) {
  const ids = ["feet", "humiliation", "control", "tribute", "foreign", "despair"];
  const labels = {
    feet: "媚脚", humiliation: "语言羞辱", control: "被支配",
    tribute: "贡金", foreign: "媚外", despair: "丧志",
  };
  const lastIndexes = new Map();

  function randomUnit() {
    if (!global.crypto?.getRandomValues) return Math.random();
    const value = new Uint32Array(1);
    global.crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }

  function activeBias(active) {
    if (!active || !ids.includes(active.id)) return 0;
    return Math.min(0.95, 0.55 + Math.max(0, Number(active.tier) || 0) * 0.004);
  }

  function weighted(values, random) {
    const weights = ids.map((id) => 1 + Math.max(0, Number(values?.[id]) || 0));
    const total = weights.reduce((sum, value) => sum + value, 0);
    let cursor = random() * total;
    for (let index = 0; index < ids.length; index += 1) {
      cursor -= weights[index];
      if (cursor <= 0) return ids[index];
    }
    return ids[ids.length - 1];
  }

  function chooseTrait(profile = {}, random = randomUnit) {
    const active = profile.active;
    if (active && random() < activeBias(active)) return active.id;
    return weighted(profile.values, random);
  }

  function lineFor(traitId, characterId, random = randomUnit) {
    const pool = global.OfflineDialogueBanks?.[traitId] || [];
    if (!pool.length) return "";
    const key = `${characterId || "unknown"}:${traitId}`;
    let index = Math.floor(random() * pool.length);
    if (pool.length > 1 && index === lastIndexes.get(key)) {
      index = (index + 1 + Math.floor(random() * (pool.length - 1))) % pool.length;
    }
    lastIndexes.set(key, index);
    return pool[index];
  }

  function profile() {
    const traits = global.LifeGame?.traits;
    return {
      active: traits?.active?.() || null,
      values: Object.fromEntries(ids.map((id) => [id, traits?.value?.(id) || 0])),
    };
  }

  function reply(options = {}) {
    const current = profile();
    const traitId = chooseTrait(current);
    const title = current.active?.title;
    const lead = title ? `看见你戴着“${title}”，` : "";
    return {
      traitId,
      traitLabel: labels[traitId],
      text: `${lead}${lineFor(traitId, options.characterId)}`,
    };
  }

  global.OfflineDialogueText = {
    ids, labels, activeBias, chooseTrait, lineFor, reply,
    counts() {
      return Object.fromEntries(ids.map((id) => [
        id, global.OfflineDialogueBanks?.[id]?.length || 0,
      ]));
    },
  };
})(window);
