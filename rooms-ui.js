(function (LG) {
  const el = {};
  let callbacks = {};
  let activeCharacter = null, pendingMessage = null;
  let pendingInput = "";
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
  function renderLobby() {
    LG.roomLobbyUI.restore();
    el.lobby.hidden = false;
    el.chat.hidden = true;
    activeCharacter = null;
  }
  LG.roomsUI = {
    init(nextCallbacks) {
      callbacks = nextCallbacks;
      [
        ["dialog", "roomsDialog"], ["title", "roomsTitle"], ["intro", "roomsIntro"],
        ["lobby", "roomsLobby"],
        ["cards", "roomCards"], ["chat", "roomChat"], ["portrait", "roomPortrait"],
        ["location", "roomLocation"], ["character", "roomCharacter"], ["messages", "roomMessages"],
        ["status", "roomStatus"], ["form", "roomForm"], ["input", "roomInput"],
        ["send", "roomSendButton"], ["gallery", "roomGalleryButton"],
        ["items", "roomItemsButton"], ["careerSpecial", "roomCareerSpecialButton"],
        ["button", "roomsButton"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      LG.roomLobbyUI.init({
        cards: el.cards,
        title: el.title,
        intro: el.intro,
      }, callbacks);
      el.button.addEventListener("click", () => this.open());
      document.getElementById("closeRoomsButton").addEventListener("click", () => this.close());
      el.items.addEventListener("click", () => LG.collectiblesUI.openCollection(activeCharacter));
      el.gallery.addEventListener("click", () => {
        if (LG.galleryUI.open(activeCharacter)) return;
        el.status.textContent = LG.collectibles.galleryHint(activeCharacter);
      });
      el.careerSpecial.addEventListener("click", () => {
        const target = document.querySelector('[data-career-view="benefits"]');
        this.close();
        document.getElementById("careerButton").click();
        target.click();
      });
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        this.close();
      });
      document.getElementById("backRoomsButton").addEventListener("click", () => {
        callbacks.onLeave(); renderLobby();
      });
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = el.input.value.trim();
        if (!text || el.send.disabled || !activeCharacter) return;
        if (LG.dialogueAI.isBusy()) {
          this.busyNotice();
          return;
        }
        el.input.value = "";
        callbacks.onSend(activeCharacter, text);
      });
      this.refresh();
    },
    open() {
      this.refresh();
      LG.roomLobbyUI.renderWorld();
      el.lobby.hidden = false;
      el.chat.hidden = true;
      activeCharacter = null;
      el.dialog.showModal();
    },
    openParadise(section) {
      this.refresh();
      LG.roomLobbyUI.renderParadise(section);
      el.lobby.hidden = false;
      el.chat.hidden = true;
      activeCharacter = null;
      if (!el.dialog.open) el.dialog.showModal();
    },
    close() {
      callbacks.onLeave();
      el.dialog.close();
      activeCharacter = null;
      LG.audio.scene("story");
    },
    enter(character) {
      const market = LG.blackMarket.isCharacter(character);
      if (market ? !LG.blackMarket.roomUnlocked(character) : !LG.achievements.isUnlocked(character)) return;
      const scene = LG.dialogueScenes.room(character);
      LG.audio.scene(`room:${character}`);
      activeCharacter = character;
      el.lobby.hidden = true;
      el.chat.hidden = false;
      el.title.textContent = scene.title;
      el.portrait.src = LG.CONFIG.assets[character];
      el.portrait.alt = scene.name;
      el.location.textContent = scene.location;
      el.character.textContent = scene.name;
      el.items.hidden = market; el.gallery.hidden = !LG.GALLERY_ASSETS[character]?.items.length;
      el.careerSpecial.hidden = !["agencyCouple", "restaurantCouple"].includes(character);
      el.careerSpecial.textContent = character === "agencyCouple"
        ? "六大势力聘用证明" : "街头传奇的菜单";
      if (market) el.gallery.textContent = LG.collectibles.galleryUnlocked(character) ? "CG画廊" : "CG画廊·未解锁";
      if (!market) {
        const collection = LG.collectibles.progress(character);
        el.items.textContent = `道具图鉴·${collection.count}/${collection.total}`;
        el.gallery.textContent = LG.collectibles.galleryUnlocked(character) ? "CG画廊" : "CG画廊·未解锁";
      }
      el.messages.replaceChildren();
      const history = market
        ? LG.blackMarket.conversation(character) : LG.achievements.conversation(character);
      history.forEach((item) => message(item.role, item.content));
      if (!history.length) message("assistant", scene.opener);
      this.release();
      LG.blackMarketUI.leave();
      LG.tributeUI.enter(character);
      if (market) LG.blackMarketUI.enter(character);
      if (!el.form.hidden && window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
    },
    begin(text) {
      pendingInput = text; message("user", text);
      pendingMessage = message("assistant", "正在思考…", "loading");
      el.status.textContent = "正在验证贡金周期并生成回复，成功回复才计入本轮次数。";
      el.input.disabled = true; el.send.disabled = true; el.send.textContent = "回应中…";
    },
    update(content) {
      if (pendingMessage) pendingMessage.textContent = content || "正在思考…";
      el.messages.scrollTop = el.messages.scrollHeight;
    },
    complete(content) {
      if (pendingMessage) {
        pendingMessage.textContent = content;
        pendingMessage.classList.remove("loading");
      }
      pendingMessage = null; pendingInput = "";
      this.release();
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.input.focus();
    },
    fail(text) {
      if (pendingMessage) {
        pendingMessage.textContent = text;
        pendingMessage.className = "chat-message assistant error";
      }
      pendingMessage = null;
      el.input.value = pendingInput;
      el.status.textContent = "发送失败，本轮次数不会消耗；首次贡金失败会自动退款。";
      el.input.disabled = false; el.send.disabled = !LG.dialogueAI.canUseRoom(activeCharacter); el.send.textContent = LG.dialogueAI.roomActionLabel();
    },
    release() {
      pendingMessage = null; pendingInput = "";
      el.status.textContent = LG.dialogueAI.roomStatus(activeCharacter);
      el.input.disabled = false;
      el.send.disabled = !LG.dialogueAI.canUseRoom(activeCharacter); el.send.textContent = LG.dialogueAI.roomActionLabel();
    },
    busyNotice() {
      el.status.textContent = "上一条回复仍在生成，完成前不会重复请求。";
    },
    refresh() {
      if (!el.button) return;
      const unlocked = LG.achievements.all().filter((item) => item.unlocked).length, markets = LG.blackMarket.characters().filter((item) => LG.blackMarket.roomUnlocked(item.id)).length;
      el.button.textContent = `世界·${unlocked + markets + 1
        + Number(LG.casino.accessUnlocked()) + Number(LG.blackPrison.access().allowed)
        + Number(LG.penitentiary.access().allowed)
        + Number(LG.vehicleStore.access().allowed)
        + Number(LG.infernalRealm.access().allowed)
        + Number(LG.infernalClub.access().allowed)}`;
    },
  };
})(window.LifeGame);
