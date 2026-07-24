(function (LG) {
  const releases = [
    {
      version: 8,
      date: "2026年7月24日",
      title: "手机应用与场景更新",
      notes: [
        "新增弥娅 AI 助手、电影院馆主入口与18+专属角色画廊。",
        "手机应用中心改用清晰的标准手机图标。",
        "新增线上赌场入口，并更新异域联邦赌场与灰色地带场景。",
        "18+模拟人生新增成人网站，按图片、视频动画和角色分类。",
        "新增点赞与个人偏好统计，记录玩家更喜欢的内容。",
        "15+安全模式不再显示丧志任务。",
      ],
    },
    {
      version: 7,
      date: "2026年7月24日",
      title: "移动体验与联机稳定性",
      notes: [
        "手机应用中心完善，新增媒体、通讯录、相册、新闻与系统更新记录。",
        "黄金都城在线数据稳定性提升，竞技场冠军奖励与界面完成优化。",
        "世界地图、战斗界面和客户端全屏模式加强横竖屏适配。",
        "战斗立绘加载稳定性提升，快速切换与连续操作更加可靠。",
        "15+安全模式体验完善，受限内容会使用适龄界面与文本替代。",
      ],
    },
    {
      version: 6,
      date: "2026年7月23日",
      title: "远征与战斗界面更新",
      notes: [
        "冒险者总部场景和远征入口完成更新。",
        "无尽深渊支持独狼探索与团队远征，并完善百层通关进度。",
        "七层地狱与无尽深渊的主角、战斗伙伴展示和操作布局完成优化。",
      ],
    },
    {
      version: 5,
      date: "2026年7月22日",
      title: "世界地图更新",
      notes: [
        "世界地图地区场景改为按选择展示，未选择地区时保持清爽。",
        "飞艇、天空龙和地区场景按手机竖屏比例重新调整。",
        "地图在桌面端、横屏与竖屏设备上的可读性和点击区域得到改善。",
      ],
    },
  ];

  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };

  function releaseCard(release, currentVersion) {
    const article = node("article", "phone-system-release");
    const heading = node("header", "phone-system-release-heading");
    const version = node("div", "phone-system-version");
    version.append(node("strong", "", `版本 ${release.version}`));
    if (release.version === currentVersion) {
      version.append(node("span", "", "当前版本"));
    }
    heading.append(version, node("time", "", release.date));
    const notes = node("ul", "phone-system-notes");
    notes.append(...release.notes.map((text) => node("li", "", text)));
    article.append(heading, node("h3", "", release.title), notes);
    return article;
  }

  function render(content, status) {
    const currentVersion = Number(LG.CONFIG.version) || releases[0].version;
    const shell = node("section", "phone-system");
    const summary = node("div", "phone-system-summary");
    summary.append(
      node("span", "event-type", "公开版本"),
      node("strong", "", `失序人生 · 版本 ${currentVersion}`),
      node("p", "", "此处仅显示面向玩家的功能与体验更新。"),
    );
    const history = node("div", "phone-system-history");
    history.append(...releases.map((release) =>
      releaseCard(release, currentVersion)));
    shell.append(summary, history);
    status.textContent = `版本 ${currentVersion} · 更新记录 ${releases.length} 条`;
    content.replaceChildren(shell);
  }

  LG.phoneSystemUI = { render };
})(window.LifeGame);
