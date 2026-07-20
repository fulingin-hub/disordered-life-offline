(function (LG) {
  let banner;
  let textNode;
  let timer;

  function foot(kind) {
    const node = document.createElement("span");
    node.className = `item-use-foot ${kind}`;
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function ensure() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "item-use-banner";
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    textNode = document.createElement("span");
    textNode.className = "item-use-message";
    banner.append(foot("bare"), textNode, foot("stocking"));
  }

  function host() {
    const dialogs = [...document.querySelectorAll("dialog[open]")];
    return dialogs[dialogs.length - 1] || document.body;
  }

  function show(text, tone = "normal") {
    if (!text) return;
    ensure();
    const target = host();
    target.append(banner);
    const top = target.tagName === "DIALOG"
      ? target.getBoundingClientRect().top + 68 : 18;
    banner.style.top = `${Math.max(18, top)}px`;
    banner.dataset.tone = ["private", "special"].includes(tone)
      ? "private" : "normal";
    textNode.textContent = text;
    window.clearTimeout(timer);
    banner.classList.remove("show");
    requestAnimationFrame(() => banner.classList.add("show"));
    timer = window.setTimeout(() => banner.classList.remove("show"), 3200);
  }

  LG.itemFeedback = { show };
})(window.LifeGame);
