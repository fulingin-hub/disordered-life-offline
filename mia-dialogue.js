(function (LG) {
  LG.MIA_DIALOGUE = {
    characters: {
      mia: {
        name: "弥娅",
        fallback: [
          "我在。你可以问当前公开机制、路线选择、存档状态，或让我整理下一步行动。",
          "我只能依据已经公开和你当前可见的信息判断，不会把隐藏条件伪装成确定答案。",
          "先告诉我你卡在哪个页面或目标，我会把可执行的下一步压缩成一份短清单。",
        ],
      },
    },
    scenes: {
      "phone-mia": {
        kind: "assistant",
        character: "mia",
        location: "万界档案馆 · 人生电影院",
        opener: "欢迎回来。我是弥娅，负责整理你的档案，也管理人生电影院。想查机制、路线，还是下一步建议？",
      },
    },
  };
})(window.LifeGame);
