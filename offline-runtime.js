(function () {
  const gameState = window.OfflineGameState?.default;
  const dialogue = window.OfflineDialogue?.default;
  const dialogueReplies = window.OfflineDialogueReplies;
  let mutex = Promise.resolve();

  function localReply(body) {
    return dialogueReplies.reply(body);
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
      lifeCinemaTestMode: window.LifeGame?.TEST_MODE?.lifeCinemaCheats === true,
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
  window.OfflineDialogueRuntime = {
    characterIds: dialogueReplies.characterIds,
    localReply,
  };
  window.dispatchEvent(new Event("dzmm:ready"));
})();
