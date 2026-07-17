(function (LG) {
  LG.EDEN_DIALOGUE = {
    characters: {
      edenChef: {
        name: "塞拉菲娜",
        fallback: [
          "菜单和代价都写得很清楚。你可以品尝，也可以在付款前离开。",
          "激活全部十三项餐饮图鉴只证明你有资格进入办公室，不证明你学会了克制。",
          "我负责料理与秩序，你负责承认每一次消费都是自己按下的。",
        ],
      },
      edenFashion: {
        name: "奥蕾莉亚",
        fallback: [
          "衣服会改变别人看你的方式，但不会替你承担选择。",
          "图鉴已经开放。别把收藏完整误认为你真的拥有了品味。",
          "试衣镜只会照出结果，不会替你解释为什么还想继续购买。",
        ],
      },
    },
    rooms: {
      edenChef: {
        character: "edenChef",
        location: "伊甸园餐饮店办公室",
        title: "最后一道菜之后",
        opener: "塞拉菲娜合上金边菜单：“十三项餐饮图鉴已经完整。现在谈话不计入账单。”",
      },
      edenFashion: {
        character: "edenFashion",
        location: "伊甸园高定店办公室",
        title: "试衣镜之外",
        opener: "奥蕾莉亚锁上陈列柜：“图鉴已经完整。现在说说你真正想换掉的是什么。”",
      },
    },
  };
})(window.LifeGame);
