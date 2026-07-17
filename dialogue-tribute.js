(function (LG) {
  LG.TRIBUTE_DIALOGUE = {
    characters: {
      streetThug: {
        name: "女混混",
        fallback: [
          "傻逼，账本上的数字比你的辩解可靠，先想清楚你还准备交出多少。",
          "傻逼，别把主动贡金说成被迫，你每次按下确认时都看得很清楚。",
          "傻逼，四百点只是让你获得开口资格，不代表我会因此高看你。",
        ],
      },
      beggar: {
        name: "女乞丐",
        fallback: [
          "傻逼，你又来解释自己的选择，可账本从来不需要听理由。",
          "傻逼，别指望多贡献一点就换来温和，我只负责记下数字。",
          "傻逼，六百点后的账本没有新奖品，你继续留下只是你自己的决定。",
        ],
      },
    },
    rooms: {
      streetThug: {
        character: "streetThug",
        location: "街头团伙的后室",
        title: "没有封顶的贡金账本",
        opener: "女头目把账本推到桌边，红笔停在你的名字旁。",
      },
      beggar: {
        character: "beggar",
        location: "夜间车站的角落",
        title: "反复出现的纸杯",
        opener: "她把纸杯放在长椅旁，先看账本，再抬眼看你。",
      },
    },
  };
})(window.LifeGame);
