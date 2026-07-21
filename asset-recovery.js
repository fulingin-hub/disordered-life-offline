(function (LG) {
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [350, 1100];
  const RETRY_PARAM = "_asset_retry";
  let installed = false;

  function localAsset(source) {
    if (!source || /^(?:data|blob):/i.test(source)) return false;
    try {
      return new URL(source, document.baseURI).pathname.includes("/assets/");
    } catch (_) {
      return false;
    }
  }

  function retrySource(source, attempt) {
    const url = new URL(source, document.baseURI);
    if (url.protocol === "file:") return source;
    url.searchParams.set(RETRY_PARAM, `${Date.now()}-${attempt}`);
    return url.href;
  }

  function onLoad(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    delete image.dataset.assetRetrySource;
    delete image.dataset.assetRetryCount;
    delete image.dataset.assetFailed;
  }

  function onError(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    const current = image.getAttribute("src") || "";
    const original = image.dataset.assetRetrySource
      || current;
    if (!localAsset(original)) return;
    const attempt = Number(image.dataset.assetRetryCount) + 1;
    if (attempt > MAX_RETRIES) {
      if (image.dataset.assetFailed !== "true") {
        image.dataset.assetFailed = "true";
        console.warn("图片加载失败，已停止自动重试:", original);
      }
      return;
    }
    image.dataset.assetRetrySource = original;
    image.dataset.assetRetryCount = String(attempt);
    const failedSource = image.currentSrc || image.src;
    window.setTimeout(() => {
      if (!image.isConnected || (image.currentSrc || image.src) !== failedSource) return;
      image.src = retrySource(original, attempt);
    }, RETRY_DELAYS[attempt - 1]);
  }

  LG.assetRecovery = {
    retrySource,
    install() {
      if (installed) return;
      installed = true;
      document.addEventListener("load", onLoad, true);
      document.addEventListener("error", onError, true);
    },
  };
})(window.LifeGame);
