(function (LG) {
  const data = LG.GUILD_ONBOARDING_DATA;
  data.guides.tavernExplorer = {
    id: "tavernExplorer", name: "赫克托",
    role: "老冒险者 · 百层深渊远征队长",
    scene: "./assets/generated/career-adventurer-male.a6e78beb.webp",
  };
  data.topics.splice(4, 0, {
    id: "teamExpedition",
    title: "百层深渊为什么只让我打二十层？",
    scene: "teamExpedition",
  });
  data.scenes.teamExpedition = {
    topic: "teamExpedition",
    location: "黄金都城酒馆 · 五人远征征召桌",
    speaker: "tavernExplorer",
    cast: ["tavernExplorer", "guildManager"],
    title: "队长只有一位，你是第五席队员",
    copy: (snapshot) => {
      const clears = Number(snapshot?.economy?.infernalRealm?.clears) || 0;
      return clears >= 2
        ? "赫克托把百层地图撕成五段，自己先拿走其中一张。赛琳、塔维与凯恩各领二十层，最后一张推到你面前。你可以选择承担哪个区段，但路线、撤离与战果汇总由老队长决定。"
        : `赫克托把最后一张区段牌扣在桌上：“先完成两次七层远征。你现在有${clears}次记录，维奥拉会先把应得的装备交给你。”`;
    },
    tips: [
      "五人各负责20层；玩家完成个人区段后，队长汇总NPC战果完成百层结算。",
      "金币、材料、职业增益与稀有战利品均按五分之一结算；五枚凭证合成一个战利品宝箱。",
      "职业名或战绩不会赋予玩家队长权限，远征界面也没有申请队长的入口。",
    ],
    choices: (snapshot) => {
      const clears = Number(snapshot?.economy?.infernalRealm?.clears) || 0;
      return [
        { label: "让维奥拉核对我的首征与二征奖励", action: "guildRewards" },
        clears >= 2
          ? { label: "接受赫克托分配的二十层", action: "abyss" }
          : { label: "先去完成七层地狱远征", action: "infernal" },
        { label: "回到公会大厅", next: "hub", quiet: true },
      ];
    },
  };
})(window.LifeGame);
