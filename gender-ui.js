(function (LG) {
  const el = {};
  let onSelect;
  let choosing = false;

  async function select(gender) {
    if (choosing) return;
    choosing = true;
    el.buttons.forEach((button) => { button.disabled = true; });
    try {
      await onSelect(gender);
      el.gate.hidden = true;
    } catch (err) {
      console.error("性别选择保存失败:", err.code, err.message, err.stack);
      el.status.textContent = "保存失败，请重试。";
    } finally {
      choosing = false;
      el.buttons.forEach((button) => { button.disabled = false; });
    }
  }

  LG.genderUI = {
    init(callback) {
      onSelect = callback;
      el.gate = document.getElementById("genderGate");
      el.status = document.getElementById("genderStatus");
      el.buttons = [...el.gate.querySelectorAll("[data-gender]")];
      el.buttons.forEach((button) => {
        button.addEventListener("click", () => select(button.dataset.gender));
      });
    },
    open() {
      el.status.textContent = "";
      el.gate.hidden = false;
      el.buttons[0]?.focus();
    },
    close() {
      el.gate.hidden = true;
    },
  };
})(window.LifeGame);
