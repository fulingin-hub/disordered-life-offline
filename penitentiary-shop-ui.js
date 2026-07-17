(function (LG) {
  const el = {};
  let activeStage = 1;
  let busy = false;
  let mode = "list";
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function unlockText(role) {
    if (LG.penitentiary.stageUnlocked(role.stage)) return "阶段已开放";
    const previous = LG.PENITENTIARY_DATA.roles[role.stage - 2];
    return `累计 ${LG.penitentiary.lifetime()}/${role.lifetime} · 前级消费 ${
      LG.penitentiary.spent(previous.id)}/${role.spend}`;
  }
  function characterCard(role) {
    const unlocked = LG.penitentiary.stageUnlocked(role.stage);
    const owned = role.items.filter((item) => LG.penitentiary.owns(item.id)).length;
    const card = node("article",
      `penitentiary-character-card${unlocked ? " unlocked" : ""}`);
    const image = node("img");
    image.src = role.portrait;
    image.alt = role.role;
    image.loading = "lazy";
    image.decoding = "async";
    const body = node("div", "penitentiary-character-body");
    body.append(
      node("span", "event-type", unlocked ? `阶段 ${role.stage} · 已开放`
        : `阶段 ${role.stage} · 未解锁`),
      node("strong", "", role.name),
      node("p", "", role.role),
    );
    const track = node("div", "penitentiary-progress");
    const fill = node("span");
    fill.style.width = `${owned / role.items.length * 100}%`;
    track.append(fill);
    const button = node("button", "", unlocked
      ? `进入个人商店 · ${owned}/${role.items.length}`
      : unlockText(role));
    button.type = "button";
    button.disabled = !unlocked;
    button.addEventListener("click", () => openDetail(role.stage));
    body.append(track, node("small", "", unlockText(role)), button);
    card.append(image, body);
    return card;
  }
  function renderOutfit() {
    const complete = LG.penitentiary.outfitComplete();
    const equipped = LG.penitentiary.outfitEquipped();
    el.outfitStatus.textContent = equipped ? "当前已穿戴"
      : complete ? "五件已集齐，可穿戴" : "集齐五件后开放穿戴";
    el.outfitButton.textContent = equipped ? "脱下套装" : "穿戴套装";
    el.outfitButton.disabled = busy || !complete;
    el.outfitAction.dataset.equipped = String(equipped);
  }
  function renderList() {
    if (mode === "chat") LG.penitentiaryChatUI.leave();
    mode = "list";
    el.list.hidden = false;
    el.detail.hidden = true;
    el.chatView.hidden = true;
    el.list.replaceChildren(...LG.PENITENTIARY_DATA.roles.map(characterCard));
    el.scroll.scrollTop = Math.max(0, el.list.offsetTop - 96);
    LG.penitentiaryUI.status("选择已开放的任务发布者，进入影狱牢房与个人商店。");
  }
  function openDetail(stage) {
    const role = LG.PENITENTIARY_DATA.roles[stage - 1];
    if (!role || !LG.penitentiary.stageUnlocked(stage)) return;
    if (mode === "chat") LG.penitentiaryChatUI.leave();
    activeStage = stage;
    mode = "detail";
    const regularComplete = role.items.slice(0, 4)
      .every((item) => LG.penitentiary.owns(item.id));
    const certificate = LG.penitentiary.owns(role.certificate);
    el.list.hidden = true;
    el.detail.hidden = false;
    el.chatView.hidden = true;
    el.scroll.scrollTop = Math.max(0, el.detail.offsetTop - 96);
    el.portrait.src = role.portrait;
    el.portrait.alt = role.role;
    el.role.textContent = role.role;
    el.name.textContent = role.name;
    el.coupons.textContent = String(LG.penitentiary.coupons());
    el.progress.textContent = `在她处累计消费 ${LG.penitentiary.spent(role.id)} 点`;
    const cards = role.items
      .filter((item) => item.type !== "certificate" || regularComplete)
      .map((item) => LG.penitentiaryItemUI.card(role, item, busy, buy));
    cards.push(...role.consumables.map((item) =>
      LG.penitentiaryItemUI.card(role, item, busy, buy)));
    if (certificate) {
      cards.push(LG.penitentiaryItemUI.card(role, role.outfit, busy, buy));
    }
    el.items.replaceChildren(...cards.filter(Boolean));
    el.gallery.disabled = !certificate;
    el.chat.disabled = !LG.penitentiary.canChat(role.id);
    el.gallery.textContent = certificate ? "人物画廊" : "奖状解锁画廊";
    const pass = LG.penitentiary.chatPass(role.id);
    el.chat.textContent = !certificate ? "奖状解锁AI对话"
      : pass ? `AI对话 · 剩余${pass}轮`
        : `AI对话 · ${LG.penitentiary.chatCost(role.id)}赎罪卷`;
    renderOutfit();
    LG.penitentiaryUI.status(certificate
      ? "五件图鉴已激活；消耗品与新对话周期现按双倍赎罪卷结算。"
      : `基础图鉴道具每件${role.price}赎罪卷；购买奖状后解锁AI对话。`);
  }
  function openChat() {
    const role = LG.PENITENTIARY_DATA.roles[activeStage - 1];
    if (!LG.penitentiary.canChat(role.id)) return;
    mode = "chat";
    el.detail.hidden = true;
    el.chatView.hidden = false;
    el.chatPortrait.src = role.portrait;
    el.chatPortrait.alt = role.role;
    el.chatRole.textContent = role.role;
    el.chatName.textContent = role.name;
    el.scroll.scrollTop = Math.max(0, el.chatView.offsetTop - 96);
    LG.penitentiaryChatUI.render(activeStage);
    LG.penitentiaryUI.status(LG.penitentiary.chatStatus(role.id));
  }
  async function buy(item) {
    if (busy) return;
    busy = true;
    LG.penitentiaryUI.status("正在确认赎罪卷交易...");
    try {
      const result = await LG.authority.mutate("penitentiaryBuy", {
        stage: activeStage, itemId: item.id,
      });
      window.dzmm?.toast?.success?.(result.message);
      LG.penitentiaryUI.refresh(result.message);
    } catch (err) {
      console.error("影狱商店交易失败:", err?.code, err?.message, err?.stack);
      LG.penitentiaryUI.status(err?.message || "交易失败，请稍后重试。");
    } finally {
      busy = false;
      openDetail(activeStage);
    }
  }

  async function equip() {
    if (busy || !LG.penitentiary.outfitComplete()) return;
    busy = true;
    try {
      const result = await LG.authority.mutate("penitentiaryEquip", {
        equipped: !LG.penitentiary.outfitEquipped(),
      });
      LG.protagonistPortrait.render(result.life);
      if (result.life.endingId) {
        LG.audio.ending(Boolean(result.life.currentEnding?.ordinary));
        LG.ui.render(result.life);
      }
      window.dzmm?.toast?.success?.(result.message);
      LG.penitentiaryUI.status(result.message);
    } catch (err) {
      console.error("影狱套装穿戴失败:", err?.code, err?.message, err?.stack);
      LG.penitentiaryUI.status(err?.message || "套装穿戴失败。");
    } finally {
      busy = false;
      openDetail(activeStage);
    }
  }

  LG.penitentiaryShopUI = {
    init() {
      [["scroll", "penitentiaryScroll"], ["list", "penitentiaryCharacterList"],
        ["detail", "penitentiaryShopDetail"],
        ["portrait", "penitentiaryPortrait"], ["role", "penitentiaryRole"],
        ["name", "penitentiaryName"], ["coupons", "penitentiaryShopCoupons"],
        ["progress", "penitentiaryShopProgress"], ["items", "penitentiaryShopItems"],
        ["gallery", "penitentiaryGalleryButton"], ["chat", "penitentiaryChatButton"],
        ["outfitAction", "penitentiaryOutfitAction"],
        ["outfitStatus", "penitentiaryOutfitStatus"],
        ["outfitButton", "penitentiaryOutfitButton"],
        ["chatView", "penitentiaryChatView"],
        ["chatPortrait", "penitentiaryChatPortrait"],
        ["chatRole", "penitentiaryChatRole"], ["chatName", "penitentiaryChatName"]]
        .forEach(([key, id]) => { el[key] = document.getElementById(id); });
      document.getElementById("penitentiaryShopBack").addEventListener("click", renderList);
      document.getElementById("backPenitentiaryShopButton").addEventListener(
        "click", () => openDetail(activeStage));
      el.gallery.addEventListener("click", () =>
        LG.galleryUI.open(LG.PENITENTIARY_DATA.roles[activeStage - 1].id));
      el.chat.addEventListener("click", openChat);
      el.outfitButton.addEventListener("click", equip);
    },
    open: renderList,
    refresh() {
      if (mode === "detail") openDetail(activeStage);
      else if (mode === "list") renderList();
    },
  };
})(window.LifeGame);
