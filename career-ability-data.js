(function (LG) {
  const factions = {
    university: ["国立大学", "魔气攻击不掉人格，每秒获得10属性点。"],
    sanctuary: ["机构园区", "魔气攻击不掉人格，每秒增加10败北值。"],
    ranch: ["米国牧场", "所有任务的道具奖励数量×2。"],
    paradise: ["乐园", "所有商品购买价格减少50%。"],
    domain: ["异域联邦", "魔气攻击不掉人格，每秒获得10属性点。"],
    otherworld: ["异界联盟", "魔气攻击不掉人格，每秒获得10属性点。"],
  };
  const mechs = {
    black: {
      name: "黑鲨构装机甲",
      src: "./assets/generated/career-mech-black-shark.1ab12ef8.webp",
      copy: "黑金色中型魔导构装，巨刀与枪炮接入魔导回路，强化驾驶者能力输出，适合单兵作战。",
    },
    white: {
      name: "白鲨构装机甲",
      src: "./assets/generated/career-mech-white-shark.665aee6b.webp",
      copy: "白金色大型科技构装，双臂能量立场盾与万具加载模块组成移动堡垒，适合团队任务。",
    },
  };
  function plate(factionId) {
    const plate = document.createElement("span");
    plate.className = "career-mech-plate";
    plate.innerHTML = `<b>${factions[factionId]?.[0] || "未认证"}</b><small>一级机师认证</small>`;
    return plate;
  }
  LG.careerAbilityData = {
    factions, mechs, plate,
    factionName(id) { return factions[id]?.[0] || id; },
    factionEffect(id) { return factions[id]?.[1] || "尚未激活势力能力。"; },
  };
})(window.LifeGame);
