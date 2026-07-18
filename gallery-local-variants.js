(function (LG) {
  const base = "./assets/generated/";
  const captions = {
    "黑丝正装": "以角色标志性正装为基础制作的黑丝正式造型CG。",
    "裸足休息": "角色在私人空间卸下鞋履、短暂休息的裸足造型CG。",
    "裸足踩踏": "以低机位与前景特写表现角色向前踏步的裸足造型CG。",
    "黑丝跪坐": "角色保持完整正装，以正式跪坐姿态呈现的黑丝造型CG。",
  };
  const additions = {
    kaori: [
      ["裸足休息", "gallery-kaori-barefoot-rest.fafdf32a.webp"],
      ["黑丝跪坐", "gallery-kaori-tights-kneeling.70c8481f.webp"],
    ],
    victoria: [
      ["裸足休息", "gallery-victoria-barefoot-rest.4cbc2ceb.webp"],
      ["黑丝跪坐", "gallery-victoria-tights-kneeling.11386d08.webp"],
    ],
    streetThug: [
      ["黑丝正装", "gallery-street-thug-formal-tights.c2544e62.webp"],
      ["黑丝跪坐", "gallery-street-thug-tights-kneeling.168176b1.webp"],
    ],
    beggar: [
      ["黑丝正装", "gallery-beggar-formal-tights.6d03588e.webp"],
      ["裸足踩踏", "gallery-beggar-barefoot-stomp.e16344ec.webp"],
    ],
    japanOfficial: [
      ["裸足休息", "gallery-japan-official-barefoot-rest.44f96437.webp"],
      ["裸足踩踏", "gallery-japan-official-barefoot-stomp.0cb06e1c.webp"],
    ],
    usaOfficial: [
      ["裸足休息", "gallery-usa-official-barefoot-rest.b90255bc.webp"],
      ["裸足踩踏", "gallery-usa-official-barefoot-stomp.c4c93624.webp"],
    ],
    clubGreedQueen: [
      ["黑丝正装", "gallery-club-greed-queen-formal-tights.cef251c5.webp"],
      ["裸足休息", "gallery-club-greed-queen-barefoot-rest.dc82e3ad.webp"],
    ],
    clubLustQueen: [
      ["黑丝正装", "gallery-club-lust-queen-formal-tights.0f70c5dd.webp"],
      ["裸足休息", "gallery-club-lust-queen-barefoot-rest.64aa1d5f.webp"],
    ],
    clubWrathQueen: [
      ["黑丝正装", "gallery-club-wrath-queen-formal-tights.0b2c6e73.webp"],
      ["裸足休息", "gallery-club-wrath-queen-barefoot-rest.35cfc75e.webp"],
    ],
    clubSlothQueen: [
      ["黑丝正装", "gallery-club-sloth-queen-formal-tights.d15e5044.webp"],
      ["裸足休息", "gallery-club-sloth-queen-barefoot-rest.a34f4590.webp"],
    ],
    clubPrideQueen: [
      ["黑丝正装", "gallery-club-pride-queen-formal-tights.6515d6e2.webp"],
      ["裸足休息", "gallery-club-pride-queen-barefoot-rest.813562e4.webp"],
    ],
    clubEnvyQueen: [
      ["黑丝正装", "gallery-club-envy-queen-formal-tights.9c5da7b5.webp"],
      ["裸足休息", "gallery-club-envy-queen-barefoot-rest.2de245fc.webp"],
    ],
    clubGluttonyQueen: [
      ["黑丝正装", "gallery-club-gluttony-queen-formal-tights.caa20ccb.webp"],
      ["裸足休息", "gallery-club-gluttony-queen-barefoot-rest.c959dc3e.webp"],
    ],
    casinoBunny: [
      ["黑丝正装", "gallery-casino-bunny-formal-tights.64ee4bfd.webp"],
      ["裸足休息", "gallery-casino-bunny-barefoot-rest.188e9777.webp"],
    ],
    casinoLead: [
      ["黑丝正装", "gallery-casino-lead-formal-tights.6bf1b054.webp"],
      ["裸足休息", "gallery-casino-lead-barefoot-rest.27641849.webp"],
    ],
    casinoManager: [
      ["黑丝正装", "gallery-casino-manager-formal-tights.d01d6012.webp"],
      ["裸足休息", "gallery-casino-manager-barefoot-rest.670e3649.webp"],
    ],
    casinoOwner: [
      ["黑丝正装", "gallery-casino-owner-formal-tights.6d10a435.webp"],
      ["裸足踩踏", "gallery-casino-owner-barefoot-stomp.c7ac754d.webp"],
    ],
    edenChef: [["黑丝正装", "gallery-eden-chef-formal-tights.8121093e.webp"]],
    edenFashion: [["黑丝正装", "gallery-eden-fashion-formal-tights.4c58fe83.webp"]],
    penitentiarySupervisor: [
      ["黑丝正装", "gallery-penitentiary-supervisor-formal-tights.6a69dc35.webp"],
      ["裸足休息", "gallery-penitentiary-supervisor-barefoot-rest.f64ee013.webp"],
    ],
    penitentiaryManager: [
      ["黑丝正装", "gallery-penitentiary-manager-formal-tights.6c581f71.webp"],
      ["裸足休息", "gallery-penitentiary-manager-barefoot-rest.3e044c73.webp"],
    ],
    penitentiaryInstructor: [
      ["黑丝正装", "gallery-penitentiary-instructor-formal-tights.a97059f5.webp"],
      ["裸足休息", "gallery-penitentiary-instructor-barefoot-rest.47da0b40.webp"],
    ],
    penitentiaryWarden: [
      ["黑丝正装", "gallery-penitentiary-warden-formal-tights.1759d917.webp"],
      ["裸足休息", "gallery-penitentiary-warden-barefoot-rest.409a58ea.webp"],
    ],
    penitentiaryOwner: [
      ["黑丝正装", "gallery-penitentiary-owner-formal-tights.171fa771.webp"],
      ["裸足踩踏", "gallery-penitentiary-owner-barefoot-stomp.fb3e329f.webp"],
    ],
  };

  Object.entries(additions).forEach(([id, variants]) => {
    const gallery = LG.GALLERY_ASSETS[id];
    if (!gallery) return;
    const targetCount = id === "clubLustQueen" ? 6 : 4;
    variants.slice(0, Math.max(0, targetCount - gallery.items.length)).forEach(([title, file]) => {
      gallery.items.push({
        title,
        caption: captions[title],
        src: `${base}${file}`,
        alt: `${gallery.name}${title}CG`,
        fit: "contain",
        position: "center",
      });
    });
  });
})(window.LifeGame);
