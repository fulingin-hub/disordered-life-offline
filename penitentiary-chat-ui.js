(function (LG) {
  const el = {};
  let getState, activeStage = 1, requestId = 0;
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
  function updateAccess(role) {
    const unlocked = LG.penitentiary.canChat(role.id);
    const pass = LG.penitentiary.chatPass(role.id);
    const affordable = pass > 0 || LG.penitentiary.coupons()
      >= LG.penitentiary.chatCost(role.id);
    el.input.disabled = !unlocked || !affordable;
    el.send.disabled = !unlocked || !affordable;
    el.input.placeholder = !unlocked ? "获得对应角色认可奖状后可开始对话"
      : affordable ? `与${role.name}交谈` : "赎罪卷不足，先完成影狱任务";
    return { unlocked, affordable };
  }
  function render(stage) {
    activeStage = stage;
    requestId += 1;
    LG.dialogueAI.cancel();
    const role = LG.PENITENTIARY_DATA.roles[stage - 1];
    const { unlocked, affordable } = updateAccess(role);
    el.messages.replaceChildren();
    const scene = LG.dialogueScenes.room(role.id);
    message("assistant", !unlocked ? "先完成角色图鉴并获得认可奖状。"
      : affordable ? `${scene.opener} ${LG.penitentiary.chatStatus(role.id)}`
        : `赎罪卷不足。${LG.penitentiary.chatStatus(role.id)}`);
  }
  async function send(text) {
    const role = LG.PENITENTIARY_DATA.roles[activeStage - 1];
    if (!LG.penitentiary.canChat(role.id) || LG.dialogueAI.isBusy()) return;
    const scene = LG.dialogueScenes.room(role.id);
    const id = ++requestId;
    message("user", text);
    const pending = message("assistant", "正在回应…", "loading");
    el.input.disabled = true; el.send.disabled = true;
    try {
      const response = await LG.dialogueAI.request(
        scene, { id: `room-${role.id}`, title: scene.title },
        LG.penitentiary.aiState(role.id, getState()), text,
        (content) => { if (id === requestId) pending.textContent = content || "正在回应…"; },
      );
      if (id !== requestId) return;
      pending.textContent = response;
      pending.classList.remove("loading");
      await LG.authority.sync();
      LG.penitentiaryUI.status(LG.penitentiary.chatStatus(role.id));
    } catch (err) {
      if (id !== requestId) return;
      console.error("影狱角色对话失败:", err?.code, err?.message, err?.stack);
      pending.textContent = LG.dialogueAI.errorMessage(err);
      pending.className = "chat-message assistant error";
    } finally {
      if (id === requestId) {
        updateAccess(role);
      }
    }
  }
  LG.penitentiaryChatUI = {
    init(stateProvider) {
      getState = stateProvider;
      el.messages = document.getElementById("penitentiaryChatMessages");
      el.form = document.getElementById("penitentiaryChatForm");
      el.input = document.getElementById("penitentiaryChatInput");
      el.send = document.getElementById("penitentiaryChatSend");
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        el.input.value = "";
        send(text);
      });
    },
    render,
    leave() { requestId += 1; LG.dialogueAI.cancel(); },
  };
})(window.LifeGame);
