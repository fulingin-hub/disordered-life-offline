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
    el.messages.scrollTop = el.messages.scrollHeight;
    return item;
  }
  function roomCard(progress) {
    const scene = LG.dialogueScenes.room(progress.id);
    const card = document.createElement("article");
    card.className = `room-card${progress.unlocked ? " unlocked" : ""}`;
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets[progress.id];
    image.alt = scene.name; image.loading = "lazy"; image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const label = document.createElement("span");
    label.className = "event-type";
    label.textContent = progress.special ? (progress.unlocked ? "贡金系统开放" : "贡金属性未达标") : (progress.unlocked ? "成就已解锁" : "成就进行中");
    const title = document.createElement("h3");
    title.textContent = scene.location;
    const track = document.createElement("div");
    track.className = "room-progress";
    track.hidden = false;
    const fill = document.createElement("span");
    fill.style.width = `${Math.min(100, progress.count / progress.threshold * 100)}%`;
    track.append(fill);
    const status = document.createElement("p");
    status.textContent = progress.special ? (progress.unlocked ? "角色贡金值跨周目累计，无上限" : `贡金属性 ${progress.count}/100`) : `${scene.name}路线 ${progress.count}/${progress.threshold}`;
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = !progress.unlocked;
    button.textContent = progress.special ? (progress.unlocked ? "进入贡金房间" : `贡金属性还需 ${100 - progress.count} 点`) : (progress.unlocked ? "进入房间" : `还需 ${progress.threshold - progress.count} 次`);
    button.addEventListener("click", () => callbacks.onEnter(progress.id));
    body.append(label, title, track, status, LG.roomEntryCopy.node(progress.id), button);
    card.append(image, body);
    return card;
  }
  function playerRoomCard() {
    const progress = LG.playerGalleryUI.summary();
    const card = document.createElement("article");
    card.className = "room-card player-room-card unlocked";
    const image = document.createElement("img");
    image.src = LG.CONFIG.assets.playerRoom;
    image.alt = "主角房间"; image.loading = "lazy"; image.decoding = "async";
    const body = document.createElement("div");
    body.className = "room-card-body";
    const label = document.createElement("span");
    label.className = "event-type";
    label.textContent = "始终开放";
    const title = document.createElement("h3");
    title.textContent = "主角的房间";
    const status = document.createElement("p");
    status.textContent = `男女结局CG ${progress.count}/${progress.total}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "进入房间";
    button.addEventListener("click", callbacks.onEnterPlayer);
    body.append(label, title, status, LG.roomEntryCopy.node("playerRoom"), button);
    card.append(image, body);
    return card;
  }
  function renderLobby() {
    const marketCards = LG.blackMarketUI.roomCards((id) => callbacks.onEnter(id));
    const casinoCard = LG.casinoUI.roomCard(callbacks.onEnterCasino);
    el.cards.replaceChildren(playerRoomCard(), casinoCard, ...marketCards, ...LG.achievements.all().map(roomCard));
    el.lobby.hidden = false;
    el.chat.hidden = true;
    el.title.textContent = "世界区域";
    activeCharacter = null;
  }
  LG.roomsUI = {
    init(nextCallbacks) {
      callbacks = nextCallbacks;
      [
        ["dialog", "roomsDialog"], ["title", "roomsTitle"], ["lobby", "roomsLobby"],
        ["cards", "roomCards"], ["chat", "roomChat"], ["portrait", "roomPortrait"],
        ["location", "roomLocation"], ["character", "roomCharacter"], ["messages", "roomMessages"],
        ["status", "roomStatus"], ["form", "roomForm"], ["input", "roomInput"],
        ["send", "roomSendButton"], ["gallery", "roomGalleryButton"],
        ["items", "roomItemsButton"], ["button", "roomsButton"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      el.button.addEventListener("click", () => this.open());
      document.getElementById("closeRoomsButton").addEventListener("click", () => this.close());
      el.items.addEventListener("click", () => LG.collectiblesUI.openCollection(activeCharacter));
      el.gallery.addEventListener("click", () => {
        if (LG.galleryUI.open(activeCharacter)) return;
        el.status.textContent = LG.collectibles.galleryHint(activeCharacter);
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
      renderLobby();
      el.dialog.showModal();
    },
    close() {
      callbacks.onLeave();
      el.dialog.close();
      activeCharacter = null;
    },
    enter(character) {
      const market = LG.blackMarket.isCharacter(character);
      if (market ? !LG.blackMarket.roomUnlocked(character) : !LG.achievements.isUnlocked(character)) return;
      const scene = LG.dialogueScenes.room(character);
      activeCharacter = character;
      el.lobby.hidden = true;
      el.chat.hidden = false;
      el.title.textContent = scene.title;
      el.portrait.src = LG.CONFIG.assets[character];
      el.portrait.alt = scene.name;
      el.location.textContent = scene.location;
      el.character.textContent = scene.name;
      el.items.hidden = market; el.gallery.hidden = !LG.GALLERY_ASSETS[character]?.items.length;
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
      el.button.textContent = `世界·${unlocked + markets + 1 + Number(LG.casino.accessUnlocked())}`;
    },
  };
})(window.LifeGame);
