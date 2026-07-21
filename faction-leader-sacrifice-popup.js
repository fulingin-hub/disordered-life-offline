(function (LG) {
  const subtitle = "哦，败者……献上你微弱的灵魂，让我们的力量更加强大吧。";
  const japanese = "ああ、敗者よ。そのかすかな魂を捧げ、我らの力をさらに高めるがいい。";
  const el = {};
  let closeTimer = 0;
  let speechId = 0;
  let utterance = null;

  function count(key) {
    return Math.max(0, Number(LG.career.data().specialUses?.[key]) || 0);
  }

  function pairFor(character) {
    return LG.CAREER_DATA.roster.filter((item) =>
      item.faction === character.faction
      && item.rankIndex === 2
      && item.gender !== character.gender
      && (!character.branch || item.branch === character.branch)
      && (!character.department || item.department === character.department));
  }

  function stopSpeech() {
    speechId += 1;
    window.clearTimeout(closeTimer);
    window.speechSynthesis?.cancel?.();
    utterance = null;
  }

  function close() {
    stopSpeech();
    el.dialog?.classList.remove("playing");
    if (el.dialog?.open) el.dialog.close();
  }

  function finish(id) {
    if (id !== speechId) return;
    el.dialog.classList.remove("speaking");
    closeTimer = window.setTimeout(close, 650);
  }

  function japaneseVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const candidates = voices.filter((voice) =>
      /^ja(?:-|_)/i.test(voice.lang) || /japanese|日本|nanami/i.test(voice.name));
    return candidates.find((voice) =>
      /female|woman|nanami|kyoko|haruka|ayumi|sayaka|女/i.test(voice.name))
      || candidates[0] || null;
  }

  function narrate() {
    const id = ++speechId;
    window.clearTimeout(closeTimer);
    el.dialog.classList.add("speaking");
    if (!LG.audio?.isEnabled?.() || !window.speechSynthesis
      || !window.SpeechSynthesisUtterance) {
      closeTimer = window.setTimeout(() => finish(id), 8000);
      return;
    }
    LG.narration?.stop?.();
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(japanese);
    utterance.lang = "ja-JP";
    utterance.rate = 0.82;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    const voice = japaneseVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => finish(id);
    utterance.onerror = (event) => {
      console.warn("势力首领日语旁白播放失败:", event?.error || "unknown");
      closeTimer = window.setTimeout(() => finish(id), 7600);
    };
    window.speechSynthesis.speak(utterance);
    closeTimer = window.setTimeout(() => finish(id), 14000);
  }

  function renderLeader(image, name, leader) {
    image.src = LG.careerPortraits.characterSource(leader);
    image.alt = LG.CAREER_DATA.characterLabel(leader);
    name.textContent = leader.name;
  }

  function show(character, forcedVariants) {
    const counterpart = pairFor(character)[0];
    if (!counterpart || !el.dialog) return false;
    const order = Math.random() < 0.5
      ? [character, counterpart] : [counterpart, character];
    const modes = [0, 1].map((index) =>
      LG.footVariants.normalize(forcedVariants?.[index]
        || LG.footVariants.pick()));
    LG.footVariants.apply(el.soleA, modes[0]);
    LG.footVariants.apply(el.soleB, modes[1]);
    el.dialog.dataset.soleA = modes[0];
    el.dialog.dataset.soleB = modes[1];
    renderLeader(el.leaderA, el.nameA, order[0]);
    renderLeader(el.leaderB, el.nameB, order[1]);
    const faction = LG.CAREER_DATA.factions[character.faction];
    el.title.textContent = `${character.branchLabel || faction.name} · 首领灵魂献祭`;
    el.subtitle.textContent = subtitle;
    el.dialog.dataset.theme = character.branch
      ? `university-${character.branch}` : character.faction;
    if (!el.dialog.open) el.dialog.showModal();
    el.dialog.classList.remove("playing");
    void el.dialog.offsetWidth;
    el.dialog.classList.add("playing");
    narrate();
    return true;
  }

  function build() {
    el.dialog = document.createElement("dialog");
    el.dialog.className = "faction-sacrifice-popup";
    el.dialog.setAttribute("aria-label", "势力首领灵魂献祭");
    el.dialog.innerHTML = `
      <div class="faction-sacrifice-scene">
        <div class="faction-sacrifice-aura"></div>
        <img class="faction-sacrifice-leader leader-a" alt="">
        <img class="faction-sacrifice-leader leader-b" alt="">
        <div class="faction-sacrifice-sole sole-a" aria-hidden="true"><i></i></div>
        <div class="faction-sacrifice-sole sole-b" aria-hidden="true"><i></i></div>
        <div class="faction-sacrifice-impact" aria-hidden="true"></div>
        <div class="faction-sacrifice-caption">
          <span class="faction-sacrifice-kicker">丧志败北 · 献祭灵魂</span>
          <strong></strong>
          <div class="faction-sacrifice-names"><span></span><b>×</b><span></span></div>
          <p></p>
        </div>
        <button class="faction-sacrifice-close" type="button" aria-label="关闭">×</button>
      </div>`;
    el.leaderA = el.dialog.querySelector(".leader-a");
    el.leaderB = el.dialog.querySelector(".leader-b");
    el.soleA = el.dialog.querySelector(".sole-a");
    el.soleB = el.dialog.querySelector(".sole-b");
    [el.nameA, el.nameB] = el.dialog.querySelectorAll(".faction-sacrifice-names span");
    el.title = el.dialog.querySelector(".faction-sacrifice-caption strong");
    el.subtitle = el.dialog.querySelector(".faction-sacrifice-caption p");
    el.dialog.querySelector(".faction-sacrifice-close").addEventListener("click", close);
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(el.dialog);
    window.addEventListener("pagehide", close);
  }

  LG.factionLeaderSacrifice = {
    init: build,
    capture(character, view) {
      if (view !== "private" || character?.rankIndex !== 2) return null;
      const key = character.specialKey || character.faction;
      return { character, key, before: count(key) };
    },
    complete(token, action) {
      if (action?.type === "factionLeaderSacrifice") {
        const character = LG.CAREER_DATA.roster.find(
          (item) => item.id === action.characterId);
        return Boolean(character && show(character));
      }
      if (!token) return false;
      const after = count(token.key);
      return after > token.before && after % 6 === 0 && show(token.character);
    },
    show,
    close,
  };
})(window.LifeGame);
