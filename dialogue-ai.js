(function (LG) {
  let cancelActiveRoom = null;
  function actionId(prefix) {
    try {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return `${prefix}:${[...bytes].map((value) =>
        value.toString(16).padStart(2, "0")).join("")}`;
    } catch (_) {
      return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    }
  }
  function despairAddress(reply) {
    const active = LG.traits?.active?.();
    if (active?.id !== "despair" || active.tier < 100) return reply;
    return reply.startsWith("丧志贱狗") ? reply : `丧志贱狗，${reply}`;
  }
  function casinoTone(reply, scene) {
    if (!LG.casino?.isCharacter?.(scene.character)) return reply;
    const losses = LG.casino.losses();
    if (losses >= 60) return `输了${losses}次还敢抬头？先站到我的鞋边听命令。${reply}`;
    if (losses >= 30) return `你已经失败${losses}次，判断力不值得尊重。${reply}`;
    if (losses >= 10) return `累计${losses}次失败，你该学会听从命令了。${reply}`;
    return reply;
  }
  function roomAddress(reply, scene, event) {
    const active = LG.traits?.active?.();
    if (!String(event?.id || "").startsWith("room-") || active?.id === "despair"
      || !LG.roomConsumables?.qualifiesForAddress(scene.character)) return reply;
    if (LG.tribute?.isCharacter(scene.character)) {
      const cleaned = reply.replace(/^傻逼[，,]?/, "");
      return `傻逼厕奴，${cleaned}`;
    }
    return reply.startsWith("厕奴") ? reply : `厕奴，${reply}`;
  }
  function localReply(scene, state, event) {
    const key = scene.conversationKey || scene.character;
    const used = Math.floor((state.conversations?.[key]?.length || 0) / 2);
    const reply = casinoTone(scene.fallback[used % scene.fallback.length], scene);
    if (LG.tribute?.isCharacter(scene.character)) return roomAddress(reply, scene, event);
    const lead = LG.traits?.fallbackLead?.() || "";
    return roomAddress(despairAddress(lead ? `${lead}${reply}` : reply), scene, event);
  }
  function serverError(chunk) {
    const error = new Error(chunk.message || "角色暂时没有回应。");
    error.code = chunk.code || "AI_FAILED";
    return error;
  }
  async function streamReply(body, requestId, onUpdate, fallbackText) {
    let content = "";
    let completed = false;
    for await (const chunk of LG.playerRuntime.stream(
      "dialogue", body, { timeout: 60000 }, fallbackText)) {
      if (!LG.dialogueRequestLock.current(requestId)) return null;
      if (chunk?.type === "error") throw serverError(chunk);
      if (chunk?.type === "delta") {
        const newContent = chunk.delta || "";
        content += newContent;
        onUpdate(content);
      }
      if (chunk?.type === "done") completed = true;
    }
    if (!completed) throw serverError({
      code: "INCOMPLETE_STREAM",
      message: "角色回复未完整生成，请重试。",
    });
    return content.trim();
  }
  LG.dialogueAI = {
    async request(scene, event, state, userText, onUpdate) {
      const requestId = LG.dialogueRequestLock.begin();
      if (!requestId) return null;
      const room = String(event?.id || "").startsWith("room-");
      const assistant = event?.kind === "assistant";
      const transaction = room ? LG.dialogueAuthority.create(scene.character) : null;
      let cancelTask = null;
      const cancelRoom = () => {
        if (!room) return Promise.resolve();
    if (!cancelTask) cancelTask = transaction.cancel().catch((err) => {
          console.error("房间对话取消结算失败:", err?.code, err?.message, err?.stack);
        });
        return cancelTask;
      };
      if (room) cancelActiveRoom = cancelRoom;
      const body = {
        kind: room ? "room" : assistant ? "assistant" : "event",
        sceneId: event?.id,
        characterId: scene.character,
        userText,
        runId: state.runId,
        actionId: room ? transaction.id : actionId("dialogue"),
      };
      if (room) body.operationId = transaction.id;
      let authorized = false;
      let settled = false;
      try {
        if (!assistant && !LG.playerRuntime.active()
          && !window.dzmm?.fn?.invokeStream) {
          const error = new Error("权威对话服务不可用。");
          error.code = "FUNCTION_UNAVAILABLE";
          throw error;
        }
        if (room) {
          await transaction.begin();
          authorized = true;
        }
        try {
          const response = await streamReply(
            body, requestId, onUpdate, () => localReply(scene, state, event));
          if (!LG.dialogueRequestLock.current(requestId)) return null;
          const finalReply = response || localReply(scene, state, event);
          if (room) {
            await transaction.complete();
            settled = true;
          }
          return finalReply;
        } catch (err) {
          if (!LG.dialogueRequestLock.current(requestId)) return null;
          if (err.code === "function_error" && body.kind !== "room") {
            const fallback = localReply(scene, state, event);
            onUpdate(fallback);
            return fallback;
          }
          throw err;
        }
      } finally {
        if (room && authorized && !settled) await cancelRoom();
        if (cancelActiveRoom === cancelRoom) cancelActiveRoom = null;
        LG.dialogueRequestLock.finish(requestId);
      }
    },
    cancel() { void cancelActiveRoom?.(); LG.dialogueRequestLock.cancel(); },
    isBusy() { return LG.dialogueRequestLock.busy(); },
    roomPass(character) {
      return LG.dialogueAuthority.pass(character);
    },
    canUseRoom(character) {
      return LG.dialogueAuthority.canUse(character);
    },
    roomActionLabel() {
      return "服侍";
    },
    roomStatus(character) {
      return LG.dialogueAuthority.status(character);
    },
    errorMessage(err) {
      switch (err?.code) {
        case "RATE_LIMITED":
          return "请求太快，请稍后再试。";
        case "QUOTA_EXHAUSTED":
          return "AI 对话额度不足，稍后仍可继续人生选择。";
        case "VIP_REQUIRED":
          return "当前对话模型需要更高权限。";
        case "UNAUTHORIZED":
        case "TOKEN_EXPIRED":
        case "FORBIDDEN":
          return "登录状态已失效，请重新进入游戏。";
        case "SENSITIVE_CONTENT_DETECTED":
        case "INVALID_REQUEST":
          return "这句话无法发送，请换一种表达。";
        case "TURN_LIMIT":
          return "本次事件的对话次数已用完。";
        case "ROOM_LOCKED":
          return err?.message || "房间对话条件尚未满足。";
        case "INSUFFICIENT_POINTS":
          return err?.message || "属性点不足，贡金50点可开启20轮房间对话。";
        case "INSUFFICIENT_COUPONS":
          return err?.message || "赎罪卷不足，完成影狱任务后再开启对话。";
        case "INSUFFICIENT_PERSONALITY":
          return err?.message || "人格值不足，完成异界联盟任务后再开启对话。";
        case "AUTHORITY_READ_ONLY":
        case "AUTHORITY_RESULT_UNKNOWN":
        case "DIALOGUE_NOT_AUTHORIZED":
        case "AUTHORIZATION_FAILED":
          return err?.message || "权威对话结算暂不可用，请稍后重试。";
        case "function_not_published":
          return "对话服务尚未发布，请先保存游戏后重试。";
        case "function_timeout":
          return "角色回应超时，请稍后重试。";
        case "function_error":
          return err?.message || "对话服务暂时不可用，请稍后重试。";
        case "quota_exceeded":
        case "unsupported_import":
          return "对话服务暂时不可用，请稍后重试。";
        case "invocation_token_invalid":
          return "会话已过期，请刷新后重新进入游戏。";
        case "runtime_unavailable":
        case "runtime_busy":
        case "too_many_requests":
        case "NETWORK_ERROR":
        case "TIMEOUT":
        case "SERVICE_UNAVAILABLE":
          return "网络暂时不稳定，请稍后重试。";
        default:
          return err?.message || "对话暂时没有回应，请稍后重试。";
      }
    },
  };
})(window.LifeGame);
