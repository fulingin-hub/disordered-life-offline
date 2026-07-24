(function (LG) {
  const visualOrder = [
    "points:horse", "points:wolf", "points:tiger",
    "points:otherworld-male", "points:otherworld-female",
    "achievement:lost-griffin", "achievement:reborn-phoenix",
    "coupons:shadow-bike", "coupons:mech-horse", "coupons:mech-tiger",
    "coupons:mech-trex", "personality:unicorn", "personality:pegasus",
    "personality:heaven-dragon", "personality:xuanwu",
    "reputation:blood-wolf", "reputation:blood-tiger",
    "reputation:blood-dragon",
  ];
  const atlases = {};
  const exact = {};

  function visualKey(vehicle) {
    const aliases = {
      "points-otherworld-male": "otherworld-male",
      "points-otherworld-female": "otherworld-female",
      "achievement-lost-griffin": "lost-griffin",
      "achievement-reborn-phoenix": "reborn-phoenix",
    };
    return `${vehicle?.store}:${aliases[vehicle?.id] || vehicle?.family}`;
  }

  LG.vehicleCareerCombinations = {
    visualOrder,
    registerExact(professionId, gender, visual, src) {
      exact[`${professionId}:${gender}:${visual}`] = src;
    },
    register(professionId, gender, src) {
      atlases[`${professionId}:${gender}`] = src;
    },
    resolve(professionId, vehicle, gender) {
      const visual = visualKey(vehicle);
      const exactSrc = exact[`${professionId}:${gender}:${visual}`];
      if (exactSrc) return { src: exactSrc, sprite: null };
      const src = atlases[`${professionId}:${gender}`];
      const index = visualOrder.indexOf(visual);
      if (!src || index < 0) return null;
      return {
        src,
        sprite: {
          columns: 6, rows: 3,
          column: index % 6,
          row: Math.floor(index / 6),
        },
      };
    },
  };
})(window.LifeGame);
