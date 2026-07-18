(function (LG) {
  let latestRequestId = 0;
  let inFlight = false;
  const retryable = new Set(["runtime_unavailable", "runtime_busy", "too_many_requests"]);
  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const roomCost = 50;

  function operationId() {
    if (window.crypto?.randomUUID) return `dialogue:${window.crypto.randomUUID()}`;
    return `dialogue:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
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

  async function streamReply(body, requestId, onUpdate) {
    let content = "";
    let completed = false;
    for await (const chunk of window.dzmm.fn.invokeStream("dialogue", body, { timeout: 60000 })) {
      if (requestId !== latestRequestId) return null;
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
      if (inFlight) return null;
      inFlight = true;
      const requestId = ++latestRequestId;
      const body = {
        kind: String(event?.id || "").startsWith("room-") ? "room" : "event",
        sceneId: event?.id,
        characterId: scene.character,
        userText,
        runId: state.runId,
      };
      if (body.kind === "room") body.operationId = operationId();

      try {
        if (!window.dzmm?.fn?.invokeStream) {
          const error = new Error("权威对话服务不可用。");
          error.code = "FUNCTION_UNAVAILABLE";
          throw error;
        }

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const response = await streamReply(body, requestId, onUpdate);
            if (requestId !== latestRequestId) return null;
            return response || localReply(scene, state, event);
          } catch (err) {
            if (requestId !== latestRequestId) return null;
            if (err.code === "function_error" && body.kind !== "room") {
              const fallback = localReply(scene, state, event);
              onUpdate(fallback);
              return fallback;
            }
            if (!retryable.has(err.code) || attempt === 1) throw err;
            await sleep(1000 * (2 ** attempt));
          }
        }
        return null;
      } finally {
        inFlight = false;
      }
    },
    cancel() {
      latestRequestId += 1;
    },
    isBusy() {
      return inFlight;
    },
    roomPass(character) {
      const pass = LG.authority?.snapshot?.()?.economy?.dialoguePasses?.[character];
      return Math.max(0, Math.min(20, Math.floor(Number(pass?.remaining) || 0)));
    },
    canUseRoom(character) {
      if (LG.infernalClub?.isCharacter?.(character)) {
        return LG.infernalClub.canChat(character);
      }
      return this.roomPass(character) > 0 || LG.traits.points() >= roomCost;
    },
    roomActionLabel() {
      return "服侍";
    },
    roomStatus(character) {
      if (LG.infernalClub?.isCharacter?.(character)) {
        return LG.infernalClub.chatStatus(character);
      }
      const points = LG.traits.points();
      const remaining = this.roomPass(character);
      if (remaining) {
        return `AI对话本周期已支付50点属性点：剩余${remaining}/20轮；第20轮后自动清理记录。`;
      }
      return points >= roomCost
        ? `AI对话费用：消耗50点属性点，解锁20轮对话；第20轮后自动清理记录。当前${points}点。`
        : `AI对话费用：需要50点属性点。当前仅${points}点，需补足后才能解锁20轮对话。`;
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
          return err?.message || "人格值不足，完成异界任务后再开启对话。";
        case "REQUEST_PENDING":
          return "该对话请求仍在处理中，请稍后再试。";
        case "BILLING_FAILED":
        case "REFUND_FAILED":
          return err?.message || "属性点结算失败，请刷新后重试。";
        case "function_not_published":
          return "对话服务尚未发布，请先保存游戏后重试。";
        case "function_timeout":
          return "角色回应超时，请稍后重试。";
        case "function_error":
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
