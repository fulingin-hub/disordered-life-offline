(function (LG) {
  const el = {};
  let activeQueen = null, mode = "list", busy = false;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  const status = (text) => { el.status.textContent = text || ""; };
  function renderStats() {
    const access = LG.infernalClub.access();
    const equipped = LG.infernalClub.equippedSet();
    el.defeat.textContent = String(access.defeat);
    el.personality.textContent = String(LG.infernalClub.personality());
    el.spent.textContent = String(LG.infernalClub.spent());
    el.equipped.textContent = equipped
      ? `${LG.INFERNAL_CLUB_DATA.byId[equipped].name}套装` : "未穿戴";
  }
  function queenCard(queen) {
    const owned = queen.equipment.filter((item) => LG.infernalClub.owns(item.id)).length;
    const card = node("article", "club-room-card");
    const image = node("img", "infernal-club-scene");
    image.src = LG.CONFIG.assets[queen.portrait];
    image.alt = queen.title;
    image.loading = "lazy";
    const copy = node("div", "club-room-copy");
    const button = node("button", "", `进入${queen.room}`);
    button.type = "button";
    button.addEventListener("click", () => openDetail(queen.id));
    copy.append(node("span", "event-type", queen.room), node("strong", "", queen.title),
      node("p", "", `套装 ${owned}/5 · 消费 ${LG.infernalClub.spent(queen.id)}人格`),
      button);
    card.append(image, copy);
    return card;
  }
  function renderList() {
    mode = "list";
    activeQueen = null;
    LG.infernalClubChatUI.leave();
    el.list.hidden = false;
    el.detail.hidden = true;
    el.chat.hidden = true;
    el.rooms.replaceChildren(...LG.INFERNAL_CLUB_DATA.queens.map(queenCard));
    status("选择女魔王包间。所有消费使用人格值，并由权威存档结算。");
  }
  function renderDetail() {
    if (!activeQueen) return renderList();
    mode = "detail";
    el.list.hidden = true;
    el.detail.hidden = false;
    el.chat.hidden = true;
    el.portrait.src = LG.CONFIG.assets[activeQueen.portrait];
    el.portrait.alt = activeQueen.title;
    el.roomName.textContent = activeQueen.room;
    el.queenName.textContent = activeQueen.title;
    const owned = activeQueen.equipment
      .filter((item) => LG.infernalClub.owns(item.id)).length;
    el.progress.textContent = `套装 ${owned}/5 · 包间消费 ${
      LG.infernalClub.spent(activeQueen.id)}人格 · ${activeQueen.lore}`;
    const full = LG.infernalClub.fullSet(activeQueen.id);
    const equipped = LG.infernalClub.equippedSet() === activeQueen.id;
    el.chatButton.disabled = busy
      || !LG.infernalClub.canChat(activeQueen.character);
    const pass = LG.infernalClub.chatPass(activeQueen.character);
    el.chatButton.textContent = pass ? `AI 对话 · 剩余${pass}轮`
      : `AI 对话 · ${LG.INFERNAL_CLUB_DATA.chatCost}人格`;
    el.galleryButton.dataset.character = activeQueen.character;
    el.equipButton.disabled = busy || !full;
    el.equipButton.textContent = equipped ? "脱下五件套" : "穿戴五件套";
    const items = [
      ...LG.INFERNAL_CLUB_DATA.consumables,
      ...activeQueen.equipment,
      ...activeQueen.specials,
    ];
    el.items.replaceChildren(...items.map((item) =>
      LG.infernalClubItemUI.card(activeQueen, item, busy, buy, use)));
    status(`${full ? "五件套已集齐，特殊收藏与使徒形态已经开放。"
      : "购买同一位女魔王的五件套后，可解锁特殊收藏与使徒形态。"} ${
      activeQueen.effect}`);
  }
  function openDetail(id) {
    activeQueen = LG.INFERNAL_CLUB_DATA.byId[id] || null; renderDetail();
  }
  function openChat() {
    if (!activeQueen || !LG.infernalClub.canChat(activeQueen.character)) return;
    mode = "chat";
    el.detail.hidden = true;
    el.chat.hidden = false;
    el.chatPortrait.src = LG.CONFIG.assets[activeQueen.portrait];
    el.chatPortrait.alt = activeQueen.title;
    el.chatRoom.textContent = activeQueen.room;
    el.chatQueen.textContent = activeQueen.title;
    LG.infernalClubChatUI.enter(activeQueen);
    status("AI 回复成功后才消耗本轮次数；失败会自动退款。");
  }
  async function mutate(method, body, fallback) {
    if (busy) return;
    busy = true;
    renderDetail();
    try {
      const result = await LG.authority.mutate(method, body);
      window.dzmm?.toast?.success?.(result.message);
      status(result.message);
      LG.protagonistPortrait.render(result.life);
      LG.equipmentUI?.refresh?.();
      LG.roomsUI.refresh();
      if (result.life.endingId) {
        LG.infernalClubUI.close();
        LG.ui.render(result.life);
        LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
      }
    } catch (err) {
      console.error(fallback, err?.code, err?.message, err?.stack);
      status(err?.message || "结算失败，请稍后重试。");
    } finally {
      busy = false;
      renderStats();
      renderDetail();
    }
  }
  function buy(queen, item) {
    mutate("infernalClubBuy", { sin: queen.id, itemId: item.id },
      "地狱俱乐部购买失败:");
  }
  function use(item) {
    mutate("infernalClubUse", { itemId: item.id }, "地狱俱乐部道具使用失败:");
  }
  function equip() {
    const equipped = LG.infernalClub.equippedSet() === activeQueen.id;
    mutate("infernalClubEquip", { sin: equipped ? "" : activeQueen.id },
      "地狱俱乐部套装穿戴失败:");
  }
  function roomCard() {
    const access = LG.infernalClub.access();
    const card = node("article",
      `room-card area-room-card infernal-area-card${access.allowed ? " unlocked" : ""}`);
    const image = node("img", "infernal-club-scene");
    image.src = LG.CONFIG.assets.infernalClubEntrance;
    image.alt = "地狱边境路牌与粉色灯光的远处俱乐部";
    image.loading = "lazy";
    const body = node("div", "room-card-body");
    const button = node("button", "", access.allowed ? "进入地狱俱乐部" : "败北值尚未达到1000");
    button.type = "button";
    button.disabled = !access.allowed;
    button.addEventListener("click", () => LG.infernalClubUI.open());
    body.append(node("span", "event-type", "在地狱和世界的交界处的神秘俱乐部"),
    node("h3", "", "神秘的地狱俱乐部"),
    node("p", "", access.allowed ? `累计消费 ${LG.infernalClub.spent()}人格`
      : `败北值 ${access.defeat}/${access.required}`), button);
    card.append(image, body);
    return card;
  }
  LG.infernalClubUI = {
    init() {
      [["dialog", "infernalClubDialog"], ["scroll", "infernalClubScroll"],
        ["list", "infernalClubRoomList"], ["rooms", "infernalClubRooms"],
        ["detail", "infernalClubDetail"], ["chat", "infernalClubChat"],
        ["defeat", "infernalClubDefeat"], ["personality", "infernalClubPersonality"],
        ["spent", "infernalClubSpent"], ["equipped", "infernalClubEquipped"],
        ["status", "infernalClubStatus"], ["portrait", "infernalClubPortrait"],
        ["roomName", "infernalClubRoomName"], ["queenName", "infernalClubQueenName"],
        ["progress", "infernalClubProgress"], ["items", "infernalClubItems"],
        ["chatButton", "infernalClubChatButton"], ["galleryButton", "infernalClubGalleryButton"],
        ["equipButton", "infernalClubEquipButton"],
        ["chatPortrait", "infernalClubChatPortrait"], ["chatRoom", "infernalClubChatRoom"],
        ["chatQueen", "infernalClubChatQueen"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      document.getElementById("infernalClubBack").addEventListener("click", renderList);
      document.getElementById("infernalClubChatBack").addEventListener("click", renderDetail);
      el.chatButton.addEventListener("click", openChat);
      el.galleryButton.addEventListener("click", () =>
        LG.galleryUI.open(el.galleryButton.dataset.character));
      el.equipButton.addEventListener("click", equip);
      document.getElementById("closeInfernalClubButton").addEventListener("click", () => this.close());
      el.dialog.addEventListener("cancel", (event) => { event.preventDefault(); this.close(); });
      LG.authority.subscribe(() => {
        if (el.dialog.open) {
          renderStats();
          if (mode === "list") renderList();
        }
      });
    },
    open() {
      if (!LG.infernalClub.access().allowed) return;
      LG.audio.scene("infernal"); renderStats(); renderList(); el.dialog.showModal();
    },
    close() { LG.infernalClubChatUI.leave(); el.dialog.close(); LG.audio.scene("world"); },
    roomCard,
  };
})(window.LifeGame);
