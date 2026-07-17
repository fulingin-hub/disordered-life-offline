(function (LG) {
  const PREFIX = "__DL_SAVE_V1__";
  const CHUNK_SIZE = 7000;
  const IO_TIMEOUT = 1800;
  const MAX_SCAN_MESSAGES = 12000;
  const MAX_SNAPSHOTS = 400;
  let data = {};
  let loadPromise = null;
  let saveQueue = Promise.resolve();
  let scheduledSave = null;
  const dirtyKeys = new Set();
  let writesSinceFull = 9;
  let unavailable = false;

  function messagesFrom(result) {
    if (Array.isArray(result)) return result;
    return Array.isArray(result?.messages) ? result.messages : [];
  }

  function withTimeout(task, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => {
        const error = new Error(`${label} timed out`);
        error.code = "STORAGE_TIMEOUT";
        reject(error);
      }, IO_TIMEOUT);
    });
    return Promise.race([task, timeout]).finally(() => window.clearTimeout(timer));
  }

  function requireReceipt(receipt, message) {
    if (!receipt) throw Object.assign(new Error(message), { code: "STORAGE_UNAVAILABLE" });
    return true;
  }
  function parseChunk(content, order) {
    if (typeof content !== "string" || !content.startsWith(`${PREFIX}|`)) return null;
    const match = content.match(/^__DL_SAVE_V1__\|([^|]+)\|(\d+)\|(\d+)\|([\s\S]*)$/);
    if (!match) return null;
    const part = Number(match[2]);
    const total = Number(match[3]);
    if (!Number.isInteger(part) || !Number.isInteger(total)
      || part < 0 || total < 1 || part >= total || total > 200) return null;
    return { id: match[1], part, total, payload: match[4], order };
  }

  function restoredData(messages) {
    const groups = new Map();
    const restored = {};
    const resolved = new Set();
    const targetKeys = new Set([
      LG.CONFIG.stateKey, LG.CONFIG.archiveKey, LG.CONFIG.achievementKey,
      LG.CONFIG.traitKey, LG.CONFIG.collectibleKey, LG.CONFIG.tributeKey,
      LG.CONFIG.dailyTaskKey, LG.CONFIG.hiddenEndingKey,
      LG.CONFIG.blackMarketKey, LG.CONFIG.casinoKey,
    ]);
    const firstIndex = Math.max(0, messages.length - MAX_SCAN_MESSAGES);
    let snapshotCount = 0;
    for (let index = messages.length - 1; index >= firstIndex; index -= 1) {
      const message = messages[index];
      const chunk = parseChunk(message?.content, index);
      if (!chunk) continue;
      const group = groups.get(chunk.id)
        || { total: chunk.total, chunks: [], count: 0, order: index };
      if (group.total !== chunk.total) continue;
      if (typeof group.chunks[chunk.part] !== "string") group.count += 1;
      group.chunks[chunk.part] = chunk.payload;
      group.order = Math.max(group.order, index);
      groups.set(chunk.id, group);
      if (group.count !== group.total) continue;
      groups.delete(chunk.id);
      snapshotCount += 1;
      try {
        const parsed = JSON.parse(group.chunks.join(""));
        if (parsed?.version === 1 && parsed.data && typeof parsed.data === "object"
          && !Array.isArray(parsed.data)) {
          Object.entries(parsed.data).forEach(([key, value]) => {
            if (!resolved.has(key)) restored[key] = value;
          });
          break;
        }
        if (parsed?.version === 2 && parsed.values && typeof parsed.values === "object"
          && !Array.isArray(parsed.values)) {
          Object.entries(parsed.values).forEach(([key, value]) => {
            if (resolved.has(key)) return;
            restored[key] = value;
            resolved.add(key);
          });
          (Array.isArray(parsed.removed) ? parsed.removed : []).forEach((key) => {
            if (!resolved.has(key)) resolved.add(key);
          });
        }
      } catch (_) {}
      if ([...targetKeys].every((key) => resolved.has(key))
        || snapshotCount >= MAX_SNAPSHOTS) break;
    }
    Object.keys(restored).forEach((key) => {
      if (key.length > 256) delete restored[key];
    });
    return restored;
  }

  async function load() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      if (!window.dzmm?.chat?.list) return data;
      try {
        const result = await withTimeout(window.dzmm.chat.list(), "Chat save read");
        data = restoredData(messagesFrom(result));
      } catch (err) {
        unavailable = true;
        console.warn("聊天存档读取失败，使用当前页面内存:",
          err?.code, err?.message, err?.stack);
      }
      return data;
    })();
    return loadPromise;
  }

  function snapshotMessages(keys, forceFull) {
    writesSinceFull += 1;
    const fullSnapshot = forceFull || writesSinceFull >= 10;
    const values = {};
    const removed = [];
    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) values[key] = data[key];
      else removed.push(key);
    });
    const payload = JSON.stringify(fullSnapshot
      ? { version: 1, data } : { version: 2, values, removed });
    if (fullSnapshot) writesSinceFull = 0;
    const total = Math.max(1, Math.ceil(payload.length / CHUNK_SIZE));
    if (total > 200) throw Object.assign(
      new Error("存档体积超过聊天快照上限"), { code: "VALUE_TOO_LARGE" });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return Array.from({ length: total }, (_, part) => ({
      role: "assistant",
      content: `${PREFIX}|${id}|${part}|${total}|${
        payload.slice(part * CHUNK_SIZE, (part + 1) * CHUNK_SIZE)}`,
    }));
  }

  async function writeSnapshot(keys, forceFull) {
    if (unavailable || !window.dzmm?.chat?.insert) return false;
    try {
      const receipt = await withTimeout(window.dzmm.chat.insert(
        null, snapshotMessages(keys, forceFull)), "Chat save write");
      return receipt || true;
    } catch (err) {
      unavailable = true;
      console.warn("聊天存档写入失败，本次进度仅保留在当前页面:",
        err?.code, err?.message, err?.stack);
      return false;
    }
  }

  function scheduleSave() {
    if (scheduledSave) return scheduledSave;
    scheduledSave = new Promise((resolve) => window.setTimeout(resolve, 80))
      .then(() => {
        scheduledSave = null;
        const keys = [...dirtyKeys];
        dirtyKeys.clear();
        saveQueue = saveQueue.catch(() => {}).then(() => writeSnapshot(keys));
        return saveQueue;
      });
    return scheduledSave;
  }

  LG.storageChat = {
    async get(key) {
      await load();
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    async put(key, value) {
      await load();
      data[key] = value;
      dirtyKeys.add(key);
      return requireReceipt(await scheduleSave(), "聊天存储写入失败");
    },
    async remove(key) {
      await load();
      delete data[key];
      dirtyKeys.add(key);
      return requireReceipt(await scheduleSave(), "聊天存储删除失败");
    },
    async replace(values) {
      await load();
      if (scheduledSave) await scheduledSave;
      const previous = data;
      data = values && typeof values === "object" ? { ...values } : {};
      const keys = [...new Set([...Object.keys(previous), ...Object.keys(data)])];
      saveQueue = saveQueue.catch(() => {}).then(() => writeSnapshot(keys, true));
      const receipt = await saveQueue;
      if (receipt) return receipt;
      data = previous;
      throw Object.assign(new Error("旧存档写入聊天存储失败"), { code: "STORAGE_UNAVAILABLE" });
    },
  };
})(window.LifeGame);
