(function (LG) {
  const genders = ["male", "female"];

  function clean(ids) {
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.filter((id) => LG.ENDINGS.some((ending) => ending.id === id)))];
  }

  LG.endingArchive = {
    normalize(saved) {
      if (Array.isArray(saved)) return { male: clean(saved), female: [] };
      return {
        male: clean(saved?.male),
        female: clean(saved?.female),
      };
    },
    add(collection, gender, endingId) {
      const universal = LG.ENDINGS.find((ending) => ending.id === endingId)?.universal;
      if (universal) {
        genders.forEach((key) => {
          if (!collection[key].includes(endingId)) collection[key].push(endingId);
        });
        return collection;
      }
      const key = genders.includes(gender) ? gender : "male";
      if (!collection[key].includes(endingId)) collection[key].push(endingId);
      return collection;
    },
    has(collection, gender, endingId) {
      if (LG.ENDINGS.find((ending) => ending.id === endingId)?.universal) {
        return genders.some((key) => collection?.[key]?.includes(endingId));
      }
      return Boolean(collection?.[gender]?.includes(endingId));
    },
    count(collection, gender) {
      return collection?.[gender]?.length || 0;
    },
    total(collection) {
      const counted = genders.reduce((sum, gender) => sum + this.count(collection, gender), 0);
      const shared = LG.ENDINGS.filter((ending) => ending.universal
        && genders.every((gender) => collection?.[gender]?.includes(ending.id))).length;
      return counted - shared;
    },
    label(gender) {
      return gender === "female" ? "女主角" : "男主角";
    },
  };
})(window.LifeGame);
