(function (LG) {
  const modes = {
    offering: {
      timings: [5000, 10000, 10000],
      phases: ["overview", "upper", "lower"],
      copy: {
        overview: ["供奉", "整体视角 · 主角躺卧于仪式阵列"],
        upper: ["魔纹阶段", "手持中央魔纹 · 定向抽取青蓝灵魂"],
        lower: ["灵魂阶段", "厚重魔气包裹 · 灵魂牵引持续十秒"],
      },
    },
    showcase: {
      timings: [5000, 10000, 5000],
      phases: ["overview", "display", "impact"],
      copy: {
        overview: ["卖弄", "王座全景 · 轻蔑审视"],
        display: ["灵魂吸收", "VR主角立绘 · 灵魂持续流向中央魔纹唇"],
        impact: ["吞噬冲积层", "足底与张合魔纹唇即将覆盖视野"],
      },
    },
  };
  const el = {}; let requesting = false;
  function close() {
    LG.contributionRitualTimeline?.stop?.();
    LG.contributionRitualVoice?.stop?.();
    LG.contributionShowcaseEffects?.reset?.(el.dialog);
    LG.femaleOfferingEffects?.reset?.(el.dialog);
    el.dialog?.classList.remove("playing");
    if (el.dialog?.open) el.dialog.close();
  }
  function phase(name, index, mode) {
    if (!el.dialog?.open) return;
    const copy = LG.femaleOfferingEffects?.phaseCopy?.(el.dialog, name)
      || modes[mode].copy[name];
    el.dialog.dataset.phase = name;
    el.dialog.dataset.phaseIndex = String(index);
    el.phase.textContent = copy[0];
    el.copy.textContent = copy[1];
    const final = index === modes[mode].phases.length - 1;
    const label = final ? "完成仪式" : "下一阶段";
    el.advance.setAttribute("aria-label", label);
    el.advance.title = label;
    el.advance.textContent = final ? "✓" : "»";
    LG.music?.effect?.(name === "overview" ? 180 : name === "display" ? 240 : 150,
      0.18, 0.045);
    LG.contributionShowcaseEffects?.settle?.(el.dialog);
  }
  function impact() {
    if (!el.dialog?.open) return;
    LG.contributionShowcaseEffects.startSole(el.dialog);
    el.phase.textContent = "足底与魔纹吞噬冲击";
    el.copy.textContent = "魔纹唇张合覆盖 · 灵魂完成吸收";
    el.line.textContent = LG.contributionRitualVoice.dismissZh;
    LG.contributionRitualVoice.dismiss(el.dialog);
  }
  function build() {
    el.dialog = document.createElement("dialog");
    el.dialog.className = "contribution-ritual-popup";
    el.dialog.setAttribute("aria-label", "贡献卖弄仪式动画");
    el.dialog.innerHTML = `<div class="contribution-ritual-scene">
      <div class="contribution-ritual-grid" aria-hidden="true"></div>
      <div class="contribution-ritual-seat" aria-hidden="true"></div>
      <div class="contribution-ritual-actor"><img alt=""></div>
      <div class="contribution-ritual-feet" aria-hidden="true">
        <i class="ritual-foot-bare"><b></b></i><i class="ritual-foot-stocking"><b></b></i>
      </div>
      <div class="contribution-ritual-protagonist"><img alt=""></div>
      <div class="contribution-ritual-tools">
        <i class="contribution-kiss contribution-kiss-left"></i>
        <i class="contribution-kiss contribution-kiss-right"></i>
      </div>
      <div class="contribution-ritual-focus" aria-hidden="true"></div>
      <div class="contribution-ritual-shade" aria-hidden="true"></div>
      <div class="contribution-ritual-caption">
        <span></span><strong></strong><p></p><q></q>
        <div class="contribution-ritual-progress"><i></i></div>
      </div>
    </div>
    <button class="contribution-ritual-advance" type="button"
      aria-label="下一阶段" title="下一阶段">»</button>
    <button class="contribution-ritual-close" type="button"
      aria-label="关闭" title="关闭">×</button>`;
    el.protagonist = el.dialog.querySelector(
      ".contribution-ritual-protagonist img");
    el.actor = el.dialog.querySelector(".contribution-ritual-actor img");
    el.name = el.dialog.querySelector(".contribution-ritual-caption span");
    el.phase = el.dialog.querySelector(".contribution-ritual-caption strong");
    el.copy = el.dialog.querySelector(".contribution-ritual-caption p");
    el.line = el.dialog.querySelector(".contribution-ritual-caption q");
    el.advance = el.dialog.querySelector(".contribution-ritual-advance");
    el.line.textContent = LG.contributionRitualVoice.textZh;
    el.advance.addEventListener("click", () =>
      LG.contributionRitualTimeline?.advance?.());
    el.dialog.querySelector(".contribution-ritual-close")
      .addEventListener("click", close);
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(el.dialog);
    window.addEventListener("pagehide", close);
  }
  function play(meta, mode = "showcase", timings) {
    if (!meta) return false;
    if (Array.isArray(mode)) [timings, mode] = [mode, "showcase"];
    mode = mode === "offering" ? "offering" : "showcase";
    if (!el.dialog) build();
    close();
    const femaleOffering = LG.femaleOfferingEffects?.eligible?.(meta, mode);
    const defaults = femaleOffering ? [10000, 10000, 5000] : modes[mode].timings;
    const durations = Array.isArray(timings) && timings.length === 3
      ? timings.map((value, index) =>
        Math.max(index ? 50 : 20, Number(value) || defaults[index]))
      : defaults;
    const total = durations.reduce((sum, value) => sum + value, 0);
    const gender = LG.contributionRitualData.playerGender();
    const outfit = LG.contributionShowcaseEffects.prepare(
      el.dialog, meta, gender, mode);
    el.protagonist.src = outfit.src;
    el.protagonist.alt = `${gender === "female" ? "女" : "男"}主角·${outfit.label}`;
    el.actor.src = meta.src;
    el.actor.alt = meta.name;
    LG.femaleOfferingEffects?.prepare?.(el.dialog, meta, mode, durations);
    el.name.textContent = `${meta.name} · ${
      mode === "offering" ? "供奉" : "卖弄"}`;
    el.dialog.dataset.kind = meta.kind;
    el.dialog.dataset.route = meta.route;
    el.dialog.dataset.ritualMode = mode;
    if (mode === "offering") el.dialog.dataset.outfit = outfit.label;
    if (mode === "offering") delete el.dialog.dataset.protagonistCrop;
    el.dialog.dataset.duration = String(total);
    el.dialog.dataset.impactDuration = String(durations[2]);
    el.dialog.dataset.soleDuration = String(Math.min(3000, durations[2]));
    el.dialog.style.setProperty("--ritual-duration", `${total}ms`);
    LG.contributionShowcase.apply(el.dialog, meta.showcase);
    if (!el.dialog.open) el.dialog.showModal();
    LG.contributionShowcaseEffects?.settle?.(el.dialog);
    el.dialog.classList.remove("playing");
    void el.dialog.offsetWidth;
    el.dialog.classList.add("playing");
    el.line.textContent = LG.contributionRitualVoice.copy(mode).zh;
    LG.contributionRitualVoice.play(el.dialog, mode);
    LG.contributionRitualTimeline.start({
      phases: modes[mode].phases,
      durations,
      onPhase: (name, index) => phase(name, index, mode),
      canAdvance: (context) =>
        LG.femaleOfferingEffects?.canAdvance?.(el.dialog, context) !== false,
      finalLead: mode === "showcase" ? 3000 : 0,
      onFinalLead: mode === "showcase" ? impact : null,
      onFinish: close,
    });
    return true;
  }
  async function request(meta, mode, timings) {
    if (!meta || requesting || el.dialog?.open) return false;
    LG.contributionRitualVoice?.prime?.(mode);
    requesting = true;
    try {
      const result = await LG.authority.mutate("recordContributionRitual", {
        kind: meta.kind,
        targetId: meta.id,
        ritualMode: mode,
      });
      window.dzmm?.toast?.success?.(result.message);
      return play(meta, mode, timings);
    } catch (err) {
      console.error("贡献卖弄累计失败:", err?.code, err?.message, err?.stack);
      window.dzmm?.toast?.error?.(err?.message || "贡献仪式暂时无法开始。");
      return false;
    } finally {
      requesting = false;
    }
  }
  LG.contributionRitual = {
    queenCard(queen) {
      return LG.contributionRitualData.queenCard(
        queen, (item, mode) =>
          request(LG.contributionRitualData.queenMeta(item), mode));
    },
    queenEligible: LG.contributionRitualData.queenEligible,
    leaderEligible: LG.contributionRitualData.leaderEligible,
    showQueen(queen, mode, timings) {
      return request(LG.contributionRitualData.queenMeta(queen), mode, timings);
    },
    showLeader(character, mode, timings) {
      return request(LG.contributionRitualData.leaderMeta(character), mode, timings);
    },
    offerQueen: (queen, timings) => request(
      LG.contributionRitualData.queenMeta(queen), "offering", timings),
    showcaseQueen: (queen, timings) => request(
      LG.contributionRitualData.queenMeta(queen), "showcase", timings),
    offerLeader: (character, timings) => request(
      LG.contributionRitualData.leaderMeta(character), "offering", timings),
    showcaseLeader: (character, timings) => request(
      LG.contributionRitualData.leaderMeta(character), "showcase", timings),
    showRoom: (character, mode, timings) => request(
      LG.contributionRitualData.roomMeta(character), mode, timings),
    close,
  };})(window.LifeGame);
