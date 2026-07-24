(function (LG) {
  const el = {};
  let selected = 1, selectedMode = "solo";

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function assignment(member, index, selectedStart) {
    if (member.segmentStart) return member;
    const open = LG.ABYSS_DATA.segments.filter((start) => start !== selectedStart);
    const start = member.id === "player" ? selectedStart : open[index];
    return { ...member, segmentStart: start, segmentEnd: start + 19 };
  }

  function renderTeam(run) {
    const source = run?.team?.length === 5
      ? run.team : LG.ABYSS_DATA.expeditionTeam;
    let npcIndex = 0;
    const team = source.map((member) => {
      const resolved = assignment(member,
        member.id === "player" ? 0 : npcIndex++, selected);
      const card = node("article", `abyss-party-member${
        resolved.captain || resolved.id === "tavernExplorer" ? " captain" : ""}`);
      const heading = node("div", "abyss-party-member-heading");
      heading.append(node("strong", "", resolved.name),
        node("span", "", resolved.role));
      card.append(heading,
        node("p", "", `负责 ${resolved.segmentStart}—${resolved.segmentEnd}层`),
        node("small", "", resolved.duty));
      return card;
    });
    el.team.replaceChildren(...team);
  }

  function renderAssignments(run, busy) {
    el.assignments.hidden = Boolean(run) || selectedMode !== "party";
    if (run || selectedMode !== "party") return;
    [...el.assignments.querySelectorAll("button")].forEach((button) => {
      const start = Number(button.dataset.segmentStart);
      button.disabled = busy;
      button.setAttribute("aria-pressed", String(start === selected));
    });
  }

  function renderMode(run, busy) {
    if (run?.mode) selectedMode = run.mode;
    const party = selectedMode === "party";
    el.choices.hidden = Boolean(run);
    [...el.choices.querySelectorAll("button")].forEach((button) => {
      button.disabled = busy;
      button.setAttribute("aria-pressed",
        String(button.dataset.abyssMode === selectedMode));
    });
    el.eyebrow.textContent = party
      ? "团队远征 · 五人队长制" : "独狼探索 · 真无尽模式";
    el.title.textContent = party ? "赫克托远征队" : "孤身深入无尽深渊";
    el.seat.textContent = party
      ? "玩家席位：第五席队员" : "无最终层 · 每25层保存检查点";
    el.team.hidden = !party;
    el.copy.textContent = party
      ? (run
        ? `赫克托仍是队长。你只负责第${run.segmentStart}—${
          run.segmentEnd}层，不能接管队长权限。`
        : "赫克托把五枚区段牌压在桌上。你可以选择承担哪二十层，但第五席队员没有队长权限。")
      : (run
        ? `你正在独自探索第${Math.max(1, Number(run.floor) + 1)
          }层。这里没有最终层，继续突破即可刷新个人最高层。`
        : `从第1层独自出发，没有队长、队友或支援。${LG.infernalRealm.abyssCheckpoint()
          ? `可从第${LG.infernalRealm.abyssCheckpoint()}层检查点继续。`
          : "每25层会写入一个可恢复检查点。"}`);
    el.start.textContent = run
      ? (party ? "归队继续负责区段" : "继续独狼探索")
      : (party ? "接受赫克托的区段分配"
        : LG.infernalRealm.abyssCheckpoint()
          ? `从第${LG.infernalRealm.abyssCheckpoint()}层检查点继续`
          : "开始独狼探索");
    el.start.dataset.action = run ? "resume" : "start";
  }

  LG.abyssPartyUI = {
    init() {
      el.choices = document.getElementById("abyssModeChoices");
      el.eyebrow = document.getElementById("abyssModeEyebrow");
      el.title = document.getElementById("abyssModeTitle");
      el.seat = document.getElementById("abyssModeSeat");
      el.copy = document.getElementById("abyssCaptainCopy");
      el.team = document.getElementById("abyssPartyTeam");
      el.assignments = document.getElementById("abyssAssignments");
      el.start = document.getElementById("abyssStartButton");
      [...el.choices.querySelectorAll("button")].forEach((button) => {
        button.addEventListener("click", () => {
          selectedMode = button.dataset.abyssMode === "party" ? "party" : "solo";
          this.render(null, false);
        });
      });
      LG.ABYSS_DATA.segments.forEach((start) => {
        const button = node("button", "", `接受 ${start}—${start + 19}层`);
        button.type = "button";
        button.dataset.segmentStart = String(start);
        button.setAttribute("aria-pressed", String(start === selected));
        button.addEventListener("click", () => {
          selected = start;
          this.render(null, false);
        });
        el.assignments.append(button);
      });
    },
    render(run, busy) {
      if (!el.team) return;
      if (run?.segmentStart) selected = run.segmentStart;
      renderMode(run, busy);
      if (selectedMode === "party") renderTeam(run);
      renderAssignments(run, busy);
    },
    startPayload() {
      return selectedMode === "party"
        ? { mode: "party", segmentStart: selected }
        : { mode: "solo", resume: LG.infernalRealm.abyssCheckpoint() > 0 };
    },
    floorLabel(run, floor) {
      return run?.mode === "solo"
        ? `独狼探索 · 第${floor}层 · 真无尽`
        : `负责${run.segmentStart}—${run.segmentEnd}层 · 第${floor}层`;
    },
    encounterSupport(encounter) {
      return encounter?.support?.name
        ? ` ${encounter.support.name}正在支援：${encounter.support.text}。`
        : "";
    },
  };
})(window.LifeGame);
