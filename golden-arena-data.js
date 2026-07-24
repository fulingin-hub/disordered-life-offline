(function (LG) {
  const arenas = [
    {
      id: "university",
      name: "国立大学角斗场",
      host: "主持人·钟离澜",
      champion: "冠军·柳问星",
      venue: "星轨演算环围绕擂台旋转，观众席像一座公开答辩会场。",
      welcome: "请用结果证明你的战术模型。这里不承认侥幸，只记录胜负。",
      crowd: "学生们压低声音核对你的远征档案。",
      victory: "六国校旗与演算光幕同时升起，柳问星向你递交冠军认证。",
      theme: "academy",
    },
    {
      id: "sanctuary",
      name: "机构园区角斗场",
      host: "主持人·艾琳",
      champion: "冠军·伊莎贝尔",
      venue: "白色生体陶瓷覆盖场地，医疗无人机在透明穹顶下巡航。",
      welcome: "生命体征稳定。接下来，请展示你在压力下维持判断的能力。",
      crowd: "研究员们隔着观察窗安静记录。",
      victory: "穹顶降下银白光雨，伊莎贝尔为你别上园区冠军徽记。",
      theme: "sanctuary",
    },
    {
      id: "ranch",
      name: "米国牧场角斗场",
      host: "主持人·黛西",
      champion: "冠军·雷切尔",
      venue: "装甲围栏、风车与重型扩音器把荒原赛场变成一场盛大巡回赛。",
      welcome: "别怕弄脏靴子。牧场只看谁能站到最后一轮。",
      crowd: "牛仔帽在人群里起伏，下注声盖过机械风车。",
      victory: "礼炮与金属套索划过天空，雷切尔举杯宣布新冠军诞生。",
      theme: "ranch",
    },
    {
      id: "paradise",
      name: "乐园角斗场",
      host: "主持人·米娅",
      champion: "冠军·璐璐",
      venue: "彩色追光、舞台升降机与全息礼花让每一轮都像黄金时段节目。",
      welcome: "镜头已经推近了。英雄可不能让观众等太久。",
      crowd: "应援灯牌随着主持人的节拍整齐闪烁。",
      victory: "冠军台升到半空，璐璐带领全场为你的十连胜倒数欢呼。",
      theme: "paradise",
    },
    {
      id: "domain",
      name: "异域联邦角斗场",
      host: "主持人·薇奥拉",
      champion: "冠军·娜塔莎",
      venue: "黑曜石赌桌围成擂台，紫金筹码在观众席上空投射实时赔率。",
      welcome: "出拳之前想清楚。异域联邦最欣赏敢承担结果的人。",
      crowd: "贵宾席端着酒杯，观察你的每一次犹豫。",
      victory: "赔率屏全部归零，娜塔莎亲手把冠军筹码推到你面前。",
      theme: "domain",
    },
    {
      id: "otherworld",
      name: "异界联盟角斗场",
      host: "主持人·赛琳",
      champion: "冠军·阿斯塔",
      venue: "魔纹石柱、冒险者旗帜与深渊战利品组成最喧闹的远征者赛场。",
      welcome: "这里没有漂亮话。带着能活着回来的判断走上擂台。",
      crowd: "冒险者们敲着酒杯，等你拿出远征英雄的本事。",
      victory: "魔纹火炬沿场地点燃，阿斯塔与全体冒险者向你举起武器。",
      theme: "otherworld",
    },
  ];
  const setPieces = [
    ["champion-crown", "职业冠军战术冠"],
    ["champion-armor", "职业冠军重装甲"],
    ["champion-gauntlets", "职业冠军裁决臂铠"],
    ["champion-belt", "职业冠军统御腰封"],
    ["champion-boots", "职业冠军踏场战靴"],
  ].map(([id, name]) => ({ id, name, cost: 1000 }));

  LG.GOLDEN_ARENA_DATA = {
    arenas,
    setPieces,
    medal: {
      id: "champion-career-medal", name: "冠军职业勋章", cost: 500,
    },
    king: {
      id: "king-of-kings", name: "二阶职业·万王之王", cost: 50000,
      male: "./assets/generated/career-second-king-of-kings-male.07d8f3fc.webp",
      female: "./assets/generated/career-second-king-of-kings-female.1bd30d23.webp",
    },
    dragon: {
      id: "salukas-sky-dragon", name: "萨卢卡斯的天空龙", cost: 100000,
      image: "./assets/generated/mount-salukas-sky-dragon.6dac5dcf.webp",
    },
  };
})(window.LifeGame);
