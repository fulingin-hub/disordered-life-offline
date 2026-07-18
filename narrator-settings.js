(function (LG) {
  async function read(key) {
    try {
      if (LG.authorityFallback?.remoteAllowed?.() !== false) {
        const remote = (await window.dzmm?.kv?.get?.(key))?.value;
        if (remote !== undefined && remote !== null) return remote;
      }
    } catch (err) {
      console.warn("旁白设置云端读取失败:",
        err?.code, err?.message, err?.stack);
    }
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  async function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
    try {
      if (LG.authorityFallback?.remoteAllowed?.() !== false) {
        await window.dzmm?.kv?.put?.(key, value);
      }
    } catch (err) {
      console.warn("旁白设置云端保存失败:",
        err?.code, err?.message, err?.stack);
    }
  }

  LG.narratorSettings = { read, write };
})(window.LifeGame);
