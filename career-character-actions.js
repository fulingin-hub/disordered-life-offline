(function (LG) {
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  LG.careerCharacterActions = {
    panel(character, view, busy) {
      if (view !== "private") return null;
      const unlocked = LG.career.privateComplete(character.id);
      const panel = node("section", "faction-character-actions");
      panel.append(node("strong", "", "个人角色内容"));
      const copy = node("p", "", unlocked
        ? "丧志商城私密道具已集齐，AI对话与角色画廊已开放。"
        : "获取本角色丧志商城的全部五件私密道具后开放。");
      const actions = node("div", "otherworld-character-actions");
      const chat = node("button", "", unlocked ? "AI对话" : "私密道具未集齐");
      const gallery = node("button", "", unlocked ? "角色画廊" : "画廊未解锁");
      chat.type = "button";
      gallery.type = "button";
      chat.disabled = busy || !unlocked;
      gallery.disabled = busy || !unlocked;
      chat.addEventListener("click", () =>
        LG.careerCharacterChatUI.open(character.id));
      gallery.addEventListener("click", () => LG.galleryUI.open(character.id));
      actions.append(chat, gallery);
      if (character.rankIndex === 2) {
        [["献上灵魂", "offerLeader"], ["洗脑榨取", "showcaseLeader"]]
          .forEach(([label, method]) => {
            const button = node("button", "",
              unlocked ? label : "供奉 / 卖弄未开放");
            button.type = "button";
            button.disabled = busy || !unlocked;
            button.addEventListener("click", () =>
              LG.contributionRitual[method](character));
            actions.append(button);
          });
        actions.append(LG.infernalChurchUI.magicPanel(character.name));
      }
      panel.append(copy, actions);
      return panel;
    },
  };
})(window.LifeGame);
