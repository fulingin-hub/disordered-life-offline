(function (LG) {
  const el = {};

  function render(run, busy, choose) {
    if (!el.root) return;
    const options = Array.isArray(run?.blessingOptions)
      ? run.blessingOptions : [];
    el.root.hidden = options.length === 0;
    el.root.replaceChildren(...options.map((id) => {
      const blessing = LG.ABYSS_DATA.blessings.find((item) => item.id === id);
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = busy;
      button.className = "abyss-blessing-choice";
      button.innerHTML = `<strong>${blessing?.name || "深渊祝福"}</strong>
        <small>${blessing?.description || "新的力量已经加入本次探索。"}</small>`;
      button.addEventListener("click", () => choose(id));
      return button;
    }));
  }

  LG.abyssBlessingUI = {
    init() {
      el.root = document.getElementById("abyssBlessings");
    },
    render,
  };
})(window.LifeGame);
