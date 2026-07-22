(function (LG) {
  let getGameState;
  let activeRequest = 0;

  async function send(character, text) {
    if (LG.dialogueAI.isBusy()) return;
    const scene = LG.dialogueScenes.room(character);
    const market = LG.blackMarket.isCharacter(character);
    const unlocked = market
      ? LG.blackMarket.roomUnlocked(character) : LG.achievements.isUnlocked(character);
    const canChat = market
      ? LG.blackMarket.canChat(character) : LG.tribute.canChat(character);
    if (!scene || !unlocked || !canChat) return;
    const requestId = ++activeRequest;
    const event = { id: `room-${character}`, title: scene.title };
    const aiState = market
      ? LG.blackMarket.aiState(character, getGameState())
      : LG.achievements.aiState(character, getGameState());
    LG.roomsUI.begin(text);
    try {
      const response = await LG.dialogueAI.request(
        scene,
        event,
        aiState,
        text,
        (content) => {
          if (requestId === activeRequest) LG.roomsUI.update(content);
        },
      );
      if (!response || requestId !== activeRequest) {
        LG.roomsUI.release();
        return;
      }
      LG.roomsUI.update(response);
      try {
        await LG.authority.sync();
        LG.traitsUI.refresh();
      } catch (syncError) {
        console.error("房间对话周期同步失败:", syncError?.code, syncError?.message, syncError?.stack);
      }
      if (requestId === activeRequest) LG.roomsUI.complete(response);
    } catch (err) {
      if (requestId !== activeRequest) return;
      console.error("房间对话失败:", err.code, err.message, err.stack);
      try {
        await LG.authority.sync();
        LG.traitsUI.refresh();
      } catch (syncError) {
        console.error("房间失败状态同步失败:", syncError?.code, syncError?.message, syncError?.stack);
      }
      LG.roomsUI.fail(LG.dialogueAI.errorMessage(err));
    }
  }

  function leave() {
    activeRequest += 1;
    LG.dialogueAI.cancel();
    LG.tributeUI.leave();
    LG.blackMarketUI.leave();
  }

  LG.rooms = {
    init(stateProvider) {
      getGameState = stateProvider;
      LG.roomConsumablesUI.init(stateProvider);
      LG.roomsUI.init({
        onEnter: (character) => LG.roomsUI.enter(character),
        onEnterPlayer: () => {
          if (LG.contentMode?.guardGallery?.()) return;
          LG.roomsUI.close();
          LG.playerGalleryUI.open();
        },
        onEnterCasino: () => {
          LG.roomsUI.close();
          LG.casinoUI.open();
        },
        onEnterBlackPrison: () => {
          LG.roomsUI.close();
          LG.blackPrisonUI.open();
        },
        onEnterPenitentiary: () => {
          LG.roomsUI.close();
          LG.penitentiaryUI.open();
        },
        onEnterVehicle: () => {
          LG.roomsUI.close();
          LG.vehicleUI.open();
        },
        onSend: send,
        onLeave: leave,
      });
    },
  };
})(window.LifeGame);
