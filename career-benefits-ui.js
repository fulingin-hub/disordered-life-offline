(function (LG) {
  const el = {};
  let activeCharacter = null;
  let busy = false;
  let dishNames = new Map();

  const dishPrefixes = [
    "炭火", "椒盐", "蜜汁", "金汤", "山椒", "香煎", "砂锅", "酱烧",
  ];
  const dishMains = [
    "牛肋排", "鸡腿肉", "羊肩肉", "河鲜", "豆腐", "菌菇", "时蔬", "手擀面",
  ];
  const dishSuffixes = ["拼盘", "煲", "小炒", "盖饭", "汤面", "锅", "卷", "套餐"];

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function data() {
    return LG.career.data();
  }

  function shuffledDishes(items) {
    const names = dishPrefixes.flatMap((prefix) =>
      dishMains.flatMap((main) =>
        dishSuffixes.map((suffix) => `${prefix}${main}${suffix}`)));
    for (let i = names.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    return new Map(items.map((item, index) => [item.id, names[index]]));
  }

  function certificateCopy(career) {
    if (!career.certificateAvailable) {
      return "需要100000属性点并累计获得10000资金。";
    }
    if (career.achievement?.parentalHeart) {
      return "可怜天下父母心：证明免费开放，加入势力不再收费。";
    }
    if (career.achievement?.asParents2) {
      return "如父如母2：证明免费开放，势力加入条件降为5000点。";
    }
    return "黑中介夫妻已开放证明页面。每轮人生只能选择一个势力。";
  }

  function achievementCopy(career) {
    const achievements = career.achievement || {};
    const counts = career.servant || {};
    const parental = career.parental || {};
    const main = `“百世家奴，方知主恩。”：${
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
    if (achievements.parentalHeart) found.push("“可怜天下父母心”已解锁");
    return [main, found.length
      ? `隐藏成就：${found.join("；")}。` : "隐藏成就：尚未发现。"];
  }

  async function eat(item) {
    if (busy) return;
    busy = true;
    el.status.textContent = `正在端上${dishNames.get(item.id)}…`;
    render();
    try {
      const result = await LG.authority.mutate("eatLegendaryMenu", {
        itemId: item.id,
      });
      el.status.textContent = result.message;
      LG.traitsUI.refresh();
      LG.equipmentUI.refresh();
      LG.protagonistPortrait.render(result.life);
    } catch (err) {
      console.error("夫妻餐饮店菜单结算失败:",
        err?.code, err?.message, err?.stack);
      el.status.textContent = err?.message || "菜单结算失败，请稍后重试。";
    } finally {
      busy = false;
      render();
    }
  }

  function renderRestaurant(career) {
    const menu = node("div", "career-menu-grid");
    (career.menuItems || []).forEach((item) => {
      const used = career.menu?.used?.includes(item.id);
      const button = node("button", used ? "used" : "",
        dishNames.get(item.id) || item.name);
      button.type = "button";
      button.disabled = busy || used;
      button.title = item.stats.map((id) =>
        `${LG.CAREER_DATA.stats[id]}+500`).join("、");
      button.addEventListener("click", () => eat(item));
      menu.append(button);
    });
    const copy = achievementCopy(career);
    el.content.replaceChildren(
      node("p", "career-copy", "罗雯每天重写菜单，菜名会随本次进店重新组合。"),
      node("p", "career-copy", copy[0]),
      node("p", "career-copy", copy[1]),
      menu,
    );
  }

  function render() {
    if (!el.content || !activeCharacter) return;
    const career = data();
    if (activeCharacter === "agencyCouple") {
      el.eyebrow.textContent = "中介店 · 阵营手续";
      el.title.textContent = "杜衡与许曼的聘用证明";
      const certificate = node("article", "career-benefit");
      certificate.append(node("strong", "", "阵营聘用证明"),
        node("p", "", certificateCopy(career)));
      el.content.replaceChildren(certificate);
      return;
    }
    el.eyebrow.textContent = "餐饮店 · 今日菜单";
    el.title.textContent = "周启明与罗雯的街头菜单";
    renderRestaurant(career);
  }

  LG.careerBenefitsUI = {
    init() {
      el.dialog = document.getElementById("careerBenefitsDialog");
      el.eyebrow = document.getElementById("careerBenefitsEyebrow");
      el.title = document.getElementById("careerBenefitsTitle");
      el.status = document.getElementById("careerBenefitsStatus");
      el.content = document.getElementById("careerBenefitsContent");
      document.getElementById("closeCareerBenefitsButton")
        .addEventListener("click", () => el.dialog.close());
    },
    open(character) {
      if (!["agencyCouple", "restaurantCouple"].includes(character)) return;
      activeCharacter = character;
      el.status.textContent = "";
      if (character === "restaurantCouple") {
        dishNames = shuffledDishes(data().menuItems || []);
      }
      render();
      el.dialog.showModal();
    },
    refresh() {
      if (el.dialog?.open) render();
    },
  };
})(window.LifeGame);
