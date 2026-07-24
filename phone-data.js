(function (LG) {
  const validAsset = (value) => typeof value === "string"
    && (/^\.\/assets\/[A-Za-z0-9_./-]+$/.test(value)
      || /^https?:\/\//.test(value));
  const gender = () => LG.authority.state()?.gender === "female"
    ? "female" : "male";

  const apps = [
    ["simulation", "模拟人生", "background"],
    ["movies", "电影播放器", "playerRoom"],
    ["contacts", "通讯录", "infernalChurchPriestess"],
    ["music", "音乐播放器", "goldenHorizonSi"],
    ["gallery", "相册", "careerFallenSaintMindlessFemale"],
    ["news", "新闻资讯", "goldenHorizonCapital"],
    ["system", "系统", null],
  ].map(([id, label, asset]) => ({ id, label, asset }));

  const tracks = [
    ["story", "城市夜话", "故事"],
    ["world", "界舟航线", "世界"],
    ["xia", "夏国街景", "城市"],
    ["sanctuary", "圣光回廊", "圣域"],
    ["infernal", "魔境低语", "异界"],
    ["eden", "黄金乐园", "乐园"],
  ].map(([id, title, album]) => ({ id, title, album }));

  function careerGallery() {
    const data = LG.career.data();
    return (data.professionDefinitions || [])
      .filter((item) => item.unlocked)
      .map((item) => ({
        id: `career-${item.id}`,
        title: item.name,
        subtitle: "职业立绘",
        src: LG.careerPortraits.previewSource(item.id, gender(),
          LG.careerPortraits.category(item.id)),
      })).filter((item) => validAsset(item.src));
  }

  function companionGallery() {
    const state = LG.vehicleStore.data();
    return (state.owned || []).map((id) => {
      const item = LG.VEHICLE_DATA.byId[id];
      if (!item) return null;
      return {
        id: `companion-${id}`,
        title: item.name,
        subtitle: item.store === "champion" ? "冠军伙伴" : "战斗伙伴",
        src: LG.CONFIG.assets[item.asset]
          || LG.vehicleStore.mountedAsset(item, gender()),
      };
    }).filter((item) => item && validAsset(item.src));
  }

  function specialEventGallery() {
    return LG.authority.cinemaAchievements()
      .filter((item) => item.unlocked && item.id.startsWith("special-cg-"))
      .map((item) => {
        const id = item.id.slice("special-cg-".length);
        const meta = LG.CG_ASSETS.specialMeta[id];
        return {
          id: item.id,
          title: meta?.title || item.title || "特殊事件",
          subtitle: meta?.label || "事件CG",
          src: LG.CG_ASSETS.special[id]?.[gender()],
        };
      }).filter((item) => validAsset(item.src));
  }

  function eventGallery() {
    const current = LG.engine.current(LG.authority.state());
    const currentScene = current && LG.eventSceneAssets.resolve(current).src;
    const items = currentScene ? [{
      id: `event-${current.id}`,
      title: current.title,
      subtitle: "当前事件",
      src: currentScene,
    }] : [];
    LG.authority.archiveView(gender()).filter((item) => !item.locked)
      .forEach((item) => {
        const src = item.cg || LG.CG_ASSETS.endingSrc(item.id, gender());
        if (validAsset(src)) items.push({
          id: `ending-${item.id}`,
          title: item.title,
          subtitle: "人生结局",
          src,
        });
      });
    return [...items, ...specialEventGallery()];
  }

  function counts() {
    const simulation = LG.authority.lifeCinemaProgress().simulation || {};
    if (LG.contentMode?.strictTeen?.()) {
      return { simulation: simulation.active ? "进行中" : 0 };
    }
    return {
      simulation: simulation.active
        ? "进行中" : Math.max(0, Number(simulation.completions) || 0),
      movies: LG.lifeCinemaFilms.catalog.filter((item) => item.unlocked).length,
      contacts: LG.phoneUI?.contactCount?.() || 0,
      gallery: careerGallery().length + companionGallery().length
        + eventGallery().length,
      news: LG.goldenHorizon.data().cityUnlocked ? "已入城" : "城门外",
    };
  }

  LG.phoneData = {
    apps, tracks, counts, validAsset,
    gallery(category) {
      if (category === "companions") return companionGallery();
      if (category === "events") return eventGallery();
      return careerGallery();
    },
  };
})(window.LifeGame);
