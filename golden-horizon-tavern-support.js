(function (LG) {
  function actionId() {
    try {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return `tavern:${[...bytes].map((value) =>
        value.toString(16).padStart(2, "0")).join("")}`;
    } catch (_) {
      return `tavern:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  function renderLetters(host, data, node) {
    const letters = data?.tavern?.letters || [];
    const box = node("details", "golden-tavern-letters");
    const summary = node("summary", "",
      `奥伦老板代收的信 · ${letters.length}封`);
    box.append(summary);
    if (!letters.length) {
      box.append(node("p", "golden-tavern-letter-empty",
        "柜台后的木匣还是空的。只有真正熟识的朋友离开后，信才会被送到这里。"));
    } else {
      letters.slice().reverse().forEach((letter) => {
        const article = node("article", "golden-tavern-letter");
        article.append(node("span", "event-type", "故友来信"),
          node("h4", "", `来自 ${letter.from}`),
          node("p", "", letter.body),
          node("small", "", `奥伦老板于对方${letter.age}岁离世后代为转交`));
        box.append(article);
      });
    }
    host.replaceChildren(box);
  }

  function entryPanel(reportState, open, node, data) {
    const section = node("section", "golden-panel golden-tavern-entry");
    const top = reportState.reports?.week?.professionRanking?.[0];
    const letters = data?.tavern?.letters?.length || 0;
    section.append(node("span", "event-type", "居民AI对话"),
      node("h3", "", "金杯与远路酒馆"),
      node("p", "", top
        ? `酒馆里都在谈论本周活跃的${top.name}。去听听居民怎么说。`
        : "远征者与商旅正在交换今天的消息。"),
      node("p", "", letters
        ? `奥伦老板替你保管着${letters}封故友来信。`
        : "和居民逐渐熟识后，他们会记得把重要的话留给你。"),
      node("p", "golden-tavern-note",
        "AI回复约需数秒；每次发送只请求一次，失败后由你决定是否重试。"));
    const button = node("button", "", "进入酒馆");
    button.type = "button";
    button.addEventListener("click", () => open(reportState.reports));
    section.append(button);
    return section;
  }

  LG.goldenHorizonTavernSupport = { actionId, renderLetters, entryPanel };
})(window.LifeGame);
