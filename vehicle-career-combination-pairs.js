(function (LG) {
  const normal = [
    "university-xia-doctor", "university-island-doctor",
    "university-rice-doctor", "scholar",
    "university-xia-agent", "university-island-agent",
    "university-rice-agent", "agent", "assassin", "mercenary",
    "adventurer", "engineer", "mechanic", "gene", "cultivator",
  ];
  const firstTier = [
    "first-xia-modern-mage", "first-island-modern-mage",
    "first-rice-modern-mage", "first-element-scholar",
    "first-xia-special-force", "first-island-special-force",
    "first-rice-special-force", "first-special-force",
    "first-imperial-guard", "first-soldier-king", "first-commander",
    "first-war-master", "first-mecha-master", "first-extreme-evolution",
    "first-immortal-cultivator", "holy-emissary", "sigil-apostle",
  ];
  const professionIds = [...normal, ...firstTier];

  professionIds.forEach((professionId) => {
    ["male", "female"].forEach((gender) => {
      const src = LG.careerPortraits.mainSource(professionId, gender);
      if (src) {
        LG.vehicleCareerCombinations.registerPaired(
          professionId, gender, src);
      }
    });
  });

  LG.vehicleCareerCombinationPairs = {
    normal: [...normal],
    firstTier: [...firstTier],
  };
})(window.LifeGame);
