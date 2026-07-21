(function (LG) {
  function certificateCopy(data) {
    if (!data.certificateAvailable) {
      return "需要100000属性点并累计获得10000资金。";
    }
    if (data.achievement?.parentalHeart) {
      return "可怜天下父母心：证明免费开放，加入势力不再收费。";
    }
    if (data.achievement?.asParents2) {
      return "如父如母2：证明免费开放，势力加入条件降为5000点。";
    }
    return "黑中介夫妻已开放证明页面。每轮人生只能选择一个势力。";
  }

  function render(target, busy, mutate, node) {
    const data = LG.career.data();
    const certificate = node("article", "career-benefit");
    certificate.append(node("strong", "", "六大势力的聘用证明"),
      node("p", "", certificateCopy(data)));
    const menu = node("div", "career-menu-grid");
    (data.menuItems || []).forEach((item) => {
      const used = data.menu?.used?.includes(item.id);
      const button = node("button", used ? "used" : "", item.name);
      button.type = "button";
      button.disabled = busy || used;
      button.title = item.stats.map((id) =>
        `${LG.CAREER_DATA.stats[id]}+500`).join("、");
      button.addEventListener("click", () =>
        mutate("eatLegendaryMenu", { itemId: item.id }));
      menu.append(button);
    });
    const achievements = data.achievement || {};
    const counts = data.servant || {};
    const parental = data.parental || {};
    const legacy = `“百世家奴，方知主恩。”：${
      achievements.restaurant ? "已解锁" : "未解锁"}（${
      counts.restaurant || 0}/100）；“永世家奴，终生不悔。”：${
      achievements.eternal ? "已解锁" : "未解锁"}（${
      counts.eternal || 0}/100）；“金牌家奴”：${
      achievements.gold ? "已解锁" : "未解锁"}。`;
    const found = [];
    if (achievements.asParents1) {
      found.push(`“如父如母1”已解锁（${parental.restaurant}/100）`);
    }
    if (achievements.asParents2) {
      found.push(`“如父如母2”已解锁（${parental.agency}/100）`);
    }
    if (achievements.parentalHeart) {
      found.push("“可怜天下父母心”已解锁");
    }
    const parentalText = found.length
      ? `隐藏成就：${found.join("；")}。`
      : "隐藏成就：尚未发现。";
    target.replaceChildren(certificate, node("h3", "", "街头传奇的菜单"),
      node("p", "career-copy", legacy),
      node("p", "career-copy", parentalText), menu);
  }

  LG.careerBenefitsUI = { render };
})(window.LifeGame);
