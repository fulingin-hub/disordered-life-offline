(function (LG) {
  LG.FALLEN_SAINT_DIALOGUE = {
    characters: {
      fallenSaint: {
        name: "堕落圣徒",
        fallback: [
          "七种欲望在同一具身躯里注视着你。你可以继续，也可以现在离开。",
          "别把收藏当作忠诚。七大欲只承认由你亲口说出的选择。",
          "圣徒已经不在了。现在回答你的，是七大欲共同拥有的化身。",
        ],
      },
    },
    rooms: {
      fallenSaint: {
        character: "fallenSaint",
        location: "地狱教会 · 七大欲化身的隐藏房间",
        title: "七欲共鸣",
        opener: "堕落圣徒合上黑色祷书，七种魔纹同时亮起：“圣徒已经消失。现在，是七大欲共同回答你。”",
      },
    },
  };
})(window.LifeGame);
