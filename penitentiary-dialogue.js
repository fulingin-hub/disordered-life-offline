(function (LG) {
  LG.PENITENTIARY_DIALOGUE = {
    characters: {
      penitentiarySupervisor: { name: "顾寒霜", fallback: ["任务表不会同情犹豫。你可以离开，也可以把这一项做完。"] },
      penitentiaryManager: { name: "北条绫", fallback: ["赎罪卷只记录完成，不记录借口。下一项由你自己决定是否领取。"] },
      penitentiaryInstructor: { name: "维拉·科瓦奇", fallback: ["纪律不是沉默服从。听清命令，也保留说不的能力。"] },
      penitentiaryWarden: { name: "塞西莉亚·格兰特", fallback: ["你已经走到高墙深处，但出口仍然存在。别假装规则替你选择。"] },
      penitentiaryOwner: { name: "伊莎贝拉·诺克斯", fallback: ["奖状证明你完成了交易，不证明我拥有你。现在说出真正的问题。"] },
    },
    rooms: {
      penitentiarySupervisor: { character: "penitentiarySupervisor", location: "影狱监督室", title: "任务清单之外", opener: "顾寒霜合上清洁记录：“奖状拿到了。现在说话不计入任务。”" },
      penitentiaryManager: { character: "penitentiaryManager", location: "影狱管理室", title: "秩序账本之外", opener: "北条绫收起值勤表：“没有桌椅任务时，你还想证明什么？”" },
      penitentiaryInstructor: { character: "penitentiaryInstructor", location: "影狱训练室", title: "口令停止之后", opener: "维拉放下哨子：“这一刻没有口令，你可以自己组织答案。”" },
      penitentiaryWarden: { character: "penitentiaryWarden", location: "影狱监狱长办公室", title: "夜间巡查之后", opener: "塞西莉亚关掉监控墙：“站岗结束。现在谈你自己的选择。”" },
      penitentiaryOwner: { character: "penitentiaryOwner", location: "影狱顶层办公室", title: "幕后账本之外", opener: "伊莎贝拉把赎罪卷账本推开：“助理任务结束后，你还留下了什么？”" },
    },
  };
})(window.LifeGame);
