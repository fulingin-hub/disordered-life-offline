(function (LG) {
  const el = {};
  let busy = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function data() {
    return LG.authority.snapshot()?.economy?.infernalTitles
      || { active: null, items: [] };
  }

  async function equip(item) {
    if (busy || !item.unlocked) return;
    busy = true;
    el.status.textContent = item.equipped
      ? "正在卸下异界联盟礼仪称号…" : `正在登记“${item.title}”…`;
    render();
    try {
      const result = await LG.authority.mutate("equipInfernalTitle", {
        titleId: item.equipped ? null : item.id,
      });
      el.status.textContent = result.message;
      LG.audio?.choose?.();
    } catch (err) {
      console.error("异界联盟称号装备失败:",
        err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "异界联盟称号装备失败，请稍后重试。";
    } finally {
      busy = false;
      render();
    }
  }

  function titleCard(item) {
    const card = node("article",
      `infernal-title-card${item.unlocked ? " unlocked" : " locked"}${
        item.equipped ? " equipped" : ""}`);
    const heading = node("div", "infernal-title-heading");
    heading.append(node("strong", "", item.title),
      node("span", "", item.equipped ? "异界联盟礼仪生效" : item.source));
    const action = node("button", "",
      item.equipped ? "卸下称号" : item.unlocked ? "装备称号" : "尚未获得");
    action.type = "button";
    action.disabled = busy || !item.unlocked;
    action.addEventListener("click", () => equip(item));
    card.append(heading, node("p", "", item.description), action);
    return card;
  }

  function render() {
    if (!el.list) return;
    const titles = data();
    el.active.textContent = titles.active?.title || "未装备";
    const items = Array.isArray(titles.items) ? titles.items : [];
    el.list.replaceChildren(...items.map(titleCard));
    el.empty.hidden = items.length > 0;
  }

  LG.infernalTitleUI = {
    init() {
      el.page = document.getElementById("infernalTitlePage");
      el.active = document.getElementById("activeInfernalTitle");
      el.status = document.getElementById("infernalTitleStatus");
      el.list = document.getElementById("infernalTitleList");
      el.empty = document.getElementById("infernalTitleEmpty");
      LG.authority.subscribe(() => {
        if (!el.page?.hidden) render();
      });
      render();
    },
    render,
  };
})(window.LifeGame);
