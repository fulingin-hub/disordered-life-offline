(function (LG) {
  const el = {};
  let active = null;
  let requestId = 0;

  function message(role, text, extra = "") {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extra ? ` ${extra}` : ""}`;
    item.textContent = text;
    el.messages.append(item);
    while (el.messages.children.length > 42) el.messages.firstElementChild.remove();
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }

  function release() {
    el.input.disabled = false;
    el.send.disabled = !LG.dialogueAI.canUseRoom(active);
    el.send.textContent = LG.dialogueAI.roomActionLabel();
    el.status.textContent = LG.dialogueAI.roomStatus(active);
  }

  function close() {
    requestId += 1;
    LG.dialogueAI.cancel();
    active = null;
    if (el.dialog.open) el.dialog.close();
  }

  function accessId(characterId) {
    return characterId === "fallenSaint" ? "holy-light-saint" : characterId;
  }

  function characterMeta(characterId) {
    if (characterId !== "fallenSaint") return LG.career.character(characterId);
    return {
      id: characterId,
      name: "堕落圣徒",
      role: "地狱教会 · 堕落圣徒",
      faction: "church",
    };
  }

  async function send(text) {
    if (!active || LG.dialogueAI.isBusy()) return;
    const current = ++requestId;
    const scene = LG.dialogueScenes.room(active);
    message("user", text);
    const pending = message("assistant", "正在思考…", "loading");
    el.input.disabled = true;
    el.send.disabled = true;
    el.send.textContent = "回应中…";
    try {
      const response = await LG.dialogueAI.request(
        scene, { id: `room-${active}`, title: scene.title },
        LG.career.aiState(), text, (content) => {
          if (current === requestId) pending.textContent = content || "正在思考…";
        });
      if (!response || current !== requestId) return;
      pending.textContent = response;
      pending.classList.remove("loading");
      await LG.authority.sync();
      release();
    } catch (err) {
      if (current !== requestId) return;
      console.error("势力角色对话失败:", err?.code, err?.message, err?.stack);
      pending.textContent = LG.dialogueAI.errorMessage(err);
      pending.className = "chat-message assistant error";
      release();
    }
  }

  LG.careerCharacterChatUI = {
    init() {
      ["dialog", "portrait", "location", "name", "messages", "status", "form",
        "input", "send"].forEach((key) => {
        const id = `careerCharacterChat${key[0].toUpperCase()}${key.slice(1)}`;
        el[key] = document.getElementById(id);
      });
      document.getElementById("closeCareerCharacterChatButton")
        .addEventListener("click", close);
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
      if (!LG.career.privateComplete(accessId(characterId))) return false;
      const character = characterMeta(characterId);
      if (!character) return false;
      active = characterId;
      requestId += 1;
      const scene = LG.dialogueScenes.room(active);
      el.portrait.src = characterId === "fallenSaint"
        ? LG.fallenSaintRoom.asset
        : LG.careerRoomPortraits.source(character, "private");
      el.portrait.alt = character.role || character.name;
      el.location.textContent = scene.location;
      el.name.textContent = character.name;
      el.messages.replaceChildren();
      message("assistant", scene.opener);
      release();
      el.dialog.showModal();
      return true;
    },
  };
})(window.LifeGame);
