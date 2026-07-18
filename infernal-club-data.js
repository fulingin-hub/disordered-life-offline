(function (LG) {
  const queenRows = [
    ["greed", "贪婪", "clubGreedQueen", "infernalGreedQueen", "鎏金"],
    ["lust", "色欲", "clubLustQueen", "infernalLustQueen", "紫晶"],
    ["wrath", "愤怒", "clubWrathQueen", "infernalWrathQueen", "赤炎"],
    ["sloth", "懒惰", "clubSlothQueen", "infernalSlothQueen", "绯梦"],
    ["pride", "傲慢", "clubPrideQueen", "infernalPrideQueen", "黑曜"],
    ["envy", "嫉妒", "clubEnvyQueen", "infernalEnvyQueen", "霜银"],
    ["gluttony", "暴食", "clubGluttonyQueen", "infernalGluttonyQueen", "翠宴"],
  ];
  const slotNames = {
    head: "使徒眼罩与面纱",
    body: "全覆式仪典服",
    crotch: "锁链腰封",
    hands: "臣属手甲",
    feet: "无声足环",
  };
  const lore = {
    pride: "被伪装者蒙蔽利用",
    greed: "对未来风险视而不见",
    lust: "用情感与欲望做诱饵",
    envy: "因他人的优秀而背叛",
    gluttony: "初尝然后疯狂",
    wrath: "无能地面对现实",
    sloth: "放弃抵抗沦为俘虏",
  };
  const universal = "七层地狱或深渊完整通关一轮，四项资源各+700。";
  const effects = {
    wrath: "任务三倍报酬；非装备商品免费；饮品、食物、药物不限使用次数。",
    greed: "任务三倍报酬；非装备商品免费；饮品、食物、药物不限使用次数。",
    gluttony: "任务三倍报酬；非装备商品免费；饮品、食物、药物不限使用次数。",
    pride: "异界事件四项资源各+100；每拥有一位女魔王的特殊道具，事件败北值再+100，最多+700。",
    lust: "异界事件四项资源各+100；每拥有一位女魔王的特殊道具，事件败北值再+100，最多+700。",
    sloth: "异界事件四项资源各+100；每拥有一位女魔王的特殊道具，事件败北值再+100，最多+700。",
    envy: "任务与异界人格/败北奖励+10%；非装备商品九折；每种限次消耗品额外使用10次。",
  };
  const consumables = [
    ["golden-sacrament", "黄金圣餐", 100, "健康 -20，依赖 +5。"],
    ["holy-water", "美味圣水", 60, "健康 -10，依赖 +3。"],
    ["despair-potion", "丧志药剂", 120, "自主 -15，尊严 -10，依赖 +10。"],
    ["demonic-potion", "魔性药剂", 150, "自主 -10，尊严 -15，依赖 +15。"],
  ].map(([id, name, price, description]) => ({
    id, name, price, description, type: "consumable",
  }));
  const queens = queenRows.map(([id, name, character, portrait, accent]) => {
    const equipment = LG.EQUIPMENT_SLOTS.map((slot) => ({
      id: `club-${id}-${slot.id}`,
      name: `${name}地狱魔王·${accent}${slotNames[slot.id]}`,
      price: 250,
      slot: slot.id,
      type: "equipment",
      description: `${lore[id]}。${universal}${effects[id]}`,
    }));
    const specials = [
      {
        id: `club-${id}-demon-sensor`,
        name: `${name}·魔物感应器`,
        price: 600,
        type: "special",
        description: "五件套集齐后开放。会以微光和脉动提示附近的异界魔力。",
      },
      {
        id: `club-${id}-tentacle-therapy-device`,
        name: `${name}·触须理疗器`,
        price: 600,
        type: "special",
        description: "五件套集齐后开放。柔性魔法触须用于非伤害性的恢复理疗。",
      },
    ];
    return {
      id, name, character, portrait, accent,
      lore: lore[id],
      effect: `${universal}${effects[id]}`,
      title: `${name}地狱女魔王`,
      room: `${name}包间`,
      equipment, specials,
      apostleMale: `infernalClub${id[0].toUpperCase()}${id.slice(1)}Male`,
      apostleFemale: `infernalClub${id[0].toUpperCase()}${id.slice(1)}Female`,
    };
  });
  LG.INFERNAL_CLUB_DATA = {
    queens,
    byId: Object.fromEntries(queens.map((item) => [item.id, item])),
    byCharacter: Object.fromEntries(queens.map((item) => [item.character, item])),
    consumables,
    accessDefeat: 1000,
    chatCost: 100,
    chatTurns: 20,
  };
})(window.LifeGame);
