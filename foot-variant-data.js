(function (LG) {
  const sources = {
    bare: "./assets/generated/gallery-victoria-barefoot-press-v2.93457ae8.webp",
    stocking:
      "./assets/generated/gallery-restaurant-couple-female-tights-stomp.456bcb2a.webp",
  };
  const ids = ["original", "bare", "stocking"];

  function normalize(id) {
    return ids.includes(id) ? id : "original";
  }

  function pick() {
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function apply(node, id, originalSource = "") {
    const variant = normalize(id);
    node.classList.remove(...ids.map((item) => `foot-${item}`));
    node.classList.add(`foot-${variant}`);
    node.dataset.footVariant = variant;
    const source = variant === "original" ? originalSource : sources[variant];
    node.style.backgroundImage = source ? `url("${source}")` : "";
    return variant;
  }

  LG.footVariants = { ids, normalize, pick, apply };
})(window.LifeGame);
