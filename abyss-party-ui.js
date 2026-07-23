(function (LG) {
  const el = {};
  let selected = 1;

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
    el.assignments.hidden = Boolean(run);
    if (run) return;
    [...el.assignments.querySelectorAll("button")].forEach((button) => {
      const start = Number(button.dataset.segmentStart);
      button.disabled = busy;
      button.setAttribute("aria-pressed", String(start === selected));
    });
  }

  LG.abyssPartyUI = {
    init() {
      el.copy = document.getElementById("abyssCaptainCopy");
      el.team = document.getElementById("abyssPartyTeam");
      el.assignments = document.getElementById("abyssAssignments");
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
      el.copy.textContent = run
        ? `赫克托仍是队长。你只负责第${run.segmentStart}—${
          run.segmentEnd}层，不能接管队长权限。`
        : "赫克托把五枚区段牌压在桌上。你可以选择承担哪二十层，但第五席队员没有队长权限。";
      renderTeam(run);
      renderAssignments(run, busy);
    },
    selectedSegment() {
      return selected;
    },
    encounterSupport(encounter) {
      return encounter?.support?.name
        ? ` ${encounter.support.name}正在支援：${encounter.support.text}。`
        : "";
    },
  };
})(window.LifeGame);
