(function (LG) {
  let session = null;
  let pending = null;

  const randomSide = () => Math.random() < 0.5 ? "big" : "small";
  const sideLabel = (side) => side === "big" ? "大" : "小";
  const validSide = (side) => side === "big" || side === "small";

  function temptationFor(round) {
    if (round <= 3) return "casinoBunny";
    if (round <= 7) return "casinoLead";
    return "casinoManager";
  }

  function prepare(type, side) {
    const stake = type === "boss" ? 100 : 10;
    if (pending) return { ok: false, message: "上一轮尚未结算。" };
    if (!validSide(side)) return { ok: false, message: "请选择大或小。" };
    if (LG.traits.points() < stake) {
      return { ok: false, message: `属性点不足，需要${stake}点才能下注。` };
    }
    if (type === "normal" && (!session || session.round > 10)) {
      return { ok: false, message: "请先开始一场十轮赌局。" };
    }
    if (type === "boss" && !LG.casino.bossPending()) {
      return { ok: false, message: "女老板挑战尚未触发。" };
    }
    pending = {
      type,
      side,
      stake,
      round: type === "normal" ? session.round : null,
      character: type === "normal" ? temptationFor(session.round) : "casinoOwner",
      temptation: type === "normal"
        ? LG.casinoTemptations.pick(temptationFor(session.round)) : "",
    };
    return { ok: true, pending: { ...pending } };
  }

  function settle(won, resultSide, surrendered) {
    const wager = pending;
    if (wager.type === "normal") {
      session.results.push({
        round: wager.round,
        won,
        side: wager.side,
        resultSide,
        surrendered,
      });
      session.round += 1;
    }
    pending = null;
    return {
      ok: true,
      won,
      stake: wager.stake,
      type: wager.type,
      side: wager.side,
      round: wager.round,
      selected: sideLabel(wager.side),
      result: sideLabel(resultSide),
      surrendered,
      sessionDone: wager.type === "normal" && session.round > 10,
    };
  }

  LG.casinoGame = {
    start() {
      if (LG.traits.points() < 10) {
        return { ok: false, message: "至少需要10点属性点才能参加赌博。" };
      }
      session = { round: 1, results: [] };
      pending = null;
      return { ok: true, session: this.session() };
    },
    leave() {
      session = null;
      pending = null;
    },
    session() {
      return session ? {
        round: session.round,
        results: [...session.results],
        active: session.round <= 10,
      } : null;
    },
    pending() {
      return pending ? { ...pending } : null;
    },
    choose(side) {
      return prepare("normal", side);
    },
    chooseBoss(side) {
      const prepared = prepare("boss", side);
      if (!prepared.ok) return prepared;
      const resultSide = randomSide();
      return settle(resultSide === side, resultSide, false);
    },
    resolveTemptation(accept) {
      if (!pending || pending.type !== "normal") {
        return { ok: false, message: "当前没有等待处理的诱惑事件。" };
      }
      if (accept) {
        return settle(false, pending.side === "big" ? "small" : "big", true);
      }
      const guaranteed = LG.casino.insiderRound(pending.round);
      const resultSide = guaranteed ? pending.side : randomSide();
      return settle(resultSide === pending.side, resultSide, false);
    },
    sideLabel,
  };
})(window.LifeGame);
