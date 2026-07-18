(function (LG) {
  let remoteBlocked = false;

  function detail(err) {
    return `${err?.code || ""} ${err?.message || ""}`.toLowerCase();
  }

  function isCaptcha(err) {
    const value = detail(err);
    return ["captcha_required", "http 418", "-> 418"].some(
      (token) => value.includes(token));
  }

  function blockRemote(err) {
    if (isCaptcha(err)) remoteBlocked = true;
    return remoteBlocked;
  }

  function remoteAllowed() {
    return !remoteBlocked;
  }

  function captchaError() {
    const error = new Error(
      "平台需要完成人机验证，云端存档没有丢失。请完成验证后返回并重试；"
      + "为避免覆盖存档，当前不会创建本地空白进度。",
    );
    error.code = "CAPTCHA_REQUIRED";
    return error;
  }

  function mode(err) {
    const value = detail(err);
    if (isCaptcha(err)) return "session";
    if ([
      "forbidden_dev_mode",
      "torbidden_dev_mode",
      "function_not_published",
      "function_not_found",
      "function_unavailable",
    ].some((token) => value.includes(token))) return "permanent";
    if ([
      "runtime_unavailable",
      "http 504",
      "读取权威存档超时",
    ].some((token) => value.includes(token))) return "transient";
    return null;
  }

  function retryError(err) {
    const error = new Error(
      "权威服务暂时繁忙，本次未切换本地存档，请再次点击保存。",
    );
    error.code = err?.code || "RUNTIME_RETRY";
    return error;
  }

  function shouldRetry(err, hasSnapshot) {
    return mode(err) === "transient" && hasSnapshot;
  }

  LG.authorityFallback = {
    blockRemote, captchaError, isCaptcha, mode, remoteAllowed,
    retryError, shouldRetry,
  };
})(window.LifeGame);
