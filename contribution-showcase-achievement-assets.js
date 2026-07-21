(function (LG) {
  const src =
    "./assets/generated/cg-special-foot-impact-milestones.b1742732.webp";
  const entries = {
    "tribute-showcase-20000": {
      title: "无脑傻逼",
      text: "傻逼东西这远远不够啊喂",
      japaneseNarration:
        "馬鹿なものね。こんなのでは、まだ全然足りないわ。おい。",
    },
    "tribute-showcase-40000": {
      title: "丧志贱畜",
      text: "你这头抖M贱猪给我再快点！",
      japaneseNarration:
        "このどエムの卑しい豚、もっと速くしなさい！",
    },
    "tribute-showcase-60000": {
      title: "仅剩残渣",
      text: "嗯我吃好了，你可以死了",
      japaneseNarration:
        "ん、もう食べ終わったわ。あなたは死んでもいいわ。",
    },
  };

  Object.entries(entries).forEach(([id, meta]) => {
    LG.CG_ASSETS.specialMeta[id] = {
      ...meta,
      label: "供奉卖弄隐藏成就CG",
    };
    LG.CG_ASSETS.special[id] = { male: src, female: src };
  });
})(window.LifeGame);
