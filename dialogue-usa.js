(function (LG) {
  LG.USA_DIALOGUE = {
    characters: {
      evelyn: {
        name: "伊芙琳·哈特",
        fallback: [
          "你把透支叫作上进，只是因为承认极限会让你觉得不够优秀。",
          "论文需要数据，而你似乎很愿意把自己也变成数据。",
          "拒绝我不会让你失去学术，失去判断才会。",
        ],
      },
      claire: {
        name: "克莱尔·摩根",
        fallback: [
          "你不是在融入，你只是在等一个看起来成功的人替你定价。",
          "礼物、职位和亲密都可以拒绝，除非你已经把拒绝权一起送给我。",
          "别拿留在这里当答案。先说清楚，你留下以后还剩多少自己。",
        ],
      },
      ruth: {
        name: "露丝·卡特",
        fallback: [
          "牧场需要能工作的手，不需要你把判断也锁进仓库。",
          "你把被管理叫作轻松，是因为独立会逼你承担后果。",
          "门一直在那里。真正的问题是，你还敢不敢自己走出去。",
        ],
      },
    },
    scenes: {
      "evelyn-lab": { character: "evelyn", location: "大学研究实验室", opener: "伊芙琳关掉计时器，把没有署名的实验记录推到你面前。" },
      "evelyn-stimulant": { character: "evelyn", location: "教授办公室", opener: "伊芙琳把没有说明的药瓶留在桌面中央，等你自己承认害怕失败。" },
      "evelyn-final": { character: "evelyn", location: "封闭实验室", opener: "最终论文已经提交，伊芙琳让你在没有自己名字的首页前坐下。" },
      "claire-contract": { character: "claire", location: "公司高管办公室", opener: "克莱尔把工资账户与实习合同并排放好，先问你愿意交出哪一个。" },
      "claire-leverage": { character: "claire", location: "毕业酒会休息室", opener: "克莱尔关上门，工作担保与私人条件都没有写在正式合同里。" },
      "claire-final": { character: "claire", location: "高层公寓会客厅", opener: "账户、钥匙与身份文件整齐摆着，克莱尔只把其中一份推向你。" },
      "ruth-invitation": { character: "ruth", location: "牧场酒吧", opener: "露丝敲了敲吧台，提醒你今晚本来应该在复习。" },
      "ruth-conditioning": { character: "ruth", location: "牧场管理室", opener: "没有医疗说明的计划表摊在桌上，露丝要求你别再追问内容。" },
      "ruth-final": { character: "ruth", location: "牧场记录室", opener: "露丝翻开资产记录，属于你的那一页只有指标，没有毕业计划。" },
    },
    rooms: {
      evelyn: { character: "evelyn", location: "伊芙琳的私人研究室", title: "署名之外的问答", opener: "伊芙琳合上论文：“这里没有评审。说说你还想证明什么。”" },
      claire: { character: "claire", location: "克莱尔的顶层会客厅", title: "合同之外的条件", opener: "克莱尔把钥匙留在桌上：“这次没有担保，你还会坐在这里吗？”" },
      ruth: { character: "ruth", location: "露丝的牧场办公室", title: "围栏之外的谈话", opener: "露丝关上记录本：“现在没有工时表，你可以自己决定什么时候离开。”" },
    },
  };
})(window.LifeGame);
