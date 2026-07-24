(function (LG) {
  const messages = [];
  let busy = false;
  let latestRequest = 0;
  let activeRoot = null;

  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function scene() {
    return LG.dialogueScenes.get("phone-mia");
  }

  function ensureGreeting() {
    if (!messages.length) {
      messages.push({ role: "assistant", text: scene().opener });
    }
  }

  function messageNode(item) {
    const row = node("div", `mia-message ${item.role}`);
    row.append(node("span", "mia-message-label",
      item.role === "user" ? "你" : "弥娅"));
    row.append(node("p", "", item.text));
    return row;
  }

  function scrollToLatest(root) {
    const list = root?.querySelector(".mia-messages");
    if (list) list.scrollTop = list.scrollHeight;
  }

  function appendMessage(root, role, text) {
    const item = { role, text };
    messages.push(item);
    const rendered = messageNode(item);
    root.querySelector(".mia-messages").append(rendered);
    scrollToLatest(root);
    return rendered.querySelector("p");
  }

  function setBusy(root, next) {
    busy = next;
    root.querySelectorAll("button, input").forEach((control) => {
      control.disabled = next;
    });
    const send = root.querySelector(".mia-send");
    if (send) send.textContent = next ? "回应中…" : "发送";
  }

  async function send(root, rawText) {
    const text = String(rawText || "").trim().slice(0, 160);
    if (!text || busy || LG.dialogueAI.isBusy()) return;
    const requestId = ++latestRequest;
    appendMessage(root, "user", text);
    const pending = appendMessage(root, "assistant", "正在查阅档案…");
    pending.closest(".mia-message").classList.add("loading");
    setBusy(root, true);
    try {
      const reply = await LG.dialogueAI.request(
        scene(),
        { id: "phone-mia", kind: "assistant", title: "弥娅助手" },
        LG.authority.state(),
        text,
        (content) => {
          if (requestId !== latestRequest || root !== activeRoot) return;
          pending.textContent = content || "正在查阅档案…";
        },
      );
      if (requestId !== latestRequest || root !== activeRoot) return;
      if (!reply) {
        pending.closest(".mia-message").remove();
        messages.splice(-1, 1);
        return;
      }
      pending.textContent = reply;
      messages[messages.length - 1].text = reply;
      pending.closest(".mia-message").classList.remove("loading");
    } catch (err) {
      if (requestId !== latestRequest || root !== activeRoot) return;
      const copy = LG.dialogueAI.errorMessage(err);
      pending.textContent = copy;
      messages[messages.length - 1].text = copy;
      pending.closest(".mia-message").classList.remove("loading");
      pending.closest(".mia-message").classList.add("error");
      console.error("弥娅助手对话失败:", err?.code, err?.message, err?.stack);
    } finally {
      if (requestId === latestRequest && root === activeRoot) {
        setBusy(root, false);
        root.querySelector(".mia-input")?.focus();
        scrollToLatest(root);
      }
    }
  }

  function render(content, status) {
    ensureGreeting();
    const character = LG.MIA_CHARACTER;
    const shell = node("section", "phone-mia-assistant");
    const hero = node("header", "mia-assistant-hero");
    const portrait = node("img", "mia-assistant-portrait");
    portrait.src = character.portrait;
    portrait.alt = "弥娅";
    const identity = node("div", "mia-assistant-identity");
    identity.append(
      node("span", "event-type", "GPT 化身"),
      node("h3", "", character.name),
      node("p", "", character.role),
    );
    if (LG.contentMode?.adultSimulation?.()) {
      const gallery = node("button", "mia-gallery-button", "角色画廊");
      gallery.type = "button";
      gallery.dataset.adultGallery = "true";
      gallery.addEventListener("click", () => {
        LG.phoneUI.close();
        LG.galleryUI.open("mia");
      });
      identity.append(gallery);
    }
    hero.append(portrait, identity);

    const list = node("div", "mia-messages");
    list.setAttribute("aria-live", "polite");
    list.append(...messages.map(messageNode));

    const form = node("form", "mia-composer");
    const input = node("input", "mia-input");
    input.type = "text";
    input.maxLength = 160;
    input.placeholder = "询问公开机制、路线或下一步";
    input.setAttribute("aria-label", "发送给弥娅的消息");
    const sendButton = node("button", "mia-send", "发送");
    sendButton.type = "submit";
    form.append(input, sendButton);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value;
      if (!text.trim()) return;
      input.value = "";
      void send(shell, text);
    });
    shell.append(hero, list, form);
    activeRoot = shell;
    content.replaceChildren(shell);
    status.textContent = "弥娅只依据公开信息回答，不会暴露隐藏内容。";
    requestAnimationFrame(() => scrollToLatest(shell));
  }

  function cancel() {
    const pending = messages[messages.length - 1];
    if (busy && pending?.role === "assistant") {
      pending.text = "已取消本次查询。";
    }
    latestRequest += 1;
    busy = false;
    activeRoot = null;
    LG.dialogueAI.cancel();
  }

  LG.phoneAssistantUI = { render, cancel };
})(window.LifeGame);
