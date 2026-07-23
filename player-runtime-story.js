(function (LG) {
  const endings = {
    "self-directed-life": {
      id: "self-directed-life",
      title: "掌舵的人生",
      text: "你没有得到一条完美路线，但每次转向都由自己决定。",
      ordinary: true, hidden: false, universal: true, cg: null,
    },
    "drifting-life": {
      id: "drifting-life",
      title: "随波而行",
      text: "你抵达了终点，却发现许多关键决定都交给了别人。",
      ordinary: false, hidden: false, universal: true, cg: null,
    },
  };
  const events = [
    {
      id: "compat-departure", chapter: "序章", age: 18,
      title: "离开熟悉的街区",
      text: "新的车站在清晨亮起。你只能带走一种面对未来的方式。",
      choices: [
        { label: "先学习，再决定方向", hint: "学识与自主提升",
          delta: { knowledge: 12, autonomy: 8 } },
        { label: "先工作，在现实中找答案", hint: "资金与人际提升",
          delta: { money: 12, social: 8 } },
      ],
    },
    {
      id: "compat-setback", chapter: "第一章", age: 20,
      title: "第一次真正的挫折",
      text: "计划没有按预期发生。你需要决定如何处理失败。",
      choices: [
        { label: "向可信的人求助", hint: "健康与人际提升",
          delta: { health: 8, social: 10, dependence: 2 } },
        { label: "拆解问题，独自重做", hint: "自主与学识提升",
          delta: { autonomy: 10, knowledge: 8, health: -3 } },
      ],
    },
    {
      id: "compat-offer", chapter: "第二章", age: 23,
      title: "看似轻松的邀约",
      text: "一份高回报邀请要求你交出更多时间与决定权。",
      choices: [
        { label: "接受，但写清边界", hint: "资金提升，保留自主",
          delta: { money: 14, autonomy: 4, dependence: 3 } },
        { label: "拒绝，继续自己的路线", hint: "尊严与自主提升",
          delta: { dignity: 10, autonomy: 8, money: -4 } },
      ],
    },
    {
      id: "compat-crossroad", chapter: "第三章", age: 26,
      title: "职业岔路",
      text: "稳定岗位与未知机会同时出现，没有任何选项保证正确。",
      choices: [
        { label: "选择稳定，积累长期能力", hint: "健康与资金提升",
          delta: { health: 7, money: 9, knowledge: 5 } },
        { label: "承担风险，争取更大空间", hint: "自主与人际提升",
          delta: { autonomy: 12, social: 8, health: -4 } },
      ],
    },
    {
      id: "compat-boundary", chapter: "第四章", age: 29,
      title: "关系中的边界",
      text: "重要的人希望替你做决定。你仍然可以表达自己的选择。",
      choices: [
        { label: "认真沟通，坚持自己的底线", hint: "尊严与自主提升",
          delta: { dignity: 12, autonomy: 10, social: -2 } },
        { label: "暂时让步，维持眼前关系", hint: "人际提升，依赖增加",
          delta: { social: 10, dependence: 12, dignity: -6 } },
      ],
    },
    {
      id: "compat-review", chapter: "终章", age: 33,
      title: "回望来路",
      text: "没有人能替你定义成功。最后一次选择只决定你如何看待自己。",
      choices: [
        { label: "承认代价，也承认这是我的人生", hint: "自主与尊严提升",
          delta: { autonomy: 8, dignity: 8 } },
        { label: "把答案交给别人的评价", hint: "依赖增加",
          delta: { dependence: 12, dignity: -5 } },
      ],
    },
  ];
  LG.PLAYER_FALLBACK_STORY = { endings, events };
})(window.LifeGame);
