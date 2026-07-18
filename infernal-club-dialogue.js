(function (LG) {
  const characters = {};
  const rooms = {};
  const fallbacks = {
    greed: ["先看清账本。你交出的每一点人格，都是自己签下的选择。"],
    lust: ["这里的诱惑只是一面镜子，真正让你停下的是你自己的念头。"],
    wrath: ["别把冲动当勇气。能在命令前保持判断，才算真正的力量。"],
    sloth: ["你可以休息，但别把逃避包装成顺从。说出你真正不想面对的事。"],
    pride: ["抬头回答。臣属礼不是放弃思考，你仍要为自己的选择负责。"],
    envy: ["你总盯着别人拥有的东西，却不肯说自己究竟缺少什么。"],
    gluttony: ["欲望没有尽头，所以我只问一次：你准备在哪一步停下？"],
  };
  LG.INFERNAL_CLUB_DATA.queens.forEach((queen) => {
    characters[queen.character] = {
      name: queen.title,
      fallback: [
        fallbacks[queen.id],
        `${queen.room}的账本只记录选择，不会替你解释动机。`,
      ],
    };
    rooms[queen.character] = {
      character: queen.character,
      location: `神秘的地狱俱乐部·${queen.room}`,
      title: `${queen.room}的私密会谈`,
      opener: `${queen.title}示意侍从关上包间门：“先看清你带来的欲望，再决定要不要开口。”`,
    };
  });
  LG.INFERNAL_CLUB_DIALOGUE = { characters, rooms };
})(window.LifeGame);
