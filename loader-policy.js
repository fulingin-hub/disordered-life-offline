(function (LG) {
  function numericMemory() {
    const value = Number(navigator.deviceMemory);
    return Number.isFinite(value) && value > 0 ? value : 8;
  }

  function connectionHints() {
    const connection = navigator.connection
      || navigator.mozConnection || navigator.webkitConnection || {};
    return {
      saveData: connection.saveData === true,
      effectiveType: String(connection.effectiveType || ""),
    };
  }

  function warmPlan(total) {
    const memory = numericMemory();
    const connection = connectionHints();
    const smallestSide = Math.min(
      Math.max(0, Number(window.innerWidth) || 0),
      Math.max(0, Number(window.innerHeight) || 0),
    );
    const phoneViewport = smallestSide > 0 && smallestSide <= 600;
    const slowNetwork = ["slow-2g", "2g"].includes(connection.effectiveType);
    const blocked = document.hidden || connection.saveData
      || memory <= 2 || slowNetwork;
    const budget = blocked ? 0 : phoneViewport || memory <= 4 ? 6 : 24;
    const limit = Math.min(Math.max(0, Number(total) || 0), budget);
    return {
      limit,
      workers: limit > 12 ? 2 : limit > 0 ? 1 : 0,
      constrained: blocked || budget <= 6,
      memory,
      saveData: connection.saveData,
      effectiveType: connection.effectiveType,
      phoneViewport,
    };
  }

  LG.loaderPolicy = { warmPlan };
})(window.LifeGame);
