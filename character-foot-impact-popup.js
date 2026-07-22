(function (LG) {
  const lineZh = "丧志贱狗，快射出你那毫无价值的稀薄精液", lineJa =
    "意気地なしの卑しい犬め。価値のない薄い精液を、早く吐き出しなさい。";
  let dialog, portraits, feet, title, timer, speech, speechId = 0;
  function count(roomId) {
    return Math.max(0, Math.floor(Number(
      LG.authority.snapshot()?.economy?.blackMarket?.roomUsage?.[roomId]?.footImpact,
    ) || 0));
  }
  function resolve(options) {
    const { source, roomId, itemId } = options || {};
    if (source === "character" && ["streetThug", "beggar"].includes(roomId)
      && itemId === `${roomId}-5`) return { kind: "tribute", roomId };
    if (source === "eden" && itemId === "gold") return { kind: "eden", roomId };
    if (source === "penitentiary"
      && itemId === `${roomId}-smelly-insoles`) return { kind: "shadow", roomId };
    const other = LG.OTHERWORLD_CHARACTER_DATA?.byId?.[roomId];
    if (source === "otherworld" && other
      && itemId === `${roomId}-${other.special[0]}`) {
      return { kind: other.host === "expo" ? "expo" : "guild", roomId };
    }
    return null;
  }
  function completeCollection(target) {
    if (target.kind === "tribute") return LG.collectibles.progress(target.roomId).complete;
    if (target.kind === "eden") return LG.edenCharacters.unlocked(target.roomId);
    if (target.kind === "shadow") {
      const role = LG.PENITENTIARY_DATA.byId[target.roomId];
      return role?.items.filter((item) => item.type === "regular")
        .every((item) => LG.penitentiary.owns(item.id));
    }
    return LG.otherworldCharacters.progress(target.roomId).complete;
  }
  function members(target) {
    if (target.kind === "gallery") return target.members || [];
    if (target.kind === "shadow") return LG.PENITENTIARY_DATA.roles;
    if (target.kind === "tribute") return ["streetThug", "beggar"].map((id) => ({
      id, name: LG.COLLECTIBLE_CHARACTERS[id].name, portrait: LG.CONFIG.assets[id],
    }));
    if (target.kind === "eden") return LG.EDEN_CHARACTER_DATA.characters;
    return LG.OTHERWORLD_CHARACTER_DATA.characters.filter((item) =>
      target.kind === "expo" ? item.host === "expo" : item.host === "infernal");
  }
  function groupFor(target, forcedSize) {
    const all = members(target);
    const current = all.find((item) => item.id === target.roomId);
    const others = all.filter((item) => item.id !== target.roomId);
    for (let index = others.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [others[index], others[swap]] = [others[swap], others[index]];
    }
    const size = target.kind === "shadow"
      ? Math.max(1, Math.min(5, forcedSize || 1 + Math.floor(Math.random() * 5)))
      : target.kind === "expo" ? 1 : 2;
    return [current, ...others].filter(Boolean).slice(0, size);
  }
  function stopSpeech() {
    speechId += 1;
    window.clearTimeout(timer);
    window.speechSynthesis?.cancel?.();
    speech = null;
  }
  function close() {
    stopSpeech();
    dialog?.classList.remove("playing");
    if (dialog?.open) dialog.close();
  }
  function japaneseVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const japanese = voices.filter((voice) => /^ja(?:-|_)/i.test(voice.lang)
      || /japanese|日本|nanami/i.test(voice.name));
    return japanese.find((voice) =>
      /female|woman|nanami|kyoko|haruka|ayumi|女/i.test(voice.name))
      || japanese[0] || null;
  }
  function primeSpeech() {
    if (!LG.audio?.isEnabled?.() || !window.speechSynthesis) return;
    window.speechSynthesis.resume?.();
    window.speechSynthesis.getVoices?.();
  }
  function narrate() {
    stopSpeech();
    const id = speechId;
    if (!LG.audio?.isEnabled?.() || !window.speechSynthesis
      || !window.SpeechSynthesisUtterance) {
      if (dialog) dialog.dataset.voiceState = "unavailable";
      timer = window.setTimeout(close, 8500);
      return;
    }
    LG.narration?.stop?.();
    dialog.dataset.voiceState = "queued";
    window.speechSynthesis.resume?.();
    timer = window.setTimeout(() => {
      if (id !== speechId || !dialog?.open) return;
      speech = new SpeechSynthesisUtterance(lineJa);
      speech.lang = "ja-JP";
      speech.rate = 0.82;
      speech.pitch = 0.92;
      speech.volume = 1;
      const voice = japaneseVoice();
      if (voice) speech.voice = voice;
      speech.onstart = () => { dialog.dataset.voiceState = "playing"; };
      speech.onend = () => {
        if (id !== speechId) return;
        dialog.dataset.voiceState = "ended";
        timer = window.setTimeout(close, 700);
      };
      speech.onerror = (event) => {
        if (id !== speechId) return;
        dialog.dataset.voiceState = "error";
        console.warn("角色足底动画日语女声播放失败:",
          event?.error || "unknown");
        timer = window.setTimeout(close, 6500);
      };
      window.speechSynthesis.speak(speech);
      window.speechSynthesis.resume?.();
    }, 80);
    timer = window.setTimeout(close, 14000);
  }
  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "character-foot-impact-popup";
    dialog.innerHTML = `<div class="character-foot-impact-scene">
      <div class="character-foot-impact-portraits"></div>
      <div class="character-foot-impact-feet"></div>
      <div class="character-foot-impact-flash"></div>
      <div class="character-foot-impact-caption"><strong></strong><p>${lineZh}</p></div>
      <button type="button" aria-label="关闭">×</button></div>`;
    portraits = dialog.querySelector(".character-foot-impact-portraits");
    feet = dialog.querySelector(".character-foot-impact-feet");
    title = dialog.querySelector("strong");
    dialog.querySelector("button").addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(dialog);
    window.addEventListener("pagehide", close);
  }
  function show(target, forcedSize, forcedVariants) {
    const group = groupFor(target, forcedSize);
    const names = group.map((item) => item.name).join("、");
    if (LG.contentMode?.guardAnimation?.(`${names} · 足底场景`,
      "角色们从高处逼近，脚步与命令声压过视野。15+模式以文字略过动态画面，使用次数与成就累计照常结算。")) {
      return group;
    }
    if (!dialog) build();
    portraits.replaceChildren(...group.map((character, index) => {
      const image = document.createElement("img");
      image.src = character.portrait;
      image.alt = character.name;
      image.style.setProperty("--index", index);
      return image;
    }));
    feet.replaceChildren(...group.map((character, index) => {
      const foot = document.createElement("i");
      const variant = LG.footVariants.normalize(
        forcedVariants?.[index] || LG.footVariants.pick());
      LG.footVariants.apply(foot, variant, character.portrait);
      foot.style.setProperty("--index", index);
      return foot;
    }));
    title.textContent = names;
    dialog.dataset.kind = target.kind;
    dialog.dataset.groupSize = String(group.length);
    dialog.dataset.group = group.map((item) => item.id).join(",");
    if (!dialog.open) dialog.showModal();
    dialog.classList.remove("playing");
    void dialog.offsetWidth;
    dialog.classList.add("playing");
    narrate();
    return group;
  }
  LG.characterFootImpactPopup = {
    capture(options) {
      const target = resolve(options);
      if (target && !LG.contentMode?.isTeen?.()) primeSpeech();
      return target ? { target, before: count(target.roomId) } : null;
    },
    complete(token) {
      if (!token) return false;
      const after = count(token.target.roomId);
      return after > token.before && after % 10 === 0
        && Boolean(show(token.target));
    },
    state(options) {
      const target = resolve(options);
      return target && {
        special: true, free: completeCollection(target),
        count: count(target.roomId),
      };
    },
    resolve,
    show,
    close,
  };})(window.LifeGame);
