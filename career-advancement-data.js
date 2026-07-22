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
    "male": "./assets/generated/career-first-rice-modern-mage-male.000ff74d.webp",
    "female": "./assets/generated/career-first-rice-modern-mage-female.14411cdb.webp"
  },
  "element-scholar": {
    "male": "./assets/generated/career-first-element-scholar-male.f02dce9b.webp",
    "female": "./assets/generated/career-first-element-scholar-female.a098dc1e.webp"
  },
  "special-force": {
    "male": "./assets/generated/career-first-special-force-male.204176e1.webp",
    "female": "./assets/generated/career-first-special-force-female.a88f2ce4.webp"
  },
  "xia-special-force": {
    "male": "./assets/generated/career-first-xia-special-force-male.4cafe074.webp",
    "female": "./assets/generated/career-first-xia-special-force-female.46668875.webp"
  },
  "island-special-force": {
    "male": "./assets/generated/career-first-island-special-force-male.454410de.webp",
    "female": "./assets/generated/career-first-island-special-force-female.e53d36b2.webp"
  },
  "rice-special-force": {
    "male": "./assets/generated/career-first-rice-special-force-male.480435be.webp",
    "female": "./assets/generated/career-first-rice-special-force-female.2a34c542.webp"
  },
  "imperial-guard": {
    "male": "./assets/generated/career-first-imperial-guard-male.dc134eb5.webp",
    "female": "./assets/generated/career-first-imperial-guard-female.fde8c7e0.webp"
  },
  "soldier-king": {
    "male": "./assets/generated/career-first-soldier-king-male.82fceeea.webp",
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
    "male": "./assets/generated/career-first-extreme-evolution-male.952db905.webp",
    "female": "./assets/generated/career-first-extreme-evolution-female.7ef29a22.webp"
  },
  "immortal-cultivator": {
    "male": "./assets/generated/career-first-immortal-cultivator-male.1ac9ffbf.webp",
    "female": "./assets/generated/career-first-immortal-cultivator-female.ed244c6f.webp"
  },
  "holy-emissary": {
    "male": "./assets/generated/career-holy-emissary-male.576e0b44.webp",
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
  "second-sigil-lord": "second-sigil-lord"
};

  LG.careerAdvancements = {
    source(id, gender) {
      const key = professionAssets[id];
      return assets[key]?.[gender === "female" ? "female" : "male"] || null;
    },
  };
})(window.LifeGame);
