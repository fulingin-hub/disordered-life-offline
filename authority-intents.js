(function (LG) {
  const pending = new Map();
  const uncertainCodes = new Set([
    "NETWORK_ERROR", "TIMEOUT", "runtime_unavailable", "runtime_busy",
    "too_many_requests", "SERVICE_UNAVAILABLE", "INTERNAL_ERROR",
    "AUTHORITY_BUSY",
  ]);

  function createId(method) {
    try {
      if (window.crypto?.randomUUID) return `${method}:${window.crypto.randomUUID()}`;
    } catch (_) {}
    return `${method}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  function key(method, args) {
    if (args?.operationId) return `${method}:${args.operationId}`;
    try {
      return `${method}:${JSON.stringify(args || {})}`;
    } catch (_) {
      return `${method}:opaque`;
    }
  }

  LG.authorityIntents = {
    get(method, args) {
      const intentKey = key(method, args);
      let intent = pending.get(intentKey);
      if (!intent) {
        intent = {
          id: args?.operationId || createId(method),
          unknown: false,
        };
        pending.set(intentKey, intent);
      }
      return { key: intentKey, intent };
    },
    remove(intentKey) {
      pending.delete(intentKey);
    },
    isUncertain(err) {
      return Boolean(err?.retryable)
        || uncertainCodes.has(err?.code)
        || err?.message === "AUTHORITY_BUSY"
        || /http 50[234]/i.test(String(err?.message || ""));
    },
  };
})(window.LifeGame);
