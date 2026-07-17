(function (LG) {
  const el = {};
  let busy = false, saveBlocked = false;
  let feed = [];

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function renderFeed() {
    if (!feed.length) {
      el.results.replaceChildren(node("p", "casino-empty", "本场尚无结算记录。"));
      return;
    }
    el.results.replaceChildren(...feed.slice(0, 10).map((text) =>
      node("p", "casino-result", text)));
  }

  function render(message) {
    const session = LG.casinoGame.session();
    const pending = LG.casinoGame.pending();
    el.wins.textContent = String(LG.casino.wins());
    el.losses.textContent = String(LG.casino.losses());
    el.points.textContent = String(LG.traits.points());
    el.bossTarget.textContent = String(LG.casino.bossTarget());
    el.round.textContent = session
      ? session.active ? `${session.round}/10` : "10/10"
      : "未开始";
    el.start.hidden = Boolean(session?.active);
    el.start.disabled = busy || saveBlocked || LG.traits.points() < 10;
    el.start.textContent = session ? "开始下一场十轮赌局" : "开始十轮赌局";
    el.choice.hidden = !session?.active || Boolean(pending);
    el.choice.querySelectorAll("button").forEach((button) => {
      button.disabled = busy || saveBlocked || LG.traits.points() < 10;
    });
    el.temptation.hidden = !pending || pending.type !== "normal";
    if (pending?.type === "normal") {
      const character = LG.CASINO_DATA.byId[pending.character];
      el.temptationPortrait.src = character.portrait;
      el.temptationPortrait.alt = character.role;
      el.temptationRole.textContent = `${character.role} · ${character.name}`;
      el.temptationText.textContent = `“${pending.temptation}” 接受将直接输掉${
        pending.stake}点；拒绝才会公布系统结果。`;
    }
    const bossPending = LG.casino.bossPending(), ownerContact = LG.casino.owns("casinoOwner-private-contact");
    el.boss.hidden = !bossPending;
    el.bossText.textContent = bossPending
      ? ownerContact
        ? "私人联系方式生效：女老板固定在场，可随时进行胜负均为100属性点的对赌。"
        : `累计胜利已达到${LG.casino.bossTarget()}次。女老板亲自下注，胜负均为100属性点。`
      : "";
    el.boss.querySelectorAll("button").forEach((button) => {
      button.disabled = busy || saveBlocked || LG.traits.points() < 100 || Boolean(pending);
    });
    el.status.textContent = message || (session?.active
      ? "选择大或小后，先处理本轮诱惑事件。你可以随时离开赌场。"
      : "普通赌局共十轮，每轮胜负10属性点；至少持有10点才能开始。");
    renderFeed();
  }

  async function saveResult(result) {
    if (!result.ok) return render(result.message);
    busy = true;
    render("正在保存赌局结果…");
    try {
      const saved = await LG.authority.mutate("casinoBet", {
        kind: result.type,
        side: result.side,
        surrendered: result.surrendered,
      });
      const won = saved.message.startsWith("赢得");
      feed.unshift(saved.message);
      LG.audio.ending(won);
      if (navigator.vibrate) navigator.vibrate(won ? [35, 30, 60] : 80);
      LG.traitsUI.refresh(); LG.collectiblesUI.refresh();
      LG.casinoShopUI.refresh();
      if (saved.life.endingId) return LG.ui.render(saved.life);
      render(result.sessionDone ? `十轮赌局结束。${saved.message}` : saved.message);
    } catch (err) {
      console.error("赌场结算保存失败:", err.code, err.message, err.stack);
      saveBlocked = true; render("赌局保存失败，已停止后续下注；请刷新游戏恢复最近存档。");
    } finally {
      busy = false;
      render(el.status.textContent);
    }
  }

  function switchView(view) {
    el.game.hidden = view !== "game";
    el.shop.hidden = view !== "shop";
    el.gameTab.classList.toggle("active", view === "game");
    el.shopTab.classList.toggle("active", view === "shop");
    if (view === "shop") LG.casinoShopUI.open();
    else render();
  }

  function close() {
    LG.casinoChatUI.leave();
    LG.casinoGame.leave();
    feed = [];
    el.dialog.close();
  }

  LG.casinoUI = {
    init(stateProvider) {
      [
        ["dialog", "casinoDialog"], ["tabs", "casinoTabs"], ["game", "casinoGameView"],
        ["shop", "casinoShopView"], ["gameTab", "casinoGameTab"], ["shopTab", "casinoShopTab"],
        ["wins", "casinoWins"], ["losses", "casinoLosses"], ["points", "casinoPoints"],
        ["bossTarget", "casinoBossTarget"], ["round", "casinoRound"],
        ["status", "casinoGameStatus"], ["start", "casinoStartButton"],
        ["choice", "casinoChoicePanel"], ["temptation", "casinoTemptation"],
        ["temptationPortrait", "casinoTemptationPortrait"],
        ["temptationRole", "casinoTemptationRole"], ["temptationText", "casinoTemptationText"],
        ["boss", "casinoBossPanel"], ["bossText", "casinoBossText"],
        ["results", "casinoResults"],
      ].forEach(([key, id]) => { el[key] = document.getElementById(id); });
      LG.casinoShopUI.init();
      LG.casinoChatUI.init(stateProvider);
      LG.casinoAccess.init(stateProvider);
      el.gameTab.addEventListener("click", () => switchView("game"));
      el.shopTab.addEventListener("click", () => switchView("shop"));
      document.getElementById("closeCasinoButton").addEventListener("click", close);
      el.dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
      });
      el.start.addEventListener("click", async () => {
        if (busy) return;
        busy = true;
        render("正在创建服务端赌局…");
        try {
          await LG.authority.mutate("casinoStart");
          const result = LG.casinoGame.start();
          if (result.ok) feed = [];
          render(result.ok ? "赌局开始。第一轮请选择大或小。" : result.message);
        } catch (err) {
          console.error("赌场开局失败:", err?.code, err?.message, err?.stack);
          render(err?.message || "赌局创建失败，请稍后重试。");
        } finally {
          busy = false;
          render(el.status.textContent);
        }
      });
      document.getElementById("casinoBigButton")
        .addEventListener("click", () => renderChoice("big"));
      document.getElementById("casinoSmallButton")
        .addEventListener("click", () => renderChoice("small"));
      document.getElementById("casinoAcceptButton")
        .addEventListener("click", () => saveResult(LG.casinoGame.resolveTemptation(true)));
      document.getElementById("casinoRefuseButton")
        .addEventListener("click", () => saveResult(LG.casinoGame.resolveTemptation(false)));
      document.getElementById("casinoBossBig")
        .addEventListener("click", () => saveResult(LG.casinoGame.chooseBoss("big")));
      document.getElementById("casinoBossSmall")
        .addEventListener("click", () => saveResult(LG.casinoGame.chooseBoss("small")));
    },
    roomCard(onEnter) {
      const access = LG.casinoAccess.status();
      const card = node("article", `room-card casino-room-card${access.allowed ? " unlocked" : ""}`);
      const image = node("img");
      image.src = LG.CONFIG.assets.background; image.alt = "异域赌场";
      const body = node("div", "room-card-body");
      body.append(
        node("span", "event-type", access.allowed ? "功能场所 · 可进入" : "功能场所 · 尚不可进入"),
        node("h3", "", "异域赌场"),
        node("p", "", access.detail),
        LG.roomEntryCopy.node("casino"),
      );
      const track = node("div", "room-progress"), fill = node("span");
      fill.style.width = `${access.progress}%`;
      track.append(fill);
      const button = node("button", "", access.button);
      button.type = "button"; button.disabled = !access.allowed;
      button.addEventListener("click", onEnter);
      body.append(track, button);
      card.append(image, body);
      return card;
    },
    open() {
      if (!LG.casinoAccess.status().allowed) return;
      switchView("game");
      render();
      el.dialog.showModal();
    },
    close,
    refresh() {
      if (el.dialog?.open && !el.game.hidden) render();
    },
  };

  function renderChoice(side) {
    const result = LG.casinoGame.choose(side);
    render(result.ok ? `你选择了${LG.casinoGame.sideLabel(side)}，诱惑事件出现。` : result.message);
  }
})(window.LifeGame);
