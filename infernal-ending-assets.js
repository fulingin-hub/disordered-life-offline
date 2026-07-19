(function (LG) {
  const assets = {
    male: {
      "infernal-seven-apostles":
        "./assets/generated/cg-ending-infernal-seven-apostles-male.44e456db.webp",
      "infernal-fallen":
        "./assets/generated/cg-ending-infernal-fallen-male.10797463.webp",
      "infernal-really-won":
        "./assets/generated/cg-ending-infernal-really-won-male.a01fed08.webp",
      "infernal-mercenary":
        "./assets/generated/cg-ending-infernal-mercenary-male.7c1302ae.webp",
      "infernal-cleanse":
        "./assets/generated/cg-ending-infernal-cleanse-male.d22ffcee.webp",
    },
    female: {
      "infernal-seven-apostles":
        "./assets/generated/cg-ending-infernal-seven-apostles-female.c5941502.webp",
      "infernal-fallen":
        "./assets/generated/cg-ending-infernal-fallen-female.b1ffbae5.webp",
      "infernal-really-won":
        "./assets/generated/cg-ending-infernal-really-won-female.85a56b30.webp",
      "infernal-mercenary":
        "./assets/generated/cg-ending-infernal-mercenary-female.202f0dba.webp",
      "infernal-cleanse":
        "./assets/generated/cg-ending-infernal-cleanse-female.2459fce4.webp",
    },
  };
  Object.assign(LG.CG_ASSETS.genderEndings.male, assets.male);
  Object.assign(LG.CG_ASSETS.genderEndings.female, assets.female);
})(window.LifeGame);
