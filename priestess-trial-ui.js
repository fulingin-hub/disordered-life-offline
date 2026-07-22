(function (LG) {
  let dialog, copy, choices, status, lastStage = "", busy = false;
  const priestess = () => ({
    id: "priestess", kind: "room", gender: "female", name: "魔纹教会女主教",
    src: LG.CONFIG.assets.infernalChurchPriestess,
    route: "room",
    showcase: LG.contributionShowcase.leader({
      name: "魔纹教会女主教", faction: "church",
    }),
  });
  const stageCopy = {
    intro: "女祭司坐在祭祀台前，浑身散发着浓郁的魔气，那双裸足，十根修长灵活的足趾扭动间，隐藏在足趾的魔气不断焖蒸浸裹着的熏脑雌骚脂油足臭被不断挤出，令你不由得有些昏昏沉沉。\n\n女主教：你有成为贱奴的潜力，亲吻我的脚底，我会让你永生永世难忘此时的绝顶背德快感。放轻松，在你身边的那个家伙可干扰不到你的决定。\n\n女祭司蔑视地抬起散发着浓烈魔气的熟美裸足，等待你的选择。",
    "blessing-choice": "你破除了最外层幻境。圣徒虚影询问是否替你随机跳过三幕诱惑。",
    water: "第一幕：圣水诱惑。女祭司将圣水奖励推到你面前。",
    gold: "第二幕：黄金诱惑。沉重黄金与热雾覆盖祭台。",
    control: "第三幕：洗脑支配。魔纹命令开始循环侵入意识。",
    intermission: "中场休息。圣徒的祝福还能带你直接前往终局。",
    offering: "第四幕：灵魂供奉。魔纹开始牵引你的灵魂。",
    final: "强大的勇者你真让人着迷，我失败了，女祭司跪下道歉。只要别带我去教团我做什么都可以。",
    foot: "第五幕：绝望足踏。女司祭最后的陷阱已经覆盖视野。",
    complete: "本次女主教试炼已经结算。",
  };
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function play(stage) {
    if (stage === lastStage) return;
    lastStage = stage;
    if (stage === "intro") {
      LG.characterFootImpactPopup.show({
        kind: "gallery", roomId: "priestess-intro",
        members: [{ id: "priestess", name: "魔纹教会女主教",
          portrait: LG.CONFIG.assets.infernalChurchPriestess }],
      }, 1, ["bare"]);
    } else if (stage === "water" || stage === "gold") {
      LG.buttImpactPopup.showCharacter(priestess(), 10, stage);
    } else if (stage === "control") {
      LG.contributionRitual.preview(priestess(), "showcase");
    } else if (stage === "offering") {
      LG.contributionRitual.preview(priestess(), "offering");
    } else if (stage === "foot") {
      LG.characterFootImpactPopup.show({
        kind: "gallery", roomId: "priestess",
        members: [{ id: "priestess", name: "魔纹教会女主教",
          portrait: LG.CONFIG.assets.infernalChurchPriestess }],
      }, 1, ["bare"]);
    }
  }
  function action(label, choice, disabled) {
    const button = node("button", "", label);
    button.type = "button"; button.disabled = busy || disabled;
    button.addEventListener("click", () => advance(choice));
    return button;
  }
  function buttons(trial) {
    if (!trial) return [action("开始周常讨伐", "start")];
    const stage = trial.stage;
    if (stage === "intro") return [
      action("选择背叛", "betray"), action("选择拒绝", "refuse")];
    if (stage === "blessing-choice") return [
      action("使用圣徒的祝福", "use"), action("正常挑战", "decline")];
    if (stage === "water") return [
      action("喝下圣水", "fail"), action("坚守信念（4/4）", "hold")];
    if (stage === "gold") return [
      action("吞咽黄金", "fail"), action("坚守信念（3/4）", "hold")];
    if (stage === "control") return [
      action("放弃抵抗", "fail"), action("坚守信念（2/4）", "hold")];
    if (stage === "intermission") return [
      action("使用圣徒的祝福", "use", trial.remainingBlessings < 1),
      action("继续挑战", "decline")];
    if (stage === "offering") return [
      action("放弃抵抗", "fail"), action("坚守信念（1/4）", "hold")];
    if (stage === "final") return [
      action("我赢了，接受教团的审判吧", "judge"),
      action("那我就放过你吧", "spare")];
    if (stage === "foot") return [
      action("臭脚踩脸，败北成奴", "fail"),
      action(`圣徒的祝福（${trial.remainingBlessings}/1）`,
        "blessing", trial.remainingBlessings < 1)];
    return [];
  }
  async function advance(choice) {
    if (busy) return;
    busy = true; render();
    try {
      const method = choice === "start"
        ? "startPriestessTrial" : "advancePriestessTrial";
      const result = await LG.authority.mutate(method,
        choice === "start" ? {} : { choice });
      status.textContent = result.message;
      if (result.life?.endingId) {
        dialog.close(); LG.ui.render(LG.authority.state());
      } else render();
    } catch (err) {
      console.error("女主教试炼失败:", err?.code, err?.message, err?.stack);
      status.textContent = err?.message || "试炼暂时无法继续。";
    } finally {
      busy = false; render();
    }
  }
  function render() {
    if (!dialog) return;
    const data = LG.holyLight.data();
    const trial = data.trial?.stage === "complete" ? null : data.trial;
    const stage = trial?.stage || "intro";
    copy.textContent = stageCopy[stage] || stageCopy.intro;
    choices.replaceChildren(...buttons(trial));
    play(trial?.stage);
  }
  function build() {
    dialog = node("dialog", "priestess-trial-dialog");
    dialog.innerHTML = `<div class="trial-heading"><div><span class="event-type">
      魔纹教会 · 女主教对话</span><h2>挑战女主教的支配魔境</h2></div>
      <button type="button">关闭</button></div><img alt="魔纹教会女主教">
      <p class="trial-copy"></p><p class="system-status" role="status"></p>
      <div class="trial-actions"></div>`;
    dialog.querySelector("img").src = LG.CONFIG.assets.infernalChurchPriestess;
    dialog.querySelector(".trial-heading button")
      .addEventListener("click", () => dialog.close());
    copy = dialog.querySelector(".trial-copy");
    status = dialog.querySelector(".system-status");
    choices = dialog.querySelector(".trial-actions");
    document.body.append(dialog);
  }
  async function open() {
    if (!dialog) build();
    lastStage = "";
    const firstTalk = (LG.holyLight.data().priestessTalks || 0) < 1;
    if (!dialog.open) dialog.showModal();
    render();
    if (firstTalk) {
      try {
        const result = await LG.authority.mutate("recordPriestessDialogue", {});
        status.textContent = result.message;
      } catch (err) {
        console.error("女主教对话记录失败:", err?.code, err?.message, err?.stack);
        status.textContent = err?.message || "对话记录暂时无法保存。";
      }
    }
    if (firstTalk || LG.holyLight.has("spared-priestess")) play("intro");
  }
  LG.priestessTrialUI = { open };
})(window.LifeGame);
