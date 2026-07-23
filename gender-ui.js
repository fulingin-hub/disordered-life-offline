(function (LG) {
  const el = {};
  let onSelect;
  let choosing = false;
  let selectedGender = null;
  let selectedMode = "simulation";
  let endgameUnlocked = false;

  function syncAvailability() {
    const modes = LG.authority.snapshot()?.gameModes || {};
    const count = Math.max(0, Number(modes.simulationCompletions) || 0);
    const target = Math.max(1, Number(modes.endgameTarget) || 2);
    endgameUnlocked = modes.endgameUnlocked === true;
    selectedMode = endgameUnlocked ? "endgame" : "simulation";
    el.progress.dataset.state = endgameUnlocked ? "unlocked"
      : count > 0 ? "progress" : "new";
    el.progress.textContent = endgameUnlocked
      ? `${count}/${target} · 两段人生已经汇合，终局之门正在等你。`
      : count > 0
        ? `${count}/${target} · 第一段人生留下了回声，再走一次就会听见回应。`
        : `0/${target} · 先经历两段不同的人生，第二个结局之后会有一扇门打开。`;
  }

  function refresh() {
    el.genderButtons.forEach((button) => {
      button.setAttribute("aria-pressed",
        String(button.dataset.gender === selectedGender));
      button.disabled = choosing;
    });
    el.modeButtons.forEach((button) => {
      button.setAttribute("aria-pressed",
        String(button.dataset.gameMode === selectedMode));
      button.disabled = choosing
        || button.dataset.gameMode === "endgame" && !endgameUnlocked;
    });
    el.start.disabled = choosing || !selectedGender;
  }

  async function select() {
    if (choosing || !selectedGender) return;
    choosing = true;
    refresh();
    try {
      await onSelect(selectedGender, selectedMode);
      el.gate.hidden = true;
    } catch (err) {
      console.error("性别选择保存失败:", err.code, err.message, err.stack);
      el.status.textContent = "保存失败，请重试。";
    } finally {
      choosing = false;
      refresh();
    }
  }

  LG.genderUI = {
    init(callback) {
      onSelect = callback;
      el.gate = document.getElementById("genderGate");
      el.status = document.getElementById("genderStatus");
      el.start = document.getElementById("startLifeButton");
      el.progress = document.getElementById("gameModeProgress");
      el.genderButtons = [...el.gate.querySelectorAll("[data-gender]")];
      el.modeButtons = [...el.gate.querySelectorAll("[data-game-mode]")];
      el.genderButtons.forEach((button) => {
        button.addEventListener("click", () => {
          selectedGender = button.dataset.gender;
          refresh();
        });
      });
      el.modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          selectedMode = button.dataset.gameMode;
          refresh();
        });
      });
      el.start.addEventListener("click", select);
      refresh();
    },
    open() {
      el.status.textContent = "";
      syncAvailability();
      refresh();
      el.gate.hidden = false;
      el.genderButtons[0]?.focus();
    },
    close() {
      el.gate.hidden = true;
    },
  };
})(window.LifeGame);
