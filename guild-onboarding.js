(function (LG) {
  const data = LG.GUILD_ONBOARDING_DATA;
  const seen = new Set();
  let dialog, cast, location, title, copy, tips, choices;
  let speakerName, speakerRole, progress, offered = false, initialized = false;
  let activeScene = "hub", returnVersion = 0;
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function hub() {
    const complete = data.topics.every((topic) => seen.has(topic.id));
    return {
      location: "异界魔境 · 冒险者公会",
      speaker: complete ? "guildManager" : "guildReceptionist",
      cast: ["guildReceptionist", "guildManager"],
      title: complete ? "你已经重新认清这座城" : "你想先问哪件事？",
      copy: complete
        ? "真正的反攻要靠悬赏、整备、伙伴和战利品循环。公会永远会记录你带回来的结果，忘了规矩就回来问。"
        : "你不需要背一份说明书。想知道什么，就去见真正靠这条规矩生活的人；他们会告诉你这个世界为什么这样运转。",
      tips: [`已了解 ${seen.size}/${data.topics.length} 项`,
        "远征循环：接悬赏 → 做准备 → 进入深渊 → 带回战利品 → 推进战线。"],
      choices: data.topics.map((topic) => ({
        label: `${seen.has(topic.id) ? "已了解 · " : ""}${topic.title}`,
        next: topic.scene,
      })),
    };
  }
  function close() {
    returnVersion += 1;
    if (dialog?.open) dialog.close();
    LG.audio?.scene?.("story");
  }
  function resumeAfterDialogs(sceneId, version) {
    if (version !== returnVersion) return;
    const target = [...document.querySelectorAll("dialog[open]")]
      .find((item) => item !== dialog);
    if (!target) {
      open(sceneId);
      return;
    }
    target.addEventListener("close", () => window.setTimeout(
      () => resumeAfterDialogs(sceneId, version), 0), { once: true });
  }
  function openTraits(page) {
    LG.traitsUI?.open?.();
    LG.equipmentUI?.show?.(page);
  }
  function openCareer(view) {
    document.getElementById("careerButton")?.click();
    document.querySelector(`[data-career-view="${view}"]`)?.click();
  }
  function openVehicleCgs() {
    openCareer("companions");
    requestAnimationFrame(() =>
      document.querySelector(".vehicle-achievement-gallery")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function openTarget(action) {
    const sceneId = activeScene;
    const version = ++returnVersion;
    if (dialog?.open) dialog.close();
    window.setTimeout(() => {
      if (["supply", "equipment", "corrupted", "inventory"].includes(action)) {
        LG.adventureGuildUI?.open?.(action);
      } else if (action === "guildRewards") {
        LG.adventureGuildUI?.open?.("rewards");
      } else if (action === "abyss") {
        LG.abyssUI?.open?.();
      } else if (action === "world") LG.roomsUI?.open?.();
      else if (action === "infernal") LG.infernalUI?.open?.();
      else if (action === "golden") LG.goldenHorizonUI?.open?.();
      else if (action === "traits") LG.traitsUI?.open?.();
      else if (action === "career") openCareer("stats");
      else if (action === "vehicleProfile") openCareer("companions");
      else if (action === "soulProfile") openTraits("soul");
      else if (action === "infernalTitles") openTraits("infernalTitle");
      else if (action === "equipmentProfile") openTraits("equipment");
      else if (action === "careerFactions") openCareer("factions");
      else if (action === "careerLoadout") openCareer("loadout");
      else if (action === "vehicleCgs") openVehicleCgs();
      else if (action === "achievements") {
        document.getElementById("recoveryButton")?.click();
        document.getElementById("lifeAchievementsButton")?.click();
      }
      else if (action === "holyLight") LG.holyLightUI?.open?.();
      else if (action === "spellbook") {
        LG.infernalChurchUI?.renderChurch?.();
        document.getElementById("infernalChurchDialog")?.showModal();
      }
      requestAnimationFrame(() => resumeAfterDialogs(sceneId, version));
    }, 0);
  }
  function renderCast(scene) {
    cast.replaceChildren(...scene.cast.map((id) => {
      const guide = data.guides[id];
      const image = node("img", `guild-onboarding-character${
        id === scene.speaker ? " active" : ""}`);
      image.loading = "eager";
      image.src = guide.scene;
      image.alt = `${guide.name}，${guide.role}`;
      return image;
    }));
  }
  function render(id) {
    activeScene = id === "hub" || data.scenes[id] ? id : "hub";
    const scene = activeScene === "hub" ? hub() : data.scenes[activeScene];
    if (scene.topic) seen.add(scene.topic);
    const speaker = data.guides[scene.speaker];
    location.textContent = scene.location;
    title.textContent = scene.title;
    copy.textContent = typeof scene.copy === "function"
      ? scene.copy(LG.authority.snapshot()) : scene.copy;
    speakerName.textContent = speaker.name;
    speakerRole.textContent = speaker.role;
    progress.textContent = `${seen.size}/${data.topics.length} 项已了解`;
    renderCast(scene);
    tips.replaceChildren(...scene.tips.map((text) => node("p", "", text)));
    const sceneChoices = typeof scene.choices === "function"
      ? scene.choices(LG.authority.snapshot()) : scene.choices;
    choices.replaceChildren(...sceneChoices.map((choice) => {
      const button = node("button", choice.quiet ? "quiet-button" : "", choice.label);
      button.type = "button";
      button.addEventListener("click", () => {
        LG.audio?.choose?.();
        if (choice.action) openTarget(choice.action);
        else render(choice.next);
      });
      return button;
    }));
  }
  function build() {
    dialog = node("dialog", "guild-onboarding-dialog");
    const scene = node("div", "guild-onboarding-scene");
    const header = node("header", "guild-onboarding-heading");
    const heading = node("div");
    location = node("span", "event-type");
    heading.append(location, node("strong", "", "反攻深渊 · 远征者的一天"));
    progress = node("span", "guild-onboarding-progress");
    const leave = node("button", "quiet-button", "先离开");
    leave.type = "button"; leave.addEventListener("click", close);
    header.append(heading, progress, leave);
    cast = node("div", "guild-onboarding-cast");
    const panel = node("section", "guild-onboarding-panel");
    const speaker = node("div", "guild-onboarding-speaker");
    speakerName = node("strong"); speakerRole = node("span");
    speaker.append(speakerName, speakerRole);
    title = node("h2"); copy = node("p", "guild-onboarding-copy");
    tips = node("div", "guild-onboarding-tips");
    choices = node("div", "guild-onboarding-choices");
    panel.append(speaker, title, copy, tips, choices);
    scene.append(header, cast, panel); dialog.append(scene);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    document.body.append(dialog);
  }
  function init() {
    if (initialized) return;
    initialized = true;
    Object.values(data.guides).forEach((guide) => {
      const image = new Image();
      image.src = guide.scene;
    });
    build();
    const button = node("button", "quiet-button guild-onboarding-entry", "问问公会管理员");
    button.id = "guildOnboardingButton"; button.type = "button";
    button.addEventListener("click", () => open("hub"));
    document.querySelector(".top-actions")?.prepend(button);
  }
  function open(id = "hub") {
    init(); render(id); LG.audio?.scene?.("world");
    if (!dialog.open) dialog.showModal();
  }
  function offer(state) {
    if (offered || !state?.gender) return;
    offered = true; open("intro");
  }
  LG.guildOnboarding = { init, offer, open };
})(window.LifeGame);
