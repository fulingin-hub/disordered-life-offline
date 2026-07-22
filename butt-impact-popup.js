(function (LG) {
  const el = {};
  let closeTimer = 0;

  function particles(className, count) {
    return Array.from({ length: count }, (_, index) => {
      const item = document.createElement("i");
      const chunk = className === "butt-impact-chunk";
      const angle = (index / count) * Math.PI * 2
        + (Math.random() - .5) * .55;
      const radius = (chunk ? 48 : 28) + Math.random() * (chunk ? 54 : 38);
      item.className = className;
      item.style.setProperty("--i", index);
      item.style.setProperty("--x", `${Math.round(Math.cos(angle) * radius)}vw`);
      item.style.setProperty("--y",
        `${Math.round(Math.sin(angle) * radius * .78 + (chunk ? 0 : 18))}vh`);
      item.style.setProperty("--r", `${Math.round(Math.random() * 320 - 160)}deg`);
      item.style.setProperty("--d", `${(Math.random() * .36).toFixed(2)}s`);
      item.style.setProperty("--loop-delay",
        `${(index * .08 + Math.random() * .18).toFixed(2)}s`);
      item.style.setProperty("--w",
        `${Math.round((chunk ? 16 : 9) + Math.random() * (chunk ? 34 : 13))}px`);
      item.style.setProperty("--h",
        `${Math.round((chunk ? 11 : 22) + Math.random() * (chunk ? 25 : 34))}px`);
      item.style.setProperty("--s", (.95 + Math.random() * .9).toFixed(2));
      item.style.setProperty("--blur", `${(Math.random() * 1.8).toFixed(1)}px`);
      return item;
    });
  }

  function splashes(count) {
    return Array.from({ length: count }, (_, index) => {
      const item = document.createElement("i");
      const angle = (index / count) * Math.PI * 2
        + (Math.random() - .5) * .45;
      const radius = 18 + Math.random() * 28;
      item.className = "butt-impact-splash";
      item.style.setProperty("--x", `${Math.round(Math.cos(angle) * radius)}vw`);
      item.style.setProperty("--y", `${Math.round(Math.sin(angle) * radius * .72)}vh`);
      item.style.setProperty("--r", `${Math.round(Math.random() * 80 - 40)}deg`);
      item.style.setProperty("--d", `${(Math.random() * .28).toFixed(2)}s`);
      item.style.setProperty("--loop-delay",
        `${(index * .16 + Math.random() * .18).toFixed(2)}s`);
      item.style.setProperty("--w", `${Math.round(72 + Math.random() * 96)}px`);
      item.style.setProperty("--h", `${Math.round(24 + Math.random() * 42)}px`);
      return item;
    });
  }

  function close() {
    window.clearTimeout(closeTimer);
    LG.buttImpactVoice?.stop?.();
    el.dialog?.classList.remove("playing");
    if (el.dialog?.open) el.dialog.close();
  }

  function build() {
    el.dialog = document.createElement("dialog");
    el.dialog.className = "butt-impact-popup";
    el.dialog.setAttribute("aria-label", "臀部冲积层动画");
    el.dialog.innerHTML = `
      <div class="butt-impact-scene">
        <img class="butt-impact-pose" alt="">
        <img class="butt-impact-character" alt="">
        <div class="butt-impact-vignette"></div>
        <div class="butt-impact-body" aria-hidden="true">
          <div class="butt-impact-stockings"><i></i></div>
        </div>
        <div class="butt-impact-mist" aria-hidden="true"></div>
        <div class="butt-impact-chunks" aria-hidden="true"></div>
        <div class="butt-impact-liquid" aria-hidden="true"><b></b></div>
        <div class="butt-impact-splashes" aria-hidden="true"></div>
        <div class="butt-impact-drops" aria-hidden="true"></div>
        <div class="butt-gold-bars" aria-hidden="true"></div>
        <div class="butt-gold-foot" aria-hidden="true"><i></i></div>
        <div class="butt-impact-flash" aria-hidden="true"></div>
        <div class="butt-impact-caption">
          <span></span>
          <strong></strong>
          <p>${LG.buttImpactVoice.textZh}</p>
        </div>
        <button class="butt-impact-close" type="button" aria-label="关闭">×</button>
      </div>`;
    el.character = el.dialog.querySelector(".butt-impact-character");
    el.pose = el.dialog.querySelector(".butt-impact-pose");
    el.stockings = el.dialog.querySelector(".butt-impact-stockings");
    el.detail = el.dialog.querySelector(".butt-impact-caption span");
    el.title = el.dialog.querySelector(".butt-impact-caption strong");
    el.chunks = el.dialog.querySelector(".butt-impact-chunks");
    el.splashes = el.dialog.querySelector(".butt-impact-splashes");
    el.drops = el.dialog.querySelector(".butt-impact-drops");
    el.goldBars = el.dialog.querySelector(".butt-gold-bars");
    el.chunks.replaceChildren(...particles("butt-impact-chunk", 46));
    el.splashes.replaceChildren(...splashes(9));
    el.drops.replaceChildren(...particles("butt-impact-drop", 24));
    el.goldBars.replaceChildren(...particles("butt-gold-bar", 34));
    [...el.goldBars.children].forEach((bar, index) => {
      bar.style.setProperty("--x", `${(index % 7 - 3) * 12 + Math.random() * 6 - 3}vw`);
      bar.style.setProperty("--y", `${(index % 5 - 2) * 13 + Math.random() * 6 - 3}vh`);
    });
    el.dialog.querySelector(".butt-impact-close").addEventListener("click", close);
    el.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(el.dialog);
    window.addEventListener("pagehide", close);
  }

  function show(meta, count = 10, itemKind = "water") {
    if (!meta) return false;
    const itemName = itemKind === "gold" ? "黄金" : "圣水";
    if (LG.contentMode?.guardAnimation?.(`${meta.name} · ${itemName}场景`,
      `${itemName}仪式已经完成。15+模式不播放近距离动画，道具数值效果、使用次数与任务结算保持不变。`)) {
      return true;
    }
    if (!el.dialog) build();
    const pose = LG.buttImpactMeta.pose(meta);
    const dedicatedQueenPose = meta.kind === "queen";
    const dedicatedModel = Boolean(pose.dedicated);
    const model = LG.characterAnimationModels?.apply?.(
      el.dialog, meta, itemKind);
    el.character.hidden = dedicatedQueenPose || dedicatedModel;
    if (el.character.hidden) {
      el.character.removeAttribute("src");
      el.character.alt = "";
    } else {
      el.character.src = meta.src;
      el.character.alt = meta.name;
    }
    el.pose.src = pose.src;
    el.pose.alt = `${meta.name}低机位仪式动作`;
    el.stockings.style.setProperty(
      "--impact-source", `url("${pose.src || meta.src}")`);
    el.detail.textContent = itemKind === "gold"
      ? `${model?.label || "黄金"} · 角色自身模型 · 黄金冲积 · 主动关闭`
      : `${model?.label || "圣水"} · 角色自身模型 · 持续滴水 · 主动关闭`;
    el.title.textContent = `${meta.name} · 臀部冲积层`;
    el.dialog.dataset.kind = meta.kind;
    el.dialog.dataset.character = meta.id;
    el.dialog.dataset.count = String(count);
    el.dialog.dataset.prelude = "10";
    el.dialog.dataset.camera = "low-angle";
    el.dialog.dataset.poseGender = meta.gender;
    el.dialog.dataset.poseVariant = pose.variant;
    el.dialog.dataset.itemKind = itemKind;
    el.dialog.dataset.timeline = itemKind === "gold"
      ? "gold-burial" : "water-drip-loop";
    el.dialog.dataset.autoClose = "manual";
    if (!el.dialog.open) el.dialog.showModal();
    el.dialog.classList.remove("playing");
    void el.dialog.offsetWidth;
    el.dialog.classList.add("playing");
    window.clearTimeout(closeTimer);
    LG.buttImpactVoice?.play?.(el.dialog, 10000);
    closeTimer = 0;
    return true;
  }

  LG.buttImpactPopup = {
    init: build,
    close,
    showCharacter(character, count, itemKind) {
      return show(LG.buttImpactMeta.room(character), count, itemKind);
    },
    showQueen(sin, count, itemKind) {
      return show(LG.buttImpactMeta.queen(sin), count, itemKind);
    },
    showLeader(character, count, itemKind) {
      return show(LG.buttImpactMeta.leader(character), count, itemKind);
    },
    captureFaction(character, itemId) {
      const match = /^faction-consumable-(water|gold)$/.exec(itemId || "");
      if (character?.rankIndex !== 2 || !match) return null;
      LG.buttImpactVoice?.prime?.();
      return {
        character,
        itemKind: match[1],
        before: LG.career.buttImpactUses(character.id),
      };
    },
    completeFaction(token) {
      if (!token) return false;
      const after = LG.career.buttImpactUses(token.character.id);
      return after > token.before && after % 10 === 0
        && this.showLeader(token.character, after, token.itemKind);
    },
  };
})(window.LifeGame);
