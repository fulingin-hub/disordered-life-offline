(function (LG) {
  const KEY_PROPS = [
    ["stateKey", "当前人生"], ["archiveKey", "人生结局"],
    ["achievementKey", "路线成就"], ["traitKey", "角色属性"],
    ["collectibleKey", "收藏道具"], ["tributeKey", "贡金记录"],
    ["dailyTaskKey", "每日任务"], ["hiddenEndingKey", "隐藏结局"],
    ["blackMarketKey", "黑市进度"], ["casinoKey", "赌场进度"],
  ];
  const RETRYABLE = new Set([
    "NETWORK_ERROR", "TIMEOUT", "INTERNAL_ERROR", "SERVICE_UNAVAILABLE", "RATE_LIMITED",
  ]);
  const MAX_SNAPSHOT_CHARS = 1250000;

  const entries = () => KEY_PROPS.map(([prop, label]) => [LG.CONFIG[prop], label, prop]);
  const plain = (value) => Boolean(value && typeof value === "object"
    && !Array.isArray(value));
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function failure(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function withTimeout(task, ms, message) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(failure("STORAGE_TIMEOUT", message)), ms);
    });
    return Promise.race([task, timeout]).finally(() => window.clearTimeout(timer));
  }

  async function readLegacy(key) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await withTimeout(window.dzmm.kv.get(key), 3500, "旧存档读取超时");
        return result?.value ?? null;
      } catch (err) {
        if (err?.code === "KEY_NOT_FOUND") return null;
        if (!(err?.retryable === true || RETRYABLE.has(err?.code)) || attempt === 1) throw err;
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
    }
    return null;
  }

  async function scan(onProgress) {
    const values = {};
    const failures = [];
    const keys = entries();
    let completed = 0;
    await Promise.all(keys.map(async ([key, label]) => {
      try {
        const value = await readLegacy(key);
        if (value !== null && value !== undefined) values[key] = value;
      } catch (err) {
        failures.push({ label, err });
        console.error(`旧存档读取失败（${label}）:`,
          err?.code, err?.message, err?.stack);
      } finally {
        completed += 1;
        onProgress(completed, keys.length, label);
      }
    }));
    if (failures.length) throw failure("LEGACY_READ_INCOMPLETE", "旧存档读取不完整");
    return values;
  }

  function validateState(state) {
    const version = Number(state?.version);
    if (!plain(state) || !Number.isInteger(version) || version < 1
      || version > LG.CONFIG.version || !plain(state.stats)
      || !Array.isArray(state.tags) || !Array.isArray(state.history)) {
      throw failure("INVALID_LEGACY_STATE", "旧版人生进度格式不兼容");
    }
    const trial = LG.engine.create(clone(state));
    if (!trial.endingId && !LG.engine.current(trial)) {
      throw failure("INVALID_LEGACY_STATE", "旧版人生进度无法定位到有效事件");
    }
  }

  function assertSize(values) {
    const payload = JSON.stringify(values);
    if (payload.length > MAX_SNAPSHOT_CHARS) {
      throw failure("RECOVERY_TOO_LARGE", "旧存档体积过大，无法安全写入恢复快照");
    }
    return payload.length;
  }

  function prepare(input) {
    if (!plain(input)) throw failure("INVALID_LEGACY_DATA", "旧存档不是有效的数据对象");
    const source = clone(input);
    const values = {};
    const warnings = [];
    const state = source[LG.CONFIG.stateKey];
    if (state !== undefined) {
      validateState(state);
      values[LG.CONFIG.stateKey] = state;
    }
    const archive = source[LG.CONFIG.archiveKey];
    if (archive !== undefined) {
      values[LG.CONFIG.archiveKey] = LG.endingArchive.normalize(archive);
    }
    entries().slice(2).forEach(([key, label, prop]) => {
      const value = source[key];
      if (value === undefined) return;
      if (!plain(value)) {
        warnings.push(`${label}格式异常，已跳过`);
        return;
      }
      if (prop === "dailyTaskKey" && Array.isArray(value.tasks)) {
        value.tasks = value.tasks.filter((task) => plain(task) && typeof task.id === "string");
      }
      values[key] = value;
    });
    if (!Object.keys(values).length) throw failure("EMPTY_LEGACY_DATA", "旧存档没有可恢复内容");
    return { values, warnings, size: assertSize(values) };
  }

  function summaryItems(values, warnings) {
    const state = values[LG.CONFIG.stateKey];
    const archive = values[LG.CONFIG.archiveKey];
    const archiveCount = Array.isArray(archive) ? archive.length
      : Object.values(archive || {}).reduce((sum, list) =>
        sum + (Array.isArray(list) ? list.length : 0), 0);
    const age = state
      ? LG.engine.current(state)?.age || LG.events?.[state.cursor]?.age || 0 : 0;
    return [
      ["找到数据", `${Object.keys(values).length}/${entries().length} 组`],
      ["人生进度", state ? `${age} 岁 · ${state.history.length} 次选择` : "未记录"],
      ["人生结局", `${archiveCount} 个结局`],
      ["跨周目属性", `${Math.max(0, Number(values[LG.CONFIG.traitKey]?.points) || 0)} 点`],
      ["已完成人生", `${Math.max(0,
        Number(values[LG.CONFIG.casinoKey]?.completedLives) || 0)} 次`],
      ["兼容性预检", warnings.length ? `${warnings.length} 项已安全跳过` : "通过"],
    ];
  }

  LG.saveRecoveryData = {
    scan, prepare, summaryItems,
    entries, plain, clone, failure, withTimeout, assertSize,
  };
})(window.LifeGame);
