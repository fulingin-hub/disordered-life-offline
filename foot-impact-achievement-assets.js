(function (LG) {
  const src =
    "./assets/generated/cg-special-foot-impact-milestones.224c4ed1.webp";
  const items = {
    "foot-impact-10000": {
      title: "傻逼废狗",
      text: "特殊足底动画累计触发一万次。你早已把每一次压近都当成必须服从的命令。",
      japaneseNarration:
        "愚かで役立たずな犬ね。一万回も踏まれて、まだ足りないの？",
    },
    "foot-impact-20000": {
      title: "踩脸中毒",
      text: "特殊足底动画累计触发两万次。裸足与黑丝的轮廓已经成为无法戒断的记忆。",
      japaneseNarration:
        "もう二万回よ。顔を踏まれる感覚に、完全に依存しているのね。",
    },
    "foot-impact-50000": {
      title: "射吧我的脚垫子",
      text: "特殊足底动画累计触发五万次。两只足底占满视野，只剩最后一道日语命令。",
      japaneseNarration:
        "さあ、私の足裏を枕にして、価値のないものを全部吐き出しなさい。",
    },
  };

  Object.entries(items).forEach(([id, meta]) => {
    LG.CG_ASSETS.specialMeta[id] = {
      ...meta,
      label: "角色足底隐藏成就CG",
    };
    LG.CG_ASSETS.special[id] = { male: src, female: src };
  });
})(window.LifeGame);
