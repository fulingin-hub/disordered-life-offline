(function (LG) {
  const el = {};
  let active = null, pending = null, requestId = 0;
  function message(role, text, extra) {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extra ? ` ${extra}` : ""}`;
    item.textContent = text;
    el.messages.append(item);
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }
  function release() {
    el.input.disabled = false;
    el.send.disabled = !LG.dialogueAI.canUseRoom(active);
    el.send.textContent = LG.dialogueAI.roomActionLabel();
    el.status.textContent = LG.dialogueAI.roomStatus(active);
    pending = null;
  }
  function close() {
    requestId += 1;
    LG.dialogueAI.cancel();
    active = null;
    if (el.dialog.open) el.dialog.close();
  }
  async function send(text) {
    if (!active || LG.dialogueAI.isBusy()) return;
    const current = ++requestId;
    const scene = LG.dialogueScenes.room(active);
    message("user", text);
    pending = message("assistant", "正在思考…", "loading");
    el.input.disabled = true;
    el.send.disabled = true;
    el.send.textContent = "回应中…";
    el.status.textContent = "正在验证对话周期并生成回复。";
    try {
      const response = await LG.dialogueAI.request(
        scene,
        { id: `room-${active}`, title: scene.title },
        LG.otherworldCharacters.aiState(active),
        text,
        (content) => {
          if (current === requestId && pending) pending.textContent = content || "正在思考…";
        },
      );
      if (!response || current !== requestId) return release();
      pending.textContent = response;
      pending.classList.remove("loading");
      await LG.authority.sync();
      LG.traitsUI.refresh();
      release();
    } catch (err) {
      if (current !== requestId) return;
      console.error("异界联盟角色对话失败:", err?.code, err?.message, err?.stack);
      pending.textContent = LG.dialogueAI.errorMessage(err);
      pending.className = "chat-message assistant error";
      el.status.textContent = "发送失败，本轮次数不会消耗；首次扣费会自动退款。";
      el.input.disabled = false;
      el.send.disabled = !LG.dialogueAI.canUseRoom(active);
      el.send.textContent = LG.dialogueAI.roomActionLabel();
      pending = null;
    }
  }
  LG.otherworldCharacterChatUI = {
    init() {
      ["dialog", "portrait", "location", "name", "messages", "status", "form",
        "input", "send"].forEach((key) => {
        const id = `otherworldChat${key[0].toUpperCase()}${key.slice(1)}`;
        el[key] = document.getElementById(id);
      });
      document.getElementById("closeOtherworldChatButton").addEventListener("click", close);
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
      });
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        el.input.value = "";
        send(text);
      });
    },
    open(characterId) {
      if (!LG.otherworldCharacters.canChat(characterId)) return false;
      const character = LG.OTHERWORLD_CHARACTER_DATA.byId[characterId];
      const scene = LG.dialogueScenes.room(characterId);
      active = characterId;
      el.portrait.src = character.portrait;
      el.portrait.alt = character.role;
      el.location.textContent = scene.location;
      el.name.textContent = scene.name;
      el.messages.replaceChildren();
      message("assistant", scene.opener);
      release();
      el.dialog.showModal();
      return true;
    },
  };
})(window.LifeGame);
