(function (LG) {
  let environment;

  async function enabled() {
    if (!environment) {
      environment = (async () => {
        try {
          const user = await window.dzmm?.user?.info?.();
          return Boolean(user?.id) && user.token === null;
        } catch (err) {
          console.warn("预览环境识别失败:",
            err?.code, err?.message, err?.stack);
          return false;
        }
      })();
    }
    return environment;
  }

  LG.previewProfile = { enabled };
})(window.LifeGame);
