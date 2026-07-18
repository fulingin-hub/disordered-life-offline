(function (LG) {
  const el = {};
  let activeQueen = null, requestId = 0;
  function message(role, text, extra) {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extra ? ` ${extra}` : ""}`;
    item.textContent = text;
    el.messages.append(item);
    while (el.messages.children.length > 42) el.messages.firstElementChild.remove();
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }
  function updateAccess() {
    if (!activeQueen) return;
    const allowed = LG.infernalClub.canChat(activeQueen.character);
    el.input.disabled = !allowed;
    el.send.disabled = !allowed;
    el.input.placeholder = allowed ? `与${activeQueen.title}交谈` : "人格值不足";
    el.status.textContent = LG.infernalClub.chatStatus(activeQueen.character);
  }
  async function send(text) {
    if (!activeQueen || LG.dialogueAI.isBusy()) return;
    const scene = LG.dialogueScenes.room(activeQueen.character);
    const id = ++requestId;
    message("user", text);
    const pending = message("assistant", "正在回应…", "loading");
    el.input.disabled = true;
    el.send.disabled = true;
    try {
      const response = await LG.dialogueAI.request(
        scene, { id: `room-${activeQueen.character}`, title: scene.title },
        LG.authority.state(), text,
        (content) => {
          if (id === requestId) pending.textContent = content || "正在回应…";
        },
      );
      if (id !== requestId) return;
      pending.textContent = response;
      pending.classList.remove("loading");
      await LG.authority.sync();
    } catch (err) {
      if (id !== requestId) return;
      console.error("地狱俱乐部对话失败:", err?.code, err?.message, err?.stack);
      pending.textContent = LG.dialogueAI.errorMessage(err);
      pending.className = "chat-message assistant error";
    } finally {
      if (id === requestId) updateAccess();
    }
  }
  LG.infernalClubChatUI = {
    init() {
      el.messages = document.getElementById("infernalClubChatMessages");
      el.form = document.getElementById("infernalClubChatForm");
      el.input = document.getElementById("infernalClubChatInput");
      el.send = document.getElementById("infernalClubChatSend");
      el.status = document.getElementById("infernalClubChatStatus");
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        el.input.value = "";
        send(text);
      });
    },
    enter(queen) {
      requestId += 1;
      LG.dialogueAI.cancel();
      activeQueen = queen;
      el.messages.replaceChildren();
      const scene = LG.dialogueScenes.room(queen.character);
      message("assistant", scene.opener);
      updateAccess();
    },
    leave() {
      requestId += 1;
      activeQueen = null;
      LG.dialogueAI.cancel();
    },
  };
})(window.LifeGame);
