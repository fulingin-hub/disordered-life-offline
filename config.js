window.LifeGame = window.LifeGame || {};

window.LifeGame.CONFIG = {
  buildId: "20260720-university-branches",
  version: 4,
  eventRevision: 2026071607,
  stateKey: "disordered-life-state-v1",
  archiveKey: "disordered-life-archive-v1",
  achievementKey: "disordered-life-achievements-v1",
  traitKey: "disordered-life-traits-v1",
  collectibleKey: "disordered-life-collectibles-v1",
  tributeKey: "disordered-life-tribute-v1",
  dailyTaskKey: "disordered-life-daily-tasks-v1",
  hiddenEndingKey: "disordered-life-hidden-ending-v1",
  blackMarketKey: "disordered-life-black-market-v1",
  casinoKey: "disordered-life-casino-v1",
  blackPrisonKey: "disordered-life-black-prison-v1",
  penitentiaryKey: "disordered-life-penitentiary-v1",
  assets: {
    background: "./assets/generated/life-crossroads-bg.6dc93a1f.webp",
    lin: "./assets/generated/lin-lan-boss.8adf43cd.webp",
    qin: "./assets/generated/qin-mei-patron.e987cdd9.webp",
    su: "./assets/generated/su-fei-streamer.3233b8aa.webp",
    shen: "./assets/generated/shen-jingqiu-tutor.65ea9410.webp",
    reina: "./assets/generated/takahashi-reina-teacher.588c8a86.webp",
    miki: "./assets/generated/sato-miki-landlady.a0469ae1.webp",
    mari: "./assets/generated/kanzaki-mari-cult-leader.1ee8a72c.webp",
    evelyn: "./assets/generated/evelyn-hart-professor.4212a2dd.webp",
    claire: "./assets/generated/claire-morgan-executive.caca13ac.webp",
    ruth: "./assets/generated/ruth-carter-ranch-owner.f09949f9.webp",
    restaurantCouple: "./assets/generated/restaurant-couple-portrait.ffeb13e8.webp",
    agencyCouple: "./assets/generated/agency-couple-portrait.ee5f0b66.webp",
    qinghe: "./assets/generated/qinghe-retreat-manager.ddf3fbc4.webp",
    ciyun: "./assets/generated/ciyun-retreat-manager.8c2295f7.webp",
    agnes: "./assets/generated/agnes-retreat-manager.899f04b1.webp",
    kaori: "./assets/generated/kuroda-kaori-supervisor.4655d930.webp",
    victoria: "./assets/generated/victoria-hayes-supervisor.6f6ddf48.webp",
    streetThug: "./assets/generated/street-thug-portrait.65f95e04.webp",
    beggar: "./assets/generated/beggar-portrait.8c3b9943.webp",
    japanOfficial: "./assets/generated/japanese-female-official.12246494.webp",
    usaOfficial: "./assets/generated/american-female-official.1091ce78.webp",
    playerRoom: "./assets/generated/player-room-protagonists.8e05e60f.webp",
    roomXiaFlag: "./assets/generated/room-flag-xia.dae44deb.webp",
    roomIslandFlag: "./assets/generated/room-flag-island.a99422fd.webp",
    roomRiceFlag: "./assets/generated/room-flag-rice.d41a6d65.webp",
    roomCasino: "./assets/generated/room-casino-ensemble.2fce8260.webp",
    paradiseGate: "./assets/generated/paradise-gate-scene.97d3951d.webp",
    paradiseDistantView:
      "./assets/generated/paradise-distant-view.d681e1f7.webp",
    edenGoldenDistrict: "./assets/generated/eden-golden-district.1e333955.webp",
    edenRestaurantDistantEntry:
      "./assets/generated/eden-restaurant-distant-entry.b37a620a.webp",
    edenFashionDistantEntry:
      "./assets/generated/eden-fashion-distant-entry.04daa4f1.webp",
    shadowPrisonComplex: "./assets/generated/shadow-prison-complex.4913e4d3.webp",
    shadowPrisonGateGuards:
      "./assets/generated/shadow-prison-gate-guards.76106af5.webp",
    edenChefClerk: "./assets/generated/eden-chef-clerk.f59b33c6.webp",
    edenFashionClerk: "./assets/generated/eden-fashion-clerk.fc8fbee9.webp",
    galleryEdenChefBarefoot:
      "./assets/generated/gallery-eden-chef-barefoot-command.14eec5e7.webp",
    galleryEdenChefKneeling:
      "./assets/generated/gallery-eden-chef-tights-kneeling.44ff3014.webp",
    galleryEdenFashionBarefoot:
      "./assets/generated/gallery-eden-fashion-barefoot-command.7fced8e0.webp",
    galleryEdenFashionKneeling:
      "./assets/generated/gallery-eden-fashion-tights-kneeling.04db8001.webp",
    shadowPrisonSupervisor:
      "./assets/generated/shadow-prison-supervisor-whitehair.85f59176.webp",
    shadowPrisonManager:
      "./assets/generated/shadow-prison-manager-whitehair.12e10c9d.webp",
    shadowPrisonInstructor:
      "./assets/generated/shadow-prison-instructor-whitehair.b840f33e.webp",
    shadowPrisonWarden:
      "./assets/generated/shadow-prison-warden-whitehair.e8e0c145.webp",
    shadowPrisonOwner:
      "./assets/generated/shadow-prison-owner-whitehair.b4147a48.webp",
    infernalGreedWitch:
      "./assets/generated/infernal-greed-witch.e96b484b.webp",
    infernalGreedQueen:
      "./assets/generated/infernal-greed-queen.b1fe0bbe.webp",
    infernalLustWitch:
      "./assets/generated/infernal-lust-witch.b0cca260.webp",
    infernalLustQueen:
      "./assets/generated/infernal-lust-queen.2615449c.webp",
    infernalWrathWitch:
      "./assets/generated/infernal-wrath-witch.ecb5a75d.webp",
    infernalWrathQueen:
      "./assets/generated/infernal-wrath-queen.4c30d462.webp",
    infernalSlothWitch:
      "./assets/generated/infernal-sloth-witch.498780fd.webp",
    infernalSlothQueen:
      "./assets/generated/infernal-sloth-queen.b37c1fe2.webp",
    infernalPrideWitch:
      "./assets/generated/infernal-pride-witch.4d5cdf77.webp",
    infernalPrideQueen:
      "./assets/generated/infernal-pride-queen.93ae231c.webp",
    infernalEnvyWitch:
      "./assets/generated/infernal-envy-witch.f5d61b05.webp",
    infernalEnvyQueen:
      "./assets/generated/infernal-envy-queen.472cbd62.webp",
    infernalGluttonyWitch:
      "./assets/generated/infernal-gluttony-witch.2a84b936.webp",
    infernalGluttonyQueen:
      "./assets/generated/infernal-gluttony-queen.bc32922e.webp",
    galleryShadowPrisonSupervisor:
      "./assets/generated/gallery-shadow-prison-supervisor-patrol.ba0374ec.webp",
    galleryShadowPrisonManager:
      "./assets/generated/gallery-shadow-prison-manager-patrol.0b476cb4.webp",
    galleryShadowPrisonInstructor:
      "./assets/generated/gallery-shadow-prison-instructor-patrol.a99ea6f6.webp",
    galleryShadowPrisonWarden:
      "./assets/generated/gallery-shadow-prison-warden-patrol.42c1bb09.webp",
    galleryShadowPrisonOwner:
      "./assets/generated/gallery-shadow-prison-owner-office-rest.1ece4a88.webp",
    edenWelcomeGate: "./assets/generated/eden-welcome-gate.98e82a62.webp",
    blackPrisonStreet: "./assets/generated/black-prison-golden-street.a1e972a4.webp",
    roomBlackStreet: "./assets/generated/room-black-street.e37ab187.webp",
    roomSanctuaryCampus: "./assets/generated/room-sanctuary-campus.87998322.webp",
    worldXiaCampus: "./assets/generated/world-xia-campus.6dd7254d.webp",
    worldXiaSociety: "./assets/generated/world-xia-society.acf667d0.webp",
    worldIslandCampus: "./assets/generated/world-island-campus.9ecfa4fb.webp",
    worldIslandSociety: "./assets/generated/world-island-society.7209ea71.webp",
    worldRiceCampus: "./assets/generated/world-rice-campus.3ca0f342.webp",
    worldRiceSociety: "./assets/generated/world-rice-society.a4eae2dd.webp",
    worldBlackStreet: "./assets/generated/world-black-street.a63aa792.webp",
    worldSanctuaryCampus: "./assets/generated/world-sanctuary-campus.e27d12b4.webp",
    protagonistMaleBase: "./assets/generated/protagonist-male-base.15d3eb1b.webp",
    protagonistFemaleBase: "./assets/generated/protagonist-female-base.055bb894.webp",
    protagonistMaleCharacterSet: "./assets/generated/protagonist-male-character-set-v2.10e1268e.webp",
    protagonistFemaleCharacterSet: "./assets/generated/protagonist-female-character-set-v2.731ba55c.webp",
    protagonistMaleTributeSet: "./assets/generated/protagonist-male-tribute-set.7874d3b1.webp",
    protagonistFemaleTributeSet: "./assets/generated/protagonist-female-tribute-set.ccaff5a6.webp",
    protagonistMaleJapanSet: "./assets/generated/protagonist-male-japan-set-v3.eb840e3a.webp",
    protagonistFemaleJapanSet: "./assets/generated/protagonist-female-japan-set-v3.5887d10d.webp",
    protagonistMaleUSASet: "./assets/generated/protagonist-male-usa-set-v3.5cb37ce3.webp",
    protagonistFemaleUSASet: "./assets/generated/protagonist-female-usa-set-v2.7fe713d6.webp",
    protagonistMaleTraitSet: "./assets/generated/protagonist-male-trait-set-v2.32aa0a2c.webp",
    protagonistFemaleTraitSet: "./assets/generated/protagonist-female-trait-set-v2.e173c78c.webp",
    protagonistMaleLuxurySet: "./assets/generated/protagonist-male-luxury-set.31723302.webp",
    protagonistFemaleLuxurySet: "./assets/generated/protagonist-female-luxury-set.22e88363.webp",
    protagonistMaleInfernalSet: "./assets/generated/protagonist-male-infernal-set.00703f80.webp",
    protagonistFemaleInfernalSet: "./assets/generated/protagonist-female-infernal-set.77399fe3.webp",
    protagonistMalePenitentiarySet:
      "./assets/generated/protagonist-male-penitentiary-set.6822ef9d.webp",
    protagonistFemalePenitentiarySet:
      "./assets/generated/protagonist-female-penitentiary-set.e547b5ea.webp",
    protagonistMaleSaintSet:
      "./assets/generated/protagonist-male-saint-set.1bfaf541.webp",
    protagonistFemaleSaintSet:
      "./assets/generated/protagonist-female-saint-set.7178996a.webp",
    protagonistMaleEdenSet:
      "./assets/generated/protagonist-male-eden-set.ae6a7df5.webp",
    protagonistFemaleEdenSet:
      "./assets/generated/protagonist-female-eden-set.9e322627.webp",
    protagonistMalePenitentiaryPoliceSet:
      "./assets/generated/protagonist-male-penitentiary-police-set.4e6b5ec8.webp",
    protagonistFemalePenitentiaryPoliceSet:
      "./assets/generated/protagonist-female-penitentiary-police-set.43c4b1cf.webp",
  },
  initialStats: {
    knowledge: 40,
    money: 20,
    health: 70,
    social: 45,
    autonomy: 45,
    dependence: 15,
    dignity: 70,
    shame: 0,
  },
  statMeta: {
    knowledge: "学识",
    money: "资金",
    health: "健康",
    social: "人际",
    autonomy: "自主",
    dependence: "依赖",
    dignity: "尊严",
    shame: "羞耻",
  },
  statMaximums: {},
};
