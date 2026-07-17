(function (LG) {
  LG.SANCTUARY_DIALOGUE = {
    characters: {
      qinghe: {
        name: "清和",
        fallback: ["规律生活不等于把账户交给我，你应该分得清。", "如果康复必须靠服从某个人证明，那就不是康复。", "门没有锁，你害怕的是重新为自己负责。"],
      },
      ciyun: {
        name: "慈云",
        fallback: ["感恩不是终身欠款，更不需要交出余下的人生。", "你愿意劳动，是选择；你不敢拒绝，才是控制。", "离开这里不会抹掉曾经得到的帮助。"],
      },
      agnes: {
        name: "艾格尼丝",
        fallback: ["真正的信念不需要你切断医生、朋友和家人。", "你把我的肯定当作救赎，所以才越来越不敢质疑。", "任何不允许离开的秩序，都不值得你交出判断。"],
      },
    },
    scenes: {},
    rooms: {
      qinghe: { character: "qinghe", location: "清和的静修室", title: "清规之外", opener: "清和合上作息册：“今天不检查服从，只听你自己的决定。”" },
      ciyun: { character: "ciyun", location: "慈云的会客室", title: "感恩之外", opener: "慈云收起捐款簿：“没有债务时，你还会如何理解帮助？”" },
      agnes: { character: "agnes", location: "艾格尼丝的谈话室", title: "唯一答案之外", opener: "艾格尼丝关掉录音设备：“现在没有见证人，你可以不同意我。”" },
    },
  };
  ["qinghe", "ciyun", "agnes"].forEach((id) => {
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-indoctrination`] = {
      character: id, location: "虚构机构会谈室", opener: "她把健康记录放到桌上，要求你先解释为什么还需要外界意见。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-tribute`] = {
      character: id, location: "虚构机构管理室", opener: "越界记录与收入清单并排放着，她要求你用服从换取保密。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-privacy`] = {
      character: id, location: "私人房间外", opener: "她停在半掩的门边，问你是否明白好奇与窥探的界线。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-property`] = {
      character: id, location: "公共保管区", opener: "她核对柜中物品，平静地等你说明自己是否碰过它们。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-records`] = {
      character: id, location: "管理室门口", opener: "桌上的私人记录已经收起，她要求你解释为何曾在门边停留。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-normal`] = {
      character: id, location: "机构出口", opener: "她把结业记录交还给你，承认你的生活应当由你自己决定。",
    };
    LG.SANCTUARY_DIALOGUE.scenes[`${id}-final`] = {
      character: id, location: "封闭管理室", opener: "多年记录只剩服从与付款，她问你是否还记得最初为何来到这里。",
    };
  });
})(window.LifeGame);
