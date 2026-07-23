(function (LG) {
  const DAYS_PER_YEAR = 365;
  const LIFESPAN_YEARS = 100;

  function hash(text) {
    let value = 2166136261;
    for (const char of text) {
      value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
    }
    return value;
  }

  function state() {
    return LG.authority?.state?.() || {};
  }

  function currentDay(life = state()) {
    return Math.max(
      0,
      Number(life.timeline?.currentDay) || 0,
      Number(life.elapsedDays) || 0,
      (Number(life.currentEvent?.age) || 0) * DAYS_PER_YEAR,
    );
  }

  function info(id, life = state()) {
    const offsetYears = 1 + (hash(
      `${life.runId || "default"}:character-age:${id || "unknown"}`) % 10);
    const ageDays = currentDay(life) + offsetYears * DAYS_PER_YEAR;
    const ageYears = Math.floor(ageDays / DAYS_PER_YEAR);
    return {
      id,
      ageYears,
      ageDays,
      offsetYears,
      lifespanYears: LIFESPAN_YEARS,
      alive: ageYears < LIFESPAN_YEARS,
    };
  }

  function speaker(event, life = state()) {
    const base = String(event?.speaker || "")
      .replace(/\s*·\s*\d+岁/g, "")
      .replace(/\s*·\s*寿命\d+岁/g, "")
      .trim();
    if (!base || !event?.portrait) return base;
    const data = event.character || info(event.portrait, life);
    return `${base} · ${data.ageYears}岁`;
  }

  function label(id, name, role = "", life = state()) {
    const data = info(id, life);
    return [name, role, `${data.ageYears}岁`]
      .filter(Boolean).join(" · ");
  }

  function ageLabel(timeline, fallback = 0) {
    const years = Math.max(0, Math.floor(
      Number(timeline?.ageYears ?? fallback) || 0));
    const day = Math.max(0, Math.floor(Number(timeline?.dayOfYear) || 0));
    return `${years}岁${day ? `第${day}天` : ""}`;
  }

  LG.characterDemographics = {
    currentDay,
    info,
    speaker,
    label,
    ageLabel,
    lifespanYears: LIFESPAN_YEARS,
  };
})(window.LifeGame);
