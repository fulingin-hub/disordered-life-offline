(function (LG) {
  LG.CONTENT_SAFETY_RULES = Object.freeze({
  "schemaVersion": 1,
  "hiddenMessage": "15+安全模式：该内容已隐藏。",
  "safeVisualPatterns": [
    "life-crossroads-bg",
    "loading-golden-horizon",
    "world-map\\.webp",
    "world-(?:xia|island|rice|sanctuary)-",
    "room-flag-",
    "airship-jiefang",
    "gray-zone-scene",
    "golden-horizon-capital",
    "player-room-protagonists"
  ],
  "blockedTextPatterns": [
    "性暗示",
    "情色",
    "裸体",
    "裸足",
    "丝袜",
    "胸部",
    "乳房",
    "裆部",
    "跨部",
    "体液",
    "水痕",
    "亲吻",
    "舔",
    "踩脸",
    "足踏",
    "脚底",
    "鞋尖",
    "束缚",
    "调教",
    "背德",
    "献祭",
    "血腥",
    "尸体",
    "处刑",
    "折磨",
    "奴",
    "贱畜"
  ],
  "replacements": [
    {
      "pattern": "七层地狱",
      "replacement": "七层试炼"
    },
    {
      "pattern": "无尽深渊",
      "replacement": "百层远征"
    },
    {
      "pattern": "女魔王",
      "replacement": "关卡守卫"
    },
    {
      "pattern": "魔女",
      "replacement": "巡逻守卫"
    },
    {
      "pattern": "战斗",
      "replacement": "挑战"
    },
    {
      "pattern": "击杀",
      "replacement": "完成"
    },
    {
      "pattern": "败北",
      "replacement": "历练"
    },
    {
      "pattern": "欲望",
      "replacement": "试炼"
    },
    {
      "pattern": "支配",
      "replacement": "管理"
    },
    {
      "pattern": "服从",
      "replacement": "纪律"
    },
    {
      "pattern": "羞辱",
      "replacement": "挫折"
    },
    {
      "pattern": "下跪|跪下|跪姿",
      "replacement": "退让"
    },
    {
      "pattern": "血色",
      "replacement": "赤色"
    },
    {
      "pattern": "地狱",
      "replacement": "试炼"
    }
  ],
  "strictTeenBlockedMethods": [
    "allocateTraits",
    "allocateCareer",
    "joinFaction",
    "joinHolyLight",
    "leaveHolyLight",
    "receiveHolyBaptism",
    "purifyHolyLight",
    "claimHolyTask",
    "completeHolyWeekly",
    "startPriestessTrial",
    "recordPriestessDialogue",
    "advancePriestessTrial",
    "chooseInfernalFaith",
    "completeInfernalBaptism",
    "promoteInfernalCareer",
    "upgradeChurchPower",
    "claimInfernalChurchTask",
    "startSaintTrial",
    "advanceSaintTrial",
    "magicGasAttack",
    "equipProfession",
    "equipCareerSpecialOutfit",
    "unlockFactionProfession",
    "equipCareerMedal",
    "equipCareerOutfit",
    "buyFactionItem",
    "buyFactionConsumable",
    "claimFactionPiece",
    "useFactionSpecial",
    "careerTaskAdvance",
    "claimCareerTask",
    "equipTrait",
    "equipInfernalTitle",
    "contribute",
    "claimDaily",
    "buyCollectible",
    "buySaintItem",
    "buyOtherworldItem",
    "goldenArena",
    "goldenArenaExchange",
    "goldenTrial",
    "goldenUseGift",
    "goldenHiddenChallenge",
    "goldenEndgameReward",
    "goldenMischief",
    "goldenUnlockProfession",
    "goldenEquipProfession",
    "goldenSocialVote",
    "goldenTavernBond",
    "useGalleryItem",
    "buyVehicle",
    "equipVehicle",
    "setVehicleDisplayMode",
    "refreshMarket",
    "buyMarket",
    "usePotion",
    "buyRoomConsumable",
    "casinoStart",
    "casinoBet",
    "buyCasinoItem",
    "blackPrisonBuy",
    "blackPrisonEquip",
    "edenCharacterBuy",
    "penitentiaryTask",
    "penitentiaryControlChoice",
    "penitentiaryBuy",
    "penitentiaryEquip",
    "infernalAction",
    "infernalClubBuy",
    "infernalClubUse",
    "infernalClubEquip",
    "recordContributionRitual",
    "unlockAllCollections",
    "equipItem",
    "dialogueBegin",
    "dialogueComplete"
  ]
});
})(window.LifeGame);
