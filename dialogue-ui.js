(function (LG) {
  const el = {};
  let callbacks = {};
  let currentScene = null;
  let currentEvent = null;
  let currentState = null;
  let pendingMessage = null;
  let pendingInput = "";
  let eventQuoteHidden = null;

  function message(role, content, extraClass) {
    const item = document.createElement("div");
    item.className = `chat-message ${role}${extraClass ? ` ${extraClass}` : ""}`;
    item.textContent = content;
    el.messages.append(item);
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }

  function usage() {
    return currentState?.chatUsage?.[currentEvent?.id] || 0;
  }

  function updateAvailability() {
    const remaining = Math.max(0, 3 - usage());
    el.status.className = "chat-status";
    el.status.textContent = remaining
      ? `本次事件还可对话 ${remaining} 次`
      : "本次事件的对话次数已用完";
    el.input.disabled = remaining === 0;
    el.send.disabled = remaining === 0;
  }

  function renderHistory() {
    el.messages.replaceChildren();
    const history = currentState.conversations?.[currentScene.character] || [];
    history.slice(-8).forEach((item) => message(item.role, item.content));
    if (!history.some((item) => item.eventId === currentEvent.id)) {
      message("assistant", currentScene.opener);
    }
    updateAvailability();
  }

  LG.dialogueUI = {
    init(nextCallbacks) {
      callbacks = nextCallbacks;
      el.talk = document.getElementById("talkButton");
      el.panel = document.getElementById("chatPanel");
      el.location = document.getElementById("chatLocation");
      el.character = document.getElementById("chatCharacter");
      el.messages = document.getElementById("chatMessages");
      el.status = document.getElementById("chatStatus");
      el.form = document.getElementById("chatForm");
      el.input = document.getElementById("chatInput");
      el.send = document.getElementById("chatSendButton");
      el.eventText = document.getElementById("eventText");
      el.eventQuote = document.getElementById("eventQuote");
      el.choiceList = document.getElementById("choiceList");
      el.talk.addEventListener("click", () => this.open());
      document.getElementById("closeChatButton").addEventListener("click", () => this.close());
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled) return;
        if (LG.dialogueAI.isBusy()) {
          this.busyNotice();
          return;
        }
        el.input.value = "";
        callbacks.onSend(text);
      });
    },
    configure(state, event) {
      this.close(true);
      currentState = state;
      currentEvent = event;
      currentScene = LG.dialogueScenes.get(event?.id);
      el.talk.hidden = !currentScene;
      if (!currentScene) return;
      el.talk.textContent = `进入${currentScene.location}，与${currentScene.name}对话`;
      el.location.textContent = currentScene.location;
      el.character.textContent = currentScene.name;
    },
    open() {
      if (!currentScene) return;
      el.eventText.hidden = true;
      eventQuoteHidden = el.eventQuote.hidden;
      el.eventQuote.hidden = true;
      el.choiceList.hidden = true;
      el.talk.hidden = true;
      el.panel.hidden = false;
      renderHistory();
      if (LG.dialogueAI.isBusy()) this.busyNotice();
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
    },
    close(silent) {
      if (!el.panel) return;
      el.panel.hidden = true;
      el.eventText.hidden = false;
      if (eventQuoteHidden !== null) {
        el.eventQuote.hidden = eventQuoteHidden;
        eventQuoteHidden = null;
      }
      el.choiceList.hidden = false;
      el.talk.hidden = !currentScene;
      pendingMessage = null;
      if (!silent) callbacks.onClose();
    },
    reset() {
      currentScene = null;
      currentEvent = null;
      currentState = null;
      this.close(true);
      el.talk.hidden = true;
    },
    begin(text) {
      pendingInput = text;
      message("user", text);
      pendingMessage = message("assistant", "正在思考…", "loading");
      el.status.className = "chat-status";
      el.status.textContent = "正在生成回复，通常需要 10–20 秒";
      el.input.disabled = true;
      el.send.disabled = true;
    },
    update(content) {
      if (!pendingMessage) return;
      pendingMessage.textContent = content || "正在思考…";
      el.messages.scrollTop = el.messages.scrollHeight;
    },
    complete(content) {
      if (pendingMessage) {
        pendingMessage.textContent = content;
        pendingMessage.classList.remove("loading");
      }
      pendingMessage = null;
      pendingInput = "";
      updateAvailability();
      if (!el.input.disabled && window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
    },
    fail(text) {
      if (pendingMessage) {
        pendingMessage.textContent = text;
        pendingMessage.className = "chat-message assistant error";
      }
      pendingMessage = null;
      el.input.value = pendingInput;
      el.status.className = "chat-status error";
      el.status.textContent = "发送失败，可修改后重试或返回事件。";
      el.input.disabled = false;
      el.send.disabled = false;
    },
    busyNotice() {
      el.status.className = "chat-status";
      el.status.textContent = "上一条回复仍在生成，完成前不会重复请求。";
      el.input.disabled = true;
      el.send.disabled = true;
    },
    release() {
      updateAvailability();
    },
  };
})(window.LifeGame);
