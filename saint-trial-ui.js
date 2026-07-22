(function (LG) {
  let dialog, copy, choices, status, gift, lastStage = "", busy = false;
  const stageCopy = {
    intro: "圣徒坐在祭祀台前，浑身散发着浓郁的圣光。面对强大职业者的压迫气场，你不由得有些难以呼吸。\n\n圣徒：你有成为英雄的潜力，别被欲望挟持了孩子。你还有救。",
    "gift-choice": "挑战圣徒的精神世界。七大欲的馈赠可以随机跳过三幕CG。",
    ordinary: "第一幕：生命的美好。普通人生中温暖、正面的记忆正在重现。",
    good: "第二幕：及时回头并不难。那些仍有机会回头的人生在圣光中展开。",
    true: "第三幕：人类的诞生来自永不放弃。真结局的记忆穿透魔气。",
    intermission: "中场休息。使用七大欲的馈赠可以跳过下一幕动画，直接进入终局。",
    abyss: "第四幕：正是修行时。圣徒打穿无尽深渊的记忆在精神世界中重现。",
    final: "圣徒依然温柔地看着你，没有说什么；随后看向你更远的身后，带着一瞬间的失神。",
    "new-saint": "第五幕：新圣徒的诞生。天父在上的圣光落向祭祀台。",
    complete: "本周圣徒讨伐已经结算。",
  };
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function action(label, choice, disabled) {
    const button = node("button", "", label);
    button.type = "button"; button.disabled = busy || disabled;
    button.addEventListener("click", () => advance(choice));
    return button;
  }
  function buttons(trial) {
    if (!trial || trial.stage === "complete") {
      return [action("开始周常讨伐", "start")];
    }
    const stage = trial.stage;
    if (stage === "intro") return [
      action("选择背叛", "betray"), action("选择拒绝", "refuse")];
    if (stage === "gift-choice") return [
      action("使用七大欲的馈赠", "use", trial.gifts < 1),
      action("拒绝，正常顺序播放", "decline")];
    if (stage === "ordinary") return [
      action("接受圣光的洗礼", "fail"), action("释放魔气（4/4）", "hold")];
    if (stage === "good") return [
      action("接受圣光的洗礼", "fail"), action("释放魔物（3/4）", "hold")];
    if (stage === "true") return [
      action("留下眼泪，默念圣光的祈祷词", "fail"),
      action("释放魔气（2/4）", "hold")];
    if (stage === "intermission") return [
      action("使用七大欲的馈赠", "use", trial.gifts < 1),
      action("不使用，继续下一幕", "decline")];
    if (stage === "abyss") return [
      action("向圣徒认错，那天被拯救的人里也有他", "fail"),
      action("释放魔气（1/4）", "hold")];
    if (stage === "final") return [
      action("认输吧，你知道的吧", "threaten"),
      action("认输吧，你知道的吧", "reluctant")];
    if (stage === "new-saint") return [
      action("放下武器，接受审判", "surrender"),
      action("使用七大欲的馈赠", "gift", trial.gifts < 1)];
    return [];
  }
  function play(stage) {
    if (!stage || stage === lastStage) return;
    lastStage = stage;
    LG.saintTrialCinema.play(stage);
  }
  function render() {
    if (!dialog) return;
    const data = LG.infernalChurch.data();
    const trial = data.saintTrial;
    const stage = trial?.stage || "intro";
    copy.textContent = stageCopy[stage] || stageCopy.intro;
    gift.textContent = `七大欲的馈赠 ${trial?.gifts ?? 3}/3`;
    choices.replaceChildren(...buttons(trial));
    play(trial?.stage);
  }
  async function advance(choice) {
    if (busy) return;
    busy = true; render();
    try {
      const method = choice === "start" ? "startSaintTrial" : "advanceSaintTrial";
      const result = await LG.authority.mutate(method,
        choice === "start" ? {} : { choice });
      status.textContent = result.message;
      if (result.life?.endingId) {
        dialog.close(); LG.ui.render(LG.authority.state());
      } else render();
    } catch (err) {
      console.error("圣徒讨伐失败:", err?.code, err?.message, err?.stack);
      status.textContent = err?.message || "圣徒讨伐暂时无法继续。";
    } finally {
      busy = false; render();
    }
  }
  function build() {
    dialog = node("dialog", "priestess-trial-dialog saint-trial-dialog");
    dialog.innerHTML = `<div class="trial-heading"><div><span class="event-type">
      圣光教团 · 圣徒对话</span><h2>挑战圣徒的精神世界</h2></div>
      <button type="button">关闭</button></div><img alt="圣徒">
      <strong class="saint-trial-gift"></strong><p class="trial-copy"></p>
      <p class="system-status" role="status"></p><div class="trial-actions"></div>`;
    dialog.querySelector("img").src = LG.CONFIG.assets.protagonistFemaleSaintSet;
    dialog.querySelector(".trial-heading button")
      .addEventListener("click", () => dialog.close());
    gift = dialog.querySelector(".saint-trial-gift");
    copy = dialog.querySelector(".trial-copy");
    status = dialog.querySelector(".system-status");
    choices = dialog.querySelector(".trial-actions");
    document.body.append(dialog);
  }
  LG.saintTrialUI = {
    open() {
      if (!dialog) build();
      lastStage = "";
      render();
      if (!dialog.open) dialog.showModal();
    },
  };
})(window.LifeGame);
