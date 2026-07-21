(function (LG) {
  const assets = {
  "xia-modern-mage": {
    "male": "./assets/generated/career-first-xia-modern-mage-male.482b0852.webp",
    "female": "./assets/generated/career-first-xia-modern-mage-female.8b375932.webp"
  },
  "island-modern-mage": {
    "male": "./assets/generated/career-first-island-modern-mage-male.eb3b9791.webp",
    "female": "./assets/generated/career-first-island-modern-mage-female.c2da2a46.webp"
  },
  "rice-modern-mage": {
    "male": "./assets/generated/career-first-rice-modern-mage-male.000ff74d.webp",
    "female": "./assets/generated/career-first-rice-modern-mage-female.14411cdb.webp"
  },
  "element-scholar": {
    "male": "./assets/generated/career-first-element-scholar-male.f02dce9b.webp",
    "female": "./assets/generated/career-first-element-scholar-female.a098dc1e.webp"
  },
  "special-force": {
    "male": "./assets/generated/career-first-special-force-male.0878cf0b.webp",
    "female": "./assets/generated/career-first-special-force-female.3baa085d.webp"
  },
  "imperial-guard": {
    "male": "./assets/generated/career-first-imperial-guard-male.dc134eb5.webp",
    "female": "./assets/generated/career-first-imperial-guard-female.fde8c7e0.webp"
  },
  "soldier-king": {
    "male": "./assets/generated/career-first-soldier-king-male.f029b503.webp",
    "female": "./assets/generated/career-first-soldier-king-female.a5b3d1f3.webp"
  },
  "commander": {
    "male": "./assets/generated/career-first-commander-male.7ca8ab76.webp",
    "female": "./assets/generated/career-first-commander-female.feb90e56.webp"
  },
  "war-master": {
    "male": "./assets/generated/career-first-war-master-male.7c1ba10f.webp",
    "female": "./assets/generated/career-first-war-master-female.38bc1128.webp"
  },
  "mecha-master": {
    "male": "./assets/generated/career-first-mecha-master-male.bc4f3fe0.webp",
    "female": "./assets/generated/career-first-mecha-master-female.19dd89f3.webp"
  },
  "extreme-evolution": {
    "male": "./assets/generated/career-first-extreme-evolution-male.a73330ed.webp",
    "female": "./assets/generated/career-first-extreme-evolution-female.7ef29a22.webp"
  },
  "immortal-cultivator": {
    "male": "./assets/generated/career-first-immortal-cultivator-male.1ac9ffbf.webp",
    "female": "./assets/generated/career-first-immortal-cultivator-female.9cf87ab1.webp"
  }
};
  const professionAssets = {
  "first-xia-modern-mage": "xia-modern-mage",
  "first-island-modern-mage": "island-modern-mage",
  "first-rice-modern-mage": "rice-modern-mage",
  "first-element-scholar": "element-scholar",
  "first-xia-special-force": "special-force",
  "first-island-special-force": "special-force",
  "first-rice-special-force": "special-force",
  "first-special-force": "special-force",
  "first-imperial-guard": "imperial-guard",
  "first-soldier-king": "soldier-king",
  "first-commander": "commander",
  "first-war-master": "war-master",
  "first-mecha-master": "mecha-master",
  "first-extreme-evolution": "extreme-evolution",
  "first-immortal-cultivator": "immortal-cultivator"
};

  LG.careerAdvancements = {
    source(id, gender) {
      const key = professionAssets[id];
      return assets[key]?.[gender === "female" ? "female" : "male"] || null;
    },
  };
})(window.LifeGame);
