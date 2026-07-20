(function (LG) {
  const variants = [
    { id: "mixed", left: "bare", right: "stocking" },
    { id: "double-bare", left: "bare", right: "bare" },
    { id: "double-stocking", left: "stocking", right: "stocking" },
  ];
  let banner;
  let leftFoot;
  let rightFoot;
  let textNode;
  let timer;

  function foot(side) {
    const node = document.createElement("span");
    node.className = `item-use-foot ${side}`;
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function randomizeFeet() {
    const variant = variants[Math.floor(Math.random() * variants.length)];
    banner.dataset.variant = variant.id;
    leftFoot.className = `item-use-foot left ${variant.left}`;
    rightFoot.className = `item-use-foot right ${variant.right}`;
  }

  function ensure() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "item-use-banner";
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    textNode = document.createElement("span");
    textNode.className = "item-use-message";
    leftFoot = foot("left");
    rightFoot = foot("right");
    banner.append(leftFoot, textNode, rightFoot);
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
    const privateTone = ["private", "special"].includes(tone);
    banner.dataset.tone = privateTone ? "private" : "normal";
    if (privateTone) randomizeFeet();
    textNode.textContent = text;
    window.clearTimeout(timer);
    banner.classList.remove("show");
    requestAnimationFrame(() => banner.classList.add("show"));
    timer = window.setTimeout(() => banner.classList.remove("show"), 3200);
  }

  LG.itemFeedback = { show };
})(window.LifeGame);
