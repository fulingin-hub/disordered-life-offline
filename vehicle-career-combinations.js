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

  LG.vehicleCareerCombinations = {
    visualOrder,
    registerExact(professionId, gender, visual, src) {
      exact[`${professionId}:${gender}:${visual}`] = src;
    },
    register(professionId, gender, src) {
      atlases[`${professionId}:${gender}`] = src;
    },
    resolve(professionId, vehicle, gender) {
      const visual = `${vehicle?.store}:${vehicle?.family}`;
      const exactSrc = exact[`${professionId}:${gender}:${visual}`];
      if (exactSrc) return { src: exactSrc, sprite: null };
      const src = atlases[`${professionId}:${gender}`];
      const index = visualOrder.indexOf(visual);
      if (!src || index < 0) return null;
      return {
        src,
        sprite: {
          columns: 3, rows: 6,
          column: index % 3,
          row: Math.floor(index / 3),
        },
      };
    },
  };
})(window.LifeGame);
