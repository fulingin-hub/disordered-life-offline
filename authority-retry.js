(function (LG) {
  const RETRY_DELAYS = [450, 1200];

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function isTransient(err) {
    if (err?.localTimeout || err?.code === "CAPTCHA_REQUIRED") return false;
    return LG.authorityIntents.isUncertain(err);
  }

  LG.authorityRetry = {
    isTransient,
    async run(task, options = {}) {
      const retries = Math.max(0, Math.min(
        RETRY_DELAYS.length, Number(options.retries) || 0));
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await task();
        } catch (err) {
          if (attempt >= retries || !isTransient(err)) throw err;
          const delay = RETRY_DELAYS[attempt];
          LG.loader?.syncRetry?.(attempt + 1, retries, delay);
          console.warn("权威同步暂时不可用，准备重试:",
            err?.code, err?.message, `delay=${delay}ms`);
          await sleep(delay);
        }
      }
    },
  };
})(window.LifeGame);
