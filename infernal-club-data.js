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
  const universal = "七层地狱或深渊完整通关时获得额外资源奖励。";
  const effects = {
    wrath: "强化任务、商城与消耗品结算。",
    greed: "强化任务、商城与消耗品结算。",
    gluttony: "强化任务、商城与消耗品结算。",
    pride: "强化异界事件与特殊收藏结算。",
    lust: "强化异界事件与特殊收藏结算。",
    sloth: "强化异界事件与特殊收藏结算。",
    envy: "强化任务、异界奖励、商城与消耗品结算。",
  };
  const consumables = [
    ["golden-sacrament", "黄金圣餐", "gold"],
    ["holy-water", "美味圣水", "water"],
    ["despair-potion", "丧志药剂", "potion"],
    ["demonic-potion", "魔性药剂", "potion"],
  ].map(([id, name, specialKind]) => ({
    id, name, specialKind,
    description: `${LG.potionEffects.text(LG.potionEffects.for({ specialKind }))}。`,
    type: "consumable",
  }));
  const queens = queenRows.map(([id, name, character, portrait, accent]) => {
    const equipment = LG.EQUIPMENT_SLOTS.map((slot) => ({
      id: `club-${id}-${slot.id}`,
      name: `${name}地狱魔王·${accent}${slotNames[slot.id]}`,
      slot: slot.id,
      type: "equipment",
      description: `${lore[id]}。${universal}${effects[id]}`,
    }));
    const specials = [
      {
        id: `club-${id}-demon-sensor`,
        name: `${name}·魔物感应器`,
        type: "special",
        description: `蠕动的魔虫长开嘴巴探出舌头好像在渴望什么，由${
          name}女魔王的排泄物变化而成。`,
      },
      {
        id: `club-${id}-tentacle-therapy-device`,
        name: `${name}·触须理疗器`,
        type: "special",
        description: `蠕动的触手，可以看见密密麻麻的小口在吸允着什么，由${
          name}女魔王的排泄物变化而成。`,
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
  };
})(window.LifeGame);
