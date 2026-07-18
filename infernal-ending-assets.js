(function (LG) {
  const assets = {
    male: {
      "infernal-seven-apostles":
        "./assets/generated/cg-ending-infernal-seven-apostles-male.44e456db.webp",
      "infernal-fallen":
        "./assets/generated/protagonist-male-infernal-set.00703f80.webp",
      "infernal-really-won":
        "./assets/generated/cg-ending-ordinary.ce0f83f8.webp",
      "infernal-mercenary":
        "./assets/generated/cg-ending-paradise-apex-male.1a7cd958.webp",
      "infernal-cleanse":
        "./assets/generated/cg-ending-saint-male.44da103f.webp",
    },
    female: {
      "infernal-seven-apostles":
        "./assets/generated/cg-ending-infernal-seven-apostles-female.c5941502.webp",
      "infernal-fallen":
        "./assets/generated/protagonist-female-infernal-set.77399fe3.webp",
      "infernal-really-won":
        "./assets/generated/cg-ending-ordinary-female.7df91e3b.webp",
      "infernal-mercenary":
        "./assets/generated/cg-ending-paradise-apex-female.fc8422ad.webp",
      "infernal-cleanse":
        "./assets/generated/cg-ending-saint-female.55adfac7.webp",
    },
  };
  Object.assign(LG.CG_ASSETS.genderEndings.male, assets.male);
  Object.assign(LG.CG_ASSETS.genderEndings.female, assets.female);
})(window.LifeGame);
