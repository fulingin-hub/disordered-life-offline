(function (LG) {
  let fallbackMode = null;
  let textDialog;
  let textTitle;
  let textBody;
  let safetyObserver;
  const rules = LG.CONTENT_SAFETY_RULES;
  const safeVisual = new RegExp(`(?:${rules.safeVisualPatterns.join("|")})`);
  const hardUnsafe = new RegExp(
    `(?:${rules.blockedTextPatterns.join("|")})`);
  const safeReplacements = rules.replacements.map((item) => [
    new RegExp(item.pattern, "g"), item.replacement,
  ]);

  function mode() {
    return LG.authority?.snapshot?.()?.contentMode || fallbackMode;
  }

  function adultSimulation() {
    return mode() === "18"
      && LG.authority?.state?.()?.gameMode === "simulation";
  }

  function strictTeen() {
    return mode() === "15";
  }

  function safeText(value) {
    let text = String(value || "");
    safeReplacements.forEach(([pattern, replacement]) => {
      text = text.replace(pattern, replacement);
    });
    return hardUnsafe.test(text) ? rules.hiddenMessage : text;
  }

  function sanitizeElement(element) {
    if (!(element instanceof Element)) return;
    ["alt", "title", "aria-label", "placeholder"].forEach((name) => {
      const value = element.getAttribute(name);
      const safe = value ? safeText(value) : "";
      if (value && safe !== value) element.setAttribute(name, safe);
    });
    if (element.matches("video")) {
      element.pause?.();
      element.removeAttribute("src");
      element.removeAttribute("poster");
      element.dataset.contentHidden = "true";
    }
    if (element.matches("img") && element.getAttribute("src")
      && !safeVisual.test(element.getAttribute("src"))) {
      element.removeAttribute("src");
      element.dataset.contentHidden = "true";
    }
    const background = element.style?.backgroundImage || "";
    if (background.includes("url(") && !safeVisual.test(background)) {
      element.style.backgroundImage = "none";
    }
  }

  function sanitizeTree(root = document.body) {
    if (!strictTeen() || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      if (!["SCRIPT", "STYLE"].includes(root.parentElement?.tagName)) {
        const safe = safeText(root.textContent);
        if (safe !== root.textContent) root.textContent = safe;
      }
      return;
    }
    sanitizeElement(root);
    root.querySelectorAll?.("*").forEach(sanitizeElement);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) sanitizeTree(walker.currentNode);
  }

  function enableSafetyAudit() {
    sanitizeTree();
    if (safetyObserver) return;
    safetyObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") sanitizeTree(record.target);
        record.addedNodes.forEach((node) => sanitizeTree(node));
        if (record.target instanceof Element) sanitizeElement(record.target);
      });
    });
    safetyObserver.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ["src", "poster", "style", "alt", "title"],
    });
  }

  function buildTextDialog() {
    textDialog = document.createElement("dialog");
    textDialog.className = "content-mode-text-scene";
    textDialog.innerHTML = `
      <span class="event-type">15+ 文字场景</span>
      <h2></h2>
      <p></p>
      <div class="content-mode-confirm-actions">
        <button type="button">继续</button>
      </div>`;
    textTitle = textDialog.querySelector("h2");
    textBody = textDialog.querySelector("p");
    const close = () => textDialog.close();
    textDialog.querySelector("button").addEventListener("click", close);
    textDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    document.body.append(textDialog);
  }

  function showTextScene(title, description) {
    if (!textDialog) buildTextDialog();
    textTitle.textContent = title;
    textBody.textContent = description;
    if (!textDialog.open) textDialog.showModal();
    return true;
  }

  function guardAnimation(title, description) {
    if (adultSimulation()) return false;
    return showTextScene(title, description
      || "当前时间线使用15+表现，该段动态画面已替换为文字叙述，游戏结算与累计效果保持不变。");
  }

  function guardGallery() {
    if (adultSimulation()) return false;
    showTextScene("画廊未开放",
      "画廊只在选择18+内容模式后，于模拟人生时间线开放。世界征途始终使用15+表现。");
    window.dzmm?.toast?.info?.("画廊仅在18+模拟人生开放");
    return true;
  }

  function sync(snapshot) {
    fallbackMode = snapshot?.contentMode || null;
    document.documentElement.dataset.contentMode = fallbackMode || "unselected";
    document.documentElement.dataset.adultSimulation =
      String(adultSimulation());
    if (strictTeen()) enableSafetyAudit();
    if (adultSimulation()) return;
    ["galleryDialog", "playerRoomDialog", "cgDialog", "archiveDialog"]
      .forEach((id) => {
        const dialog = document.getElementById(id);
        if (dialog?.open) dialog.close();
      });
    LG.characterFootImpactPopup?.close?.();
    LG.buttImpactPopup?.close?.();
    LG.contributionRitual?.close?.();
    LG.infernalStompPopup?.close?.();
  }

  LG.contentMode = {
    mode,
    adultSimulation,
    strictTeen,
    safeText,
    safeVisual: (value) => safeVisual.test(String(value || "")),
    isTeen: () => !adultSimulation(),
    allowsGallery: adultSimulation,
    guardAnimation,
    guardGallery,
    showTextScene,
    sync,
  };
})(window.LifeGame);
