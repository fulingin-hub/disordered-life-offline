(function (LG) {
  const Data = LG.saveRecoveryData;
  const BACKUP_KEY = "__dl_recovery_backup_v1";
  const MARKER_KEY = "__dl_recovery_pending_v1";

  async function current() {
    const values = {};
    await Promise.all(Data.entries().map(async ([key]) => {
      const value = await LG.storageChat.get(key);
      if (value !== null && value !== undefined) values[key] = Data.clone(value);
    }));
    return values;
  }

  function transaction(values, backup) {
    const next = {
      ...values,
      [BACKUP_KEY]: backup,
      [MARKER_KEY]: { version: 1, createdAt: Date.now() },
    };
    Data.assertSize(next);
    return next;
  }

  function parsePart(message) {
    const match = typeof message?.content === "string"
      ? message.content.match(/^__DL_SAVE_V1__\|([^|]+)\|(\d+)\|(\d+)\|([\s\S]*)$/) : null;
    return match ? {
      id: match[1],
      part: Number(match[2]),
      total: Number(match[3]),
      payload: match[4],
    } : null;
  }

  async function verifySnapshot(receipt, expected) {
    const ids = Array.isArray(receipt?.ids) ? receipt.ids : [];
    if (!ids.length || !window.dzmm?.chat?.list) {
      throw Data.failure("RECOVERY_VERIFY_UNAVAILABLE", "恢复快照无法回读验证");
    }
    const result = await Data.withTimeout(
      window.dzmm.chat.list(ids), 4500, "恢复快照回读超时");
    const messages = Array.isArray(result) ? result : result?.messages || [];
    const parts = messages.map(parsePart).filter(Boolean);
    if (!parts.length || parts.some((part) =>
      part.id !== parts[0].id || part.total !== parts[0].total)) {
      throw Data.failure("RECOVERY_VERIFY_FAILED", "恢复快照分片不完整");
    }
    const chunks = [];
    parts.forEach((part) => { chunks[part.part] = part.payload; });
    if (chunks.length !== parts[0].total
      || chunks.some((part) => typeof part !== "string")) {
      throw Data.failure("RECOVERY_VERIFY_FAILED", "恢复快照分片缺失");
    }
    const parsed = JSON.parse(chunks.join(""));
    if (parsed?.version !== 1
      || JSON.stringify(parsed.data) !== JSON.stringify(expected)) {
      throw Data.failure("RECOVERY_VERIFY_FAILED", "恢复快照内容校验不一致");
    }
  }

  function updateLocalFallback(values) {
    Data.entries().forEach(([key]) => {
      try {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          localStorage.setItem(key, JSON.stringify(values[key]));
        } else localStorage.removeItem(key);
      } catch (_) {
        // Sandboxed production frames may reject localStorage.
      }
    });
  }

  async function rollbackPending() {
    const marker = await LG.storageChat?.get(MARKER_KEY);
    const backup = await LG.storageChat?.get(BACKUP_KEY);
    if (!marker) {
      if (backup !== null && backup !== undefined) {
        await LG.storageChat.remove(BACKUP_KEY);
      }
      return false;
    }
    if (!Data.plain(marker) || marker.version !== 1
      || !Number.isFinite(Number(marker.createdAt))) {
      throw Data.failure("RECOVERY_MARKER_INVALID", "恢复事务标记已损坏，无法自动回滚");
    }
    if (!Data.plain(backup)) {
      throw Data.failure("RECOVERY_BACKUP_INVALID", "恢复事务备份已损坏，无法自动回滚");
    }
    const restored = Data.clone(backup);
    delete restored[MARKER_KEY];
    delete restored[BACKUP_KEY];
    await LG.storageChat.replace(restored);
    updateLocalFallback(restored);
    if (await LG.storageChat.get(MARKER_KEY)
      || await LG.storageChat.get(BACKUP_KEY)) {
      throw Data.failure("RECOVERY_ROLLBACK_INCOMPLETE", "恢复事务回滚未完成");
    }
    return true;
  }

  async function commitPending() {
    if (!await LG.storageChat?.get(MARKER_KEY)) return false;
    await Promise.all([
      LG.storageChat.remove(MARKER_KEY),
      LG.storageChat.remove(BACKUP_KEY),
    ]);
    return true;
  }

  Object.assign(Data, {
    current, transaction, verifySnapshot,
    updateLocalFallback, rollbackPending, commitPending,
  });
})(window.LifeGame);
