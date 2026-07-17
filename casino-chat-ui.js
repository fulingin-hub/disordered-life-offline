(function (LG) {
  const el = {};
  let getState;
  let activeCharacter = null;
  let pendingMessage = null;
  let pendingInput = "";
  let requestId = 0;

  function message(role, content, extraClass) {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extraClass ? ` ${extraClass}` : ""}`;
    item.textContent = content;
    el.messages.append(item);
    while (el.messages.children.length > 42) {
      el.messages.firstElementChild.remove();
    }
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }

  function release() {
    pendingMessage = null;
    pendingInput = "";
    el.input.disabled = false;
    el.send.disabled = !LG.dialogueAI.canUseRoom(activeCharacter);
    el.send.textContent = LG.dialogueAI.roomActionLabel();
    el.status.textContent = LG.dialogueAI.roomStatus(activeCharacter);
  }

  async function syncPoints(stage) {
    try {
      await LG.authority.sync();
      LG.traitsUI.refresh();
      LG.casinoShopUI.refresh();
    } catch (err) {
      console.error(`${stage}同步失败:`, err?.code, err?.message, err?.stack);
    }
  }

  async function send(text) {
    if (!activeCharacter || LG.dialogueAI.isBusy()) return;
    const scene = LG.dialogueScenes.room(activeCharacter);
    const currentId = ++requestId;
    pendingInput = text;
    message("user", text);
    pendingMessage = message("assistant", "正在思考…", "loading");
    el.status.textContent = "正在验证贡金周期并生成回复，成功回复才计入本轮次数。";
    el.input.disabled = true;
    el.send.disabled = true;
    el.send.textContent = "回应中…";
    try {
      const response = await LG.dialogueAI.request(
        scene,
        { id: `room-${activeCharacter}`, title: scene.title },
        LG.casino.aiState(activeCharacter, getState()),
        text,
        (content) => {
          if (currentId === requestId && pendingMessage) {
            pendingMessage.textContent = content || "正在思考…";
          }
        },
      );
      if (!response || currentId !== requestId) return release();
      if (currentId !== requestId) return;
      if (pendingMessage) {
        pendingMessage.textContent = response;
        pendingMessage.classList.remove("loading");
      }
      await syncPoints("赌场角色对话周期");
      release();
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
    } catch (err) {
      if (currentId !== requestId) return;
      console.error("赌场角色对话失败:", err.code, err.message, err.stack);
      if (pendingMessage) {
        pendingMessage.textContent = LG.dialogueAI.errorMessage(err);
        pendingMessage.className = "chat-message assistant error";
      }
      pendingMessage = null;
      el.input.value = pendingInput;
      await syncPoints("赌场角色失败状态");
      el.status.textContent = "发送失败，本轮次数不会消耗；首次贡金失败会自动退款。";
      el.input.disabled = false;
      el.send.disabled = !LG.dialogueAI.canUseRoom(activeCharacter);
      el.send.textContent = LG.dialogueAI.roomActionLabel();
    }
  }

  function close() {
    requestId += 1;
    LG.dialogueAI.cancel();
    activeCharacter = null;
    el.chat.hidden = true;
    el.tabs.hidden = false;
    el.shop.hidden = false;
    LG.casinoShopUI.refresh();
  }

  LG.casinoChatUI = {
    init(stateProvider) {
      getState = stateProvider;
      el.chat = document.getElementById("casinoChat");
      el.tabs = document.getElementById("casinoTabs");
      el.game = document.getElementById("casinoGameView");
      el.shop = document.getElementById("casinoShopView");
      el.portrait = document.getElementById("casinoChatPortrait");
      el.location = document.getElementById("casinoChatLocation");
      el.character = document.getElementById("casinoChatCharacter");
      el.messages = document.getElementById("casinoChatMessages");
      el.status = document.getElementById("casinoChatStatus");
      el.form = document.getElementById("casinoChatForm");
      el.input = document.getElementById("casinoChatInput");
      el.send = document.getElementById("casinoChatSend");
      document.getElementById("backCasinoShopButton").addEventListener("click", close);
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        el.input.value = "";
        send(text);
      });
    },
    open(characterId) {
      if (!LG.casino.canChat(characterId)) return false;
      const character = LG.CASINO_DATA.byId[characterId];
      const scene = LG.dialogueScenes.room(characterId);
      activeCharacter = characterId;
      el.tabs.hidden = true;
      el.game.hidden = true;
      el.shop.hidden = true;
      el.chat.hidden = false;
      el.portrait.src = character.portrait;
      el.portrait.alt = character.role;
      el.location.textContent = scene.location;
      el.character.textContent = scene.name;
      el.messages.replaceChildren();
      const history = LG.casino.conversation(characterId);
      history.forEach((item) => message(item.role, item.content));
      if (!history.length) message("assistant", scene.opener);
      release();
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
      return true;
    },
    leave() {
      requestId += 1;
      LG.dialogueAI.cancel();
      activeCharacter = null;
      if (el.chat) {
        el.chat.hidden = true;
        el.tabs.hidden = false;
      }
    },
  };
})(window.LifeGame);
