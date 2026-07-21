(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  LG.careerStatInput = {
    create(options) {
      const controls = node("div", "career-stepper");
      [["-", -1], ["+", 1]].forEach(([text, amount]) => {
        const button = node("button", "", text);
        button.type = "button";
        button.disabled = options.disabled
          || (amount < 0 && !options.canDecrease);
        button.addEventListener("click", () => options.onAdjust(amount));
        controls.append(button);
      });
      const input = node("input", "career-custom-points");
      input.type = "number";
      input.min = "0";
      input.max = String(Math.max(0, options.max || 0));
      input.step = "1";
      input.inputMode = "numeric";
      input.placeholder = "自定义";
      input.setAttribute("aria-label", `${options.label}自定义加点`);
      const apply = node("button", "career-apply-points", "加点");
      apply.type = "button";
      apply.disabled = options.disabled;
      const applyValue = () => {
        const amount = Math.max(0, Math.min(Number(input.max),
          Math.floor(Number(input.value) || 0)));
        input.value = amount ? String(amount) : "";
        options.onApply(amount);
      };
      apply.addEventListener("click", applyValue);
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        applyValue();
      });
      controls.append(input, apply);
      return controls;
    },
  };
})(window.LifeGame);
