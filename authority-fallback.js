(function (LG) {
  function detail(err) {
    return `${err?.code || ""} ${err?.message || ""}`.toLowerCase();
  }

  function isCaptcha(err) {
    const value = detail(err);
    return ["captcha_required", "http 418", "-> 418"].some(
      (token) => value.includes(token));
  }

  function captchaError() {
    const error = new Error(
      "平台需要完成人机验证，云端存档没有丢失。请完成验证后返回并重试；"
      + "当前保持只读，不会创建本地分叉进度。",
    );
    error.code = "CAPTCHA_REQUIRED";
    return error;
  }

  LG.authorityFallback = { captchaError, isCaptcha };
})(window.LifeGame);
