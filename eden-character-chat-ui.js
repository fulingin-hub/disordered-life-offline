(function (LG) {
  const el = {};
  let active = null;
  let requestId = 0;

  function message(role, text, extra) {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extra ? ` ${extra}` : ""}`;
    item.textContent = text;
    el.messages.append(item);
    while (el.messages.children.length > 42) {
      el.messages.firstElementChild.remove();
    }
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }

  function release() {
    el.input.disabled = false;
    el.send.disabled = !LG.dialogueAI.canUseRoom(active);
    el.send.textContent = LG.dialogueAI.roomActionLabel();
    el.status.textContent = LG.dialogueAI.roomStatus(active);
  }

  async function send(text) {
    if (!active || LG.dialogueAI.isBusy()) return;
    const scene = LG.dialogueScenes.room(active);
    const id = ++requestId;
    message("user", text);
    const pending = message("assistant", "正在思考...", "loading");
    el.input.disabled = true;
    el.send.disabled = true;
    el.send.textContent = "回应中...";
    try {
      const response = await LG.dialogueAI.request(
        scene,
        { id: `room-${active}`, title: scene.title },
        LG.edenCharacters.aiState(active, LG.authority.state()),
        text,
        (content) => {
          if (id === requestId) pending.textContent = content || "正在思考...";
        },
      );
      if (!response || id !== requestId) return;
      pending.textContent = response;
      pending.classList.remove("loading");
      await LG.authority.sync();
      release();
    } catch (err) {
      if (id !== requestId) return;
      console.error("伊甸园角色对话失败:",
        err?.code, err?.message, err?.stack);
      pending.textContent = LG.dialogueAI.errorMessage(err);
      pending.className = "chat-message assistant error";
      release();
    }
  }

  LG.edenCharacterChatUI = {
    init() {
      [["messages", "edenCharacterChatMessages"],
        ["status", "edenCharacterChatStatus"],
        ["form", "edenCharacterChatForm"], ["input", "edenCharacterChatInput"],
        ["send", "edenCharacterChatSend"], ["location", "edenCharacterChatLocation"],
        ["name", "edenCharacterChatName"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        el.input.value = "";
        send(text);
      });
      document.getElementById("edenCharacterChatBack")
        .addEventListener("click", () => LG.edenCharacterUI.closeChat());
    },
    open(characterId) {
      active = characterId;
      requestId += 1;
      const character = LG.edenCharacters.character(active);
      const scene = LG.dialogueScenes.room(active);
      el.location.textContent = character.location;
      el.name.textContent = character.name;
      el.messages.replaceChildren();
      message("assistant", scene.opener);
      release();
    },
    leave() {
      requestId += 1;
      LG.dialogueAI.cancel();
      active = null;
    },
  };
})(window.LifeGame);
