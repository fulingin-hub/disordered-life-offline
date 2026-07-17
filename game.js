(function (LG) {
  let state;
  let archive = { male: [], female: [] };
  let busy = false;

  function operationError(err, fallback) {
    console.error(fallback, err?.code, err?.message, err?.stack);
    if (err?.code === "function_not_published") {
      return "权威结算服务尚未发布，请先保存游戏。";
    }
    if (err?.code === "TIMEOUT") return "读取权威存档超时，请点击重试。";
    if (err?.code === "function_error") return err.message || "服务端拒绝了这次操作。";
    return "网络或结算服务暂时不可用，请稍后重试。";
  }

  function adopt(result) {
    state = result.life;
    archive = result.archive;
  }

  async function choose(index) {
    if (busy || state.endingId || !state.gender) return;
    const event = LG.engine.current(state);
    if (!event || event.choices[index]?.locked) return;
    busy = true;
    LG.dialogueAI.cancel();
    LG.dialogueUI.close(true);
    LG.ui.setLocked(true);
    LG.audio.choose();
    try {
      const result = await LG.authority.mutate("choose", {
        eventId: event.id,
        choiceIndex: index,
      });
      adopt(result);
      LG.ui.showOutcome(result.message);
      if (state.endingId) LG.audio.ending(Boolean(state.currentEnding?.ordinary));
      LG.roomsUI.refresh();
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      LG.dailyTasksUI.refresh();
      window.setTimeout(() => {
        LG.ui.hideOutcome();
        LG.ui.transition(() => LG.ui.render(state));
      }, 650);
    } catch (err) {
      LG.ui.showOutcome(operationError(err, "服务端结算失败:"));
      window.setTimeout(() => LG.ui.hideOutcome(), 1800);
    } finally {
      busy = false;
      LG.ui.setLocked(false);
    }
  }

  async function restart(force) {
    if (busy && !state.endingId) return;
    if (!force && !state.endingId && state.history.length
      && !window.confirm("放弃当前人生并重新出生？")) return;
    busy = true;
    LG.dialogueAI.cancel();
    LG.dialogueUI.close(true);
    try {
      const result = await LG.authority.mutate("restart");
      adopt(result);
      LG.ui.hideOutcome();
      LG.ui.transition(() => LG.ui.render(state));
      if (!state.gender) LG.genderUI.open();
    } catch (err) {
      LG.ui.showOutcome(operationError(err, "重新出生失败:"));
    } finally {
      busy = false;
    }
  }

  function openArchive() {
    LG.ui.showArchive(archive, state.gender || "male");
  }

  function toggleSound() {
    LG.ui.updateSound(LG.audio.toggle());
  }

  async function sendDialogue(text) {
    if (busy || state.endingId || LG.dialogueAI.isBusy()) return;
    const event = LG.engine.current(state);
    const scene = LG.dialogueScenes.get(event?.id);
    if (!scene) return;
    LG.dialogueUI.begin(text);
    try {
      const response = await LG.dialogueAI.request(
        scene,
        event,
        state,
        text,
        (content) => LG.dialogueUI.update(content),
      );
      if (!response) return LG.dialogueUI.release();
      const history = state.conversations?.[scene.character] || [];
      history.push(
        { role: "user", content: text, eventId: event.id },
        { role: "assistant", content: response, eventId: event.id },
      );
      state.conversations = state.conversations || {};
      state.conversations[scene.character] = history.slice(-16);
      LG.dialogueUI.complete(response);
    } catch (err) {
      console.error("角色对话失败:", err?.code, err?.message, err?.stack);
      LG.dialogueUI.fail(LG.dialogueAI.errorMessage(err));
    }
  }

  async function selectGender(gender) {
    const result = await LG.authority.mutate("selectGender", { gender });
    adopt(result);
    LG.ui.render(state);
  }

  async function boot() {
    LG.loader.start();
    await LG.loader.waitForSdk();
    await LG.loader.preload();
    LG.authority.subscribe(adopt);
    const result = await LG.authority.sync();
    adopt(result);
    await LG.loader.preloadState(state);
    LG.ui.init({
      onChoice: choose,
      onRestart: restart,
      onArchive: openArchive,
      onSound: toggleSound,
    });
    LG.dialogueUI.init({
      onSend: sendDialogue,
      onClose: () => LG.dialogueAI.cancel(),
    });
    LG.cgUI.init();
    LG.genderUI.init(selectGender);
    LG.playerGalleryUI.init({ getArchive: () => archive, getState: () => state });
    LG.tributeUI.init();
    LG.blackMarketUI.init(() => state);
    LG.casinoUI.init(() => state);
    LG.rooms.init(() => state);
    LG.traitsUI.init();
    LG.equipmentUI.init({ getState: () => state, onChange: () => LG.ui.render(state) });
    LG.collectiblesUI.init();
    LG.dailyTasksUI.init();
    LG.ui.render(state);
    if (!state.gender) LG.genderUI.open();
    LG.ui.updateSound(LG.audio.isEnabled());
    LG.loader.ready();
  }

  boot().catch((err) => {
    LG.loader.error(err);
    document.getElementById("bootSplash")?.remove();
    window.LifeGameBoot?.stop?.();
    document.getElementById("bootErrorText").textContent =
      operationError(err, "游戏启动失败:");
    document.getElementById("bootError").hidden = false;
  });
  document.getElementById("bootRetryButton")
    .addEventListener("click", () => window.location.reload());
})(window.LifeGame);
