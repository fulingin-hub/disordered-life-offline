(function () {
  const gameState = window.OfflineGameState?.default;
  const dialogue = window.OfflineDialogue?.default;
  let mutex = Promise.resolve();

  const names = {
    qin: "秦媚", lin: "林岚", su: "苏菲", shen: "沈静秋",
    reina: "高桥玲奈", miki: "佐藤美纪", mari: "神崎真理",
    evelyn: "伊芙琳", claire: "克莱尔", ruth: "露丝",
    qinghe: "清和", ciyun: "慈云", agnes: "艾格尼丝",
    kaori: "黑田香织", victoria: "维多利亚",
    streetThug: "街头恶女", beggar: "流浪女",
    japanOfficial: "日本女高官", usaOfficial: "美国女高官",
    casinoBunny: "伊琳娜", casinoLead: "叶卡捷琳娜",
    casinoManager: "韩智妍", casinoOwner: "尹瑞英",
  };

  const replies = {
    regular: [
      "我听见了。先别急着解释，把真正想要的结果说清楚。",
      "选择已经摆在面前，态度比漂亮话更有用。",
      "你可以继续说，但我只会回应有分量的决定。",
    ],
    tribute: [
      "既然主动来到这里，就按照房间的规矩证明诚意。",
      "少说空话，先完成眼前的服侍，再谈你的请求。",
      "你的态度还不够明确，继续用行动回答。",
    ],
    market: [
      "交易讲究代价。你想得到什么，就先确认自己付得起。",
      "这里不接受侥幸，每一次选择都会留下记录。",
      "条件满足后我自然会放行，现在先看清自己的筹码。",
    ],
    casino: [
      "赌场只认结果。犹豫不会减少损失，只会暴露弱点。",
      "你可以下注，也可以离开，但别把冲动当成勇气。",
      "牌面不会同情任何人，决定之前先想清楚代价。",
    ],
  };

  function category(id) {
    if (id === "streetThug" || id === "beggar") return "tribute";
    if (id === "japanOfficial" || id === "usaOfficial") return "market";
    if (String(id).startsWith("casino")) return "casino";
    return "regular";
  }

  function localReply(body) {
    const id = body?.characterId;
    const text = String(body?.userText || "");
    let hash = 0;
    for (const char of `${id}:${text}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    const pool = replies[category(id)];
    return `${names[id] || "她"}看着你。${pool[hash % pool.length]}`;
  }

  const kv = {
    async get(key) {
      const value = await OfflineDB.get("authority", key);
      return value === null ? null : { value };
    },
    async put(key, value) {
      await OfflineDB.put("authority", key, value);
      return true;
    },
    async delete(key) {
      await OfflineDB.delete("authority", key);
      return true;
    },
  };

  function context(body) {
    return {
      kv,
      completions: {
        async *stream() {
          const reply = localReply(body);
          for (let index = 0; index < reply.length; index += 8) {
            await new Promise((resolve) => window.setTimeout(resolve, 18));
            yield { delta: reply.slice(index, index + 8) };
          }
        },
      },
    };
  }

  function exclusive(task) {
    const run = mutex.then(task, task);
    mutex = run.catch(() => {});
    return run;
  }

  async function invoke(name, body) {
    if (name !== "game-state" || !gameState) {
      throw Object.assign(new Error("离线功能不存在。"), { code: "function_error" });
    }
    return exclusive(() => gameState({ body }, context(body)));
  }

  async function* invokeStream(name, body) {
    if (name !== "dialogue" || !dialogue) {
      yield { type: "error", code: "function_error", message: "离线对话不可用。" };
      return;
    }
    let release;
    const previous = mutex;
    mutex = new Promise((resolve) => { release = resolve; });
    await previous.catch(() => {});
    try {
      for await (const chunk of dialogue({ body }, context(body))) yield chunk;
    } finally {
      release();
    }
  }

  async function chatMessages() {
    return await OfflineDB.get("chat", "messages") || [];
  }

  const chat = {
    async list(ids) {
      const messages = await chatMessages();
      return Array.isArray(ids) ? messages.filter((item) => ids.includes(item.id)) : messages;
    },
    async insert(parentId, items) {
      const messages = await chatMessages();
      const ids = items.map((item) => {
        const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
        messages.push({ ...item, id, parent: parentId || undefined,
          children: [], timestamp: new Date().toISOString() });
        return id;
      });
      await OfflineDB.put("chat", "messages", messages.slice(-12000));
      return { ids };
    },
    async timeline() {
      return (await chatMessages()).map((item) => item.id);
    },
  };

  function toast(level, message) {
    const item = document.createElement("div");
    item.className = `offline-toast ${level}`;
    item.textContent = String(message || "");
    document.body.append(item);
    window.setTimeout(() => item.remove(), 2400);
  }

  window.dzmm = {
    fn: { invoke, invokeStream },
    chat,
    kv: {
      async get(key) {
        const value = await OfflineDB.get("legacy", key);
        return value === null ? null : { value };
      },
      put: (key, value) => OfflineDB.put("legacy", key, value),
      delete: (key) => OfflineDB.delete("legacy", key),
    },
    loading: { progress() {}, ready() {}, error() {} },
    toast: Object.fromEntries(["success", "error", "warning", "info"]
      .map((level) => [level, (message) => toast(level, message)])),
    user: { info: async () => ({ id: "offline-player", name: "离线玩家" }) },
    errors: { isDzmmError: (error) => Boolean(error?.code) },
    getLaunchParams: () => ({ from: null, gp: null }),
    async share(options) {
      const url = location.href;
      if (options?.mode !== "url" && navigator.share) {
        await navigator.share({ title: "失序人生", url });
        return { url, shared: true };
      }
      return { url, shared: false };
    },
  };
  window.dispatchEvent(new Event("dzmm:ready"));
})();
