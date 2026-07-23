(function (LG) {
  const achievementNames = {
    "saint-endures": "圣者永存",
    "spared-priestess": "放过女司祭",
    "priestess-trick": "女祭司的小把戏",
    "seven-desires-pet": "七大欲的宠奴",
    they: "祂们",
  };

  LG.holyLight = {
    data() {
      return LG.authority.snapshot()?.economy?.saint || {
        joined: false, baptized: false, blessing: false,
        priestessTalks: 0, daily: { tasks: [] }, weekly: {}, achievements: [],
      };
    },
    achievementNames,
    has(id) {
      return this.data().achievements?.includes(id);
    },
    priestessGalleryUnlocked() {
      return this.has("spared-priestess")
        || LG.infernalChurch?.data?.().achievements?.includes("puppet");
    },
  };
})(window.LifeGame);
