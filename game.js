(function (LG) {
  let state, archive = { male: [], female: [] };
  let busy = false, queuedRestart = null;
  function operationError(err, fallback) {
    console.error(fallback, err?.code, err?.message, err?.stack);
    if (err?.code === "function_not_published")
      return "权威结算服务尚未发布，请先保存游戏。";
    if (String(err?.code || "").toLowerCase().includes("forbidden_dev_mode")) {
      return "平台结算模式暂不可用，请退出后重新进入游戏。";
    }
    if (err?.code === "SDK_UNAVAILABLE" || err?.code === "FUNCTION_UNAVAILABLE")
      return "平台连接尚未就绪，请退出后重新进入游戏。";
    if (err?.code === "TIMEOUT") return "读取权威存档超时，请点击重试。";
    if (err?.code === "AUTHORITY_RESULT_UNKNOWN")
      return "结算结果仍在确认中，再次尝试只会继续确认，不会重复重生。";
    if (LG.authorityRetry.isTransient(err))
      return "权威存档服务暂时繁忙，请等待几秒后点击重试。";
    if (err?.code === "CAPTCHA_REQUIRED") return err.message;
    if (err?.code === "function_error") return err.message || "服务端拒绝了这次操作。";
    return "网络或结算服务暂时不可用，请稍后重试。";
  } function adopt(result) { state = result.life;
    archive = result.archive; LG.contentMode?.sync?.(result);
  }
  async function recoverStaleEvent(err) {
    if (err?.code !== "function_error"
      || err?.message !== "stale or invalid event") return false;
    try {
      adopt(await LG.authority.sync());
      LG.ui.render(state);
      LG.ui.showOutcome("人生事件已同步，请按当前事件重新选择。");
    } catch (syncErr) {
      LG.ui.showOutcome(operationError(syncErr, "事件同步失败:"));
    }
    return true;
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
      const result = await LG.authority.mutate("choose",
        { eventId: event.id, choiceIndex: index });
      adopt(result);
      LG.ui.showOutcome(result.message);
      if (state.endingId) LG.audio.ending(Boolean(state.currentEnding?.ordinary));
      LG.roomsUI.refresh(); LG.traitsUI.refresh();
      LG.collectiblesUI.refresh(); LG.careerUI.refresh();
      LG.dailyTasksUI.refresh();
      window.setTimeout(() => {
        LG.ui.hideOutcome();
        LG.ui.transition(() => LG.ui.render(state));
      }, 650);
    } catch (err) {
      if (!await recoverStaleEvent(err)) {
        LG.ui.showOutcome(operationError(err, "服务端结算失败:"));
      }
      window.setTimeout(() => LG.ui.hideOutcome(), 1800);
    } finally {
      busy = false;
      LG.ui.setLocked(false);
      if (queuedRestart) {
        const pending = queuedRestart;
        queuedRestart = null;
        restart(pending.force);
      }
    }
  }
  async function restart(force) {
    if (busy && !state.endingId) {
      queuedRestart = { force };
      LG.ui.showOutcome("当前结算完成后将自动重新出生。");
      return;
    }
    if (!force && !state.endingId && state.history.length
      && !window.confirm("放弃当前人生并重新出生？")) return;
    busy = true;
    LG.ui.setRestarting(true);
    LG.ui.showOutcome("正在保存当前进度并重新出生…");
    LG.dialogueAI.cancel(); LG.narration?.conceal?.();
    LG.dialogueUI.close(true);
    try {
      const result = await LG.authority.mutate("restart");
      adopt(result);
      await LG.loader.preloadState(state);
      LG.ui.hideOutcome();
      LG.ui.transition(() => {
        LG.ui.render(state);
        if (!state.gender) LG.genderUI.open();
        else requestAnimationFrame(() => LG.narration?.reveal?.());
      });
    } catch (err) {
      const detail = operationError(err, "重新出生失败:");
      LG.narration?.reveal?.();
      LG.ui.showOutcome(`重新出生失败，当前存档未改变。${detail}`,
        () => restart(force));
    } finally {
      busy = false;
      LG.ui.setRestarting(false);
    }
  } function openArchive() {
    LG.ui.showArchive(archive, state.gender || "male");
  }
  function toggleSound() { LG.ui.updateSound(LG.audio.toggle()); }
  async function sendDialogue(text) {
    if (busy || state.endingId || LG.dialogueAI.isBusy()) return;
    const event = LG.engine.current(state);
    const scene = LG.dialogueScenes.get(event?.id);
    if (!scene) return;
    LG.dialogueUI.begin(text);
    try {
      const response = await LG.dialogueAI.request(scene, event, state, text,
        (content) => LG.dialogueUI.update(content));
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
  async function selectGender(gender) { adopt(await LG.authority.mutate(
    "selectGender", { gender })); LG.ui.render(state);
    requestAnimationFrame(() => LG.narration?.reveal?.()); }
  async function selectContentMode(contentMode, downgraded) {
    const result = await LG.authority.mutate("selectContentMode", { contentMode }); adopt(result);
    LG.ui.render(state);
    if (downgraded) window.dzmm?.toast?.success?.(result.message); else if (!state.gender) LG.genderUI.open();
  }
  async function boot() {
    LG.loader.start(); await LG.loader.waitForSdk();
    LG.loader.stage("正在检查存档完整性"); await LG.saveRecoveryData.rollbackPending();
    await LG.loader.preload(); LG.authority.subscribe(adopt);
    LG.loader.stage("正在连接权威存档"); const result = await LG.authority.sync({ retries: 1 }); adopt(result);
    await LG.loader.preloadState(state);
    LG.ui.init({
      onChoice: choose,
      onRestart: restart,
      onArchive: openArchive,
      onSound: toggleSound,
    });
    LG.audio.init(); LG.narration.init();
    LG.achievementFeedback.init();
    LG.dialogueUI.init({
      onSend: sendDialogue,
      onClose: () => LG.dialogueAI.cancel(),
    });
    LG.cgUI.init(); LG.contentModeUI.init(selectContentMode); LG.genderUI.init(selectGender);
    LG.playerGalleryUI.init({ getArchive: () => archive, getState: () => state });
    LG.tributeUI.init();
    LG.blackMarketUI.init(() => state);
    LG.casinoUI.init(() => state);
    LG.edenCharacterChatUI.init();
    LG.edenCharacterUI.init();
    LG.blackPrisonUI.init();
    LG.blackPrisonOutfitUI.init();
    LG.penitentiaryUI.init(() => state);
    LG.infernalUI.init();
    LG.abyssUI.init();
    LG.infernalStompPopup.init(); LG.factionLeaderSacrifice.init(); LG.infernalChurchUI.init(); LG.infernalChurchMissionsUI.init(); LG.buttImpactPopup.init();
    LG.infernalClubChatUI.init(); LG.infernalClubUI.init();
    LG.vehicleUI.init(); LG.otherworldCharacterUI.init(); LG.goldenHorizonUI.init();
    LG.rooms.init(() => state);
    LG.traitsUI.init();
    LG.specialOutfitUI.init({ getState: () => state, onChange: () => LG.ui.render(state) });
    LG.equipmentUI.init({ getState: () => state, onChange: () => LG.ui.render(state) });
    LG.vehicleProfileUI.init({ getState: () => state });
    LG.collectiblesUI.init(), LG.careerCharacterChatUI.init(),
    LG.factionStoreUI.init(), LG.casinoFactionUI.init(),
    LG.careerUI.init(); LG.dailyTasksUI.init();
    LG.ui.render(state);
    if (!result.contentMode) LG.contentModeUI.open();
    else if (!state.gender) LG.genderUI.open();
    LG.ui.updateSound(LG.audio.isEnabled());
    LG.loader.ready(() => {
      if (result.contentMode && state.gender) LG.narration.reveal();
      LG.loader.defer(() => LG.cinemaNarrator.init());
    });
  }
  boot().catch((err) => {
    if (err?.code === "ABORTED"
      || /service destroyed/i.test(String(err?.message || ""))) return;
    LG.loader.error(err); document.getElementById("bootSplash")?.remove();
    window.LifeGameBoot?.stop?.();
    document.getElementById("bootErrorText").textContent =
      operationError(err, "游戏启动失败:");
    document.getElementById("bootError").hidden = false;
  });
  document.getElementById("bootRetryButton").addEventListener("click", () => window.location.reload());
})(window.LifeGame);
