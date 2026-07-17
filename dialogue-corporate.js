(function (LG) {
  LG.CORPORATE_DIALOGUE = {
    characters: {
      kaori: {
        name: "黑田香织",
        fallback: [
          "你把失礼解释成冲动，只是因为承担后果比交出判断更难。",
          "处分有期限，服从协议没有。你确定自己分得清哪一个更危险？",
          "文化与公司都不是借口。是否保留边界，只取决于你的选择。",
        ],
      },
      victoria: {
        name: "维多利亚·海斯",
        fallback: [
          "你想用服从换掉处分，说明你仍在逃避为自己负责。",
          "一份好职位不会要求你交出账户、住处和下班后的生活。",
          "别把崇拜包装成职业判断。真正的能力允许你说不。",
        ],
      },
    },
    scenes: {
      "japan-corporate-interview": { character: "kaori", location: "岛国企业面试室", opener: "黑田香织合上履历，等待你把视线放回正式问题上。" },
      "japan-corporate-incident": { character: "kaori", location: "岛国企业合规办公室", opener: "违规记录停在屏幕上，黑田香织要求你先解释自己的判断。" },
      "japan-corporate-risk-final": { character: "kaori", location: "岛国企业主管办公室", opener: "长期协议与正式处分并排放着，黑田香织没有替你拿笔。" },
      "japan-corporate-success-final": { character: "kaori", location: "岛国企业晋升评审室", opener: "黑田香织把晋升文件翻到职责与薪资页，等你逐条确认。" },
      "usa-corporate-interview": { character: "victoria", location: "米国企业面试室", opener: "维多利亚把履历放在桌面中央，要求你用专业表达重新开始。" },
      "usa-corporate-incident": { character: "victoria", location: "米国企业合规办公室", opener: "维多利亚调出设备记录，平静地询问你准备承担什么后果。" },
      "usa-corporate-risk-final": { character: "victoria", location: "米国企业高管办公室", opener: "控制协议、门禁卡与处分文件摆成一列，维多利亚等你选择。" },
      "usa-corporate-success-final": { character: "victoria", location: "米国企业晋升评审室", opener: "维多利亚关闭私人档案，只留下正式的晋升材料。" },
    },
    rooms: {
      kaori: { character: "kaori", location: "黑田香织的主管办公室", title: "合规记录之外", opener: "黑田香织锁上档案柜：“这里没有处分。说说你还想把什么交给权威决定。”" },
      victoria: { character: "victoria", location: "维多利亚的高层办公室", title: "绩效评审之外", opener: "维多利亚合上评审表：“这次没有职位交换。你可以直接说不。”" },
    },
  };
})(window.LifeGame);
