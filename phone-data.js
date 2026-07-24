(function (LG) {
  const validAsset = (value) => typeof value === "string"
    && (/^\.\/assets\/[A-Za-z0-9_./-]+$/.test(value)
      || /^https?:\/\//.test(value));
  const gender = () => LG.authority.state()?.gender === "female"
    ? "female" : "male";

  const apps = [
    ["assistant", "弥娅助手", false],
    ["simulation", "模拟人生", false],
    ["movies", "电影播放器", false],
    ["contacts", "通讯录", false],
    ["music", "音乐播放器", false],
    ["gallery", "相册", false],
    ["news", "新闻资讯", false],
    ["onlineCasino", "线上赌场", true],
    ["adultSite", "成人网站", true],
    ["system", "系统", false],
  ].map(([id, label, adultOnly]) => ({ id, label, adultOnly }));

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

  function unlockedCharacters() {
    return Object.entries(LG.GALLERY_ASSETS || {}).map(([id, gallery]) => {
      const unlocked = LG.collectibles?.galleryUnlocked?.(id)
        || LG.career?.galleryUnlocked?.(id)
        || LG.casino?.galleryUnlocked?.(id)
        || LG.edenCharacters?.galleryUnlocked?.(id)
        || LG.penitentiary?.galleryUnlocked?.(id)
        || LG.otherworldCharacters?.galleryUnlocked?.(id)
        || (["mia", "xiaosi"].includes(id)
          && LG.contentMode?.adultSimulation?.());
      if (!unlocked || !gallery?.items?.length) return null;
      const item = gallery.items.find((entry) => validAsset(entry.src));
      return item ? {
        id: `character-${id}`,
        characterId: id,
        title: gallery.name || id,
        subtitle: "18+角色",
        src: item.src,
        kind: "character",
      } : null;
    }).filter(Boolean);
  }

  function adultImages() {
    return [...careerGallery(), ...companionGallery(), ...eventGallery()]
      .map((item) => ({ ...item, kind: "image" }));
  }

  function adultVideos() {
    return unlockedCharacters().flatMap((character) => {
      const entries = LG.galleryAnimationTemplates
        ?.entries?.(character.characterId) || [];
      const visible = character.characterId === "xiaosi"
        ? entries : entries.slice(0, 2);
      return visible.map((item) => ({
          id: `video-${character.characterId}-${item.template}`,
          title: `${character.title} · ${item.title}`,
          subtitle: "角色视频动画",
          kind: "video",
          characterId: character.characterId,
          template: item.template,
          portrait: item.portrait || character.src,
        }));
    });
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
    visibleApps() {
      return apps.filter((app) => !app.adultOnly
        || LG.contentMode?.adultSimulation?.());
    },
    gallery(category) {
      if (category === "companions") return companionGallery();
      if (category === "events") return eventGallery();
      return careerGallery();
    },
    adultContent(category) {
      if (!LG.contentMode?.adultSimulation?.()) return [];
      if (category === "videos") return adultVideos();
      if (category === "characters") return unlockedCharacters();
      return adultImages();
    },
  };
})(window.LifeGame);
