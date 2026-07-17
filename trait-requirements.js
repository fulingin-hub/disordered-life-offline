(function (LG) {
  function evaluateSingle(requirement, state) {
    if (requirement.stat) {
      const label = LG.CONFIG.statMeta[requirement.stat] || requirement.stat;
      const minimum = Math.max(0, Number(requirement.min) || 0);
      return {
        met: (Number(state?.stats?.[requirement.stat]) || 0) >= minimum,
        text: `需要 ${label} ${minimum}点`,
      };
    }
    const trait = LG.traits.all().find((item) => item.id === requirement.trait);
    const baseMinimum = Math.max(0, Number(requirement.min) || 0);
    const reduction = LG.equipment.requirementReduction(state);
    const minimum = Math.max(0, baseMinimum - reduction);
    if (!trait) return { met: false, text: "需要未知属性" };
    return {
      met: trait.value >= minimum,
      text: reduction
        ? `需要 ${trait.label} ${minimum}点（羞耻减免${baseMinimum - minimum}）`
        : `需要 ${trait.label} ${minimum}点`,
    };
  }

  LG.traitRequirements = {
    evaluate(requirement, state) {
      if (!requirement) return { met: true, text: "" };
      if (!Array.isArray(requirement.all)) return evaluateSingle(requirement, state);
      const results = requirement.all.map((item) => evaluateSingle(item, state));
      return {
        met: results.every((item) => item.met),
        text: results.map((item) => item.text).join("、"),
      };
    },
    isMet(requirement, state) {
      return this.evaluate(requirement, state).met;
    },
  };
})(window.LifeGame);
