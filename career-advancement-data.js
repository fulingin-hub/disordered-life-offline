(function (LG) {
  const assets = {
  "xia-modern-mage": {
    "male": "./assets/generated/career-first-xia-modern-mage-male.f173e565.webp",
    "female": "./assets/generated/career-first-xia-modern-mage-female.28deec7b.webp"
  },
  "island-modern-mage": {
    "male": "./assets/generated/career-first-island-modern-mage-male.37f18ef8.webp",
    "female": "./assets/generated/career-first-island-modern-mage-female.3050ee35.webp"
  },
  "rice-modern-mage": {
    "male": "./assets/generated/career-first-rice-modern-mage-male.94a86b2d.webp",
    "female": "./assets/generated/career-first-rice-modern-mage-female.efb56fff.webp"
  },
  "element-scholar": {
    "male": "./assets/generated/career-first-element-scholar-male.4e8bb3ae.webp",
    "female": "./assets/generated/career-first-element-scholar-female.91ca612e.webp"
  },
  "special-force": {
    "male": "./assets/generated/career-first-special-force-male.75e49206.webp",
    "female": "./assets/generated/career-first-special-force-female.a88f2ce4.webp"
  },
  "xia-special-force": {
    "male": "./assets/generated/career-first-xia-special-force-male.74d4c7c8.webp",
    "female": "./assets/generated/career-first-xia-special-force-female.7fdaee1a.webp"
  },
  "island-special-force": {
    "male": "./assets/generated/career-first-island-special-force-male.eb641cb2.webp",
    "female": "./assets/generated/career-first-island-special-force-female.28e3ca6b.webp"
  },
  "rice-special-force": {
    "male": "./assets/generated/career-first-rice-special-force-male.42d3f839.webp",
    "female": "./assets/generated/career-first-rice-special-force-female.f9e8ab97.webp"
  },
  "imperial-guard": {
    "male": "./assets/generated/career-first-imperial-guard-male.fba994bf.webp",
    "female": "./assets/generated/career-first-imperial-guard-female.b6f9c0dc.webp"
  },
  "soldier-king": {
    "male": "./assets/generated/career-first-soldier-king-male.82fceeea.webp",
    "female": "./assets/generated/career-first-soldier-king-female.9495081c.webp"
  },
  "commander": {
    "male": "./assets/generated/career-first-commander-male.3fb5e22b.webp",
    "female": "./assets/generated/career-first-commander-female.6f93df5b.webp"
  },
  "war-master": {
    "male": "./assets/generated/career-first-war-master-male.43d1d6b5.webp",
    "female": "./assets/generated/career-first-war-master-female.dc43a901.webp"
  },
  "mecha-master": {
    "male": "./assets/generated/career-first-mecha-master-male.0152b66d.webp",
    "female": "./assets/generated/career-first-mecha-master-female.9ac355d8.webp"
  },
  "extreme-evolution": {
    "male": "./assets/generated/career-first-extreme-evolution-male.952db905.webp",
    "female": "./assets/generated/career-first-extreme-evolution-female.88ab3607.webp"
  },
  "immortal-cultivator": {
    "male": "./assets/generated/career-first-immortal-cultivator-male.37715b2d.webp",
    "female": "./assets/generated/career-first-immortal-cultivator-female.ed244c6f.webp"
  },
  "holy-emissary": {
    "male": "./assets/generated/career-holy-emissary-male.fff8c07d.webp",
    "female": "./assets/generated/career-holy-emissary-female.64678489.webp"
  },
  "sigil-apostle": {
    "male": "./assets/generated/career-sigil-apostle-male.f8b5b345.webp",
    "female": "./assets/generated/career-sigil-apostle-female.b0e2a641.webp"
  },
  "second-holy-inquisitor": {
    "male": "./assets/generated/career-second-holy-inquisitor-male.9724d87f.webp",
    "female": "./assets/generated/career-second-holy-inquisitor-female.5b92dc61.webp"
  },
  "second-sigil-lord": {
    "male": "./assets/generated/career-second-sigil-lord-male.a33f412d.webp",
    "female": "./assets/generated/career-second-sigil-lord-female.1353bde6.webp"
  },
  "second-king-of-kings": {
    "male": "./assets/generated/career-second-king-of-kings-male.07d8f3fc.webp",
    "female": "./assets/generated/career-second-king-of-kings-female.1bd30d23.webp"
  }
};
  const professionAssets = {
  "first-xia-modern-mage": "xia-modern-mage",
  "first-island-modern-mage": "island-modern-mage",
  "first-rice-modern-mage": "rice-modern-mage",
  "first-element-scholar": "element-scholar",
  "first-xia-special-force": "xia-special-force",
  "first-island-special-force": "island-special-force",
  "first-rice-special-force": "rice-special-force",
  "first-special-force": "special-force",
  "first-imperial-guard": "imperial-guard",
  "first-soldier-king": "soldier-king",
  "first-commander": "commander",
  "first-war-master": "war-master",
  "first-mecha-master": "mecha-master",
  "first-extreme-evolution": "extreme-evolution",
  "first-immortal-cultivator": "immortal-cultivator",
  "holy-emissary": "holy-emissary",
  "sigil-apostle": "sigil-apostle",
  "second-holy-inquisitor": "second-holy-inquisitor",
  "second-sigil-lord": "second-sigil-lord",
  "second-king-of-kings": "second-king-of-kings"
};

  LG.careerAdvancements = {
    source(id, gender) {
      const key = professionAssets[id];
      return assets[key]?.[gender === "female" ? "female" : "male"] || null;
    },
  };
})(window.LifeGame);
