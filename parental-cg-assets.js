(function (LG) {
  const src = "./assets/generated/cg-special-parental-heart.5cf92cd2.webp";
  LG.CG_ASSETS.specialMeta["parental-heart"] = {
    title: "幸福剪影",
    label: "可怜天下父母心特殊CG",
    text: "男女主角陪在两对夫妻身边，分别为他们洗脚。忙碌一生的人们终于在温暖灯光下围坐说笑，留下了一幅其乐融融的幸福剪影。",
    fixedNarration: false,
  };
  LG.CG_ASSETS.special["parental-heart"] = { male: src, female: src };
  const memories = {
    "restaurant-family-good": {
      src: "./assets/generated/restaurant-couple-portrait.ffeb13e8.webp",
      title: "餐饮店留下的灯",
      text: "毕业前，你留下帮周启明与罗雯收店。三个人围着最后一桌饭菜坐下，也从那天开始真正成为一家人。",
    },
    "agency-family-good": {
      src: "./assets/generated/agency-couple-portrait.ee5f0b66.webp",
      title: "中介店的旧沙发",
      text: "你陪杜衡与许曼整理完最后一叠档案。旧沙发旁的合影，后来成为魔灾前最珍贵的一段普通生活。",
    },
  };
  Object.entries(memories).forEach(([id, memory]) => {
    LG.CG_ASSETS.specialMeta[id] = {
      title: memory.title,
      label: "模拟人生幸福线CG",
      text: memory.text,
      fixedNarration: false,
    };
    LG.CG_ASSETS.special[id] = { male: memory.src, female: memory.src };
  });
})(window.LifeGame);
