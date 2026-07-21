(function (LG) {
  function playerGender() {
    return LG.authority?.state?.()?.gender === "female" ? "female" : "male";
  }

  function queenEligible(queen) {
    return Boolean(queen
      && queen.equipment.every((item) => LG.infernalClub.owns(item.id))
      && queen.specials.every((item) => LG.infernalClub.owns(item.id)));
  }

  function leaderEligible(character) {
    return Boolean(character?.rankIndex === 2
      && LG.career.privateComplete(character.id));
  }

  function queenMeta(queen) {
    return queenEligible(queen) ? {
      kind: "queen",
      id: queen.id,
      gender: "female",
      route: playerGender(),
      name: queen.title,
      src: LG.CONFIG.assets[queen.portrait],
      showcase: LG.contributionShowcase.queen(queen),
    } : null;
  }

  function leaderMeta(character) {
    return leaderEligible(character) ? {
      kind: "leader",
      id: character.id,
      gender: character.gender,
      route: character.gender === playerGender() ? "same" : "cross",
      name: LG.CAREER_DATA.characterLabel(character),
      src: LG.careerPortraits.characterSource(character),
      showcase: LG.contributionShowcase.leader(character),
    } : null;
  }

  function roomMeta(character) {
    return character?.id && character?.src ? {
      kind: "room",
      id: character.id,
      gender: character.gender,
      route: "room",
      name: character.name,
      src: character.src,
      showcase: LG.contributionShowcase.leader({
        name: character.name, faction: character.id,
      }),
    } : null;
  }

  function actionButton(label, mode, unlocked, onShow, queen) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = unlocked ? label : "私密收藏未集齐";
    button.disabled = !unlocked;
    button.addEventListener("click", () => onShow(queen, mode, button));
    return button;
  }

  function queenCard(queen, onShow) {
    const unlocked = queenEligible(queen);
    const card = document.createElement("article");
    card.className = `club-item contribution-ritual-entry${
      unlocked ? " owned" : " locked"}`;
    const heading = document.createElement("div");
    heading.className = "club-item-heading";
    heading.innerHTML = "<strong>供奉与卖弄</strong><span></span>";
    heading.querySelector("span").textContent = unlocked ? "已开放" : "未开放";
    const copy = document.createElement("p");
    copy.textContent = unlocked
      ? "供奉为25秒三阶段仪式；卖弄为20秒王座展示。两者共同累计隐藏成就。"
      : "集齐该女魔王五件套与两件特殊收藏后开放供奉和卖弄。";
    const actions = document.createElement("div");
    actions.className = "club-item-actions";
    actions.append(
      actionButton("献上灵魂", "offering", unlocked, onShow, queen),
      actionButton("洗脑榨取", "showcase", unlocked, onShow, queen),
    );
    card.append(heading, copy, actions);
    return card;
  }

  LG.contributionRitualData = {
    playerGender,
    queenEligible,
    leaderEligible,
    queenMeta,
    leaderMeta,
    roomMeta,
    queenCard,
  };
})(window.LifeGame);
