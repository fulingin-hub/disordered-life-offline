(function (LG) {
  const ROOM_COST = 50;

  function createId() {
    if (window.crypto?.randomUUID) return `dialogue:${window.crypto.randomUUID()}`;
    return `dialogue:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  LG.dialogueAuthority = {
    create(characterId) {
      const id = createId();
      const mutate = (method, phase) => LG.authority.mutate(method, {
        dialogueId: id,
        characterId,
        operationId: `${id}:${phase}`,
      });
      return {
        id,
        begin: () => mutate("dialogueBegin", "begin"),
        complete: () => mutate("dialogueComplete", "complete"),
        cancel: () => mutate("dialogueCancel", "cancel"),
      };
    },
    pass(character) {
      const value = LG.authority.snapshot()
        ?.economy?.dialoguePasses?.[character]?.remaining;
      return Math.max(0, Math.min(20, Math.floor(Number(value) || 0)));
    },
    canUse(character) {
      if (LG.infernalClub?.isCharacter?.(character)) {
        return LG.infernalClub.canChat(character);
      }
      return this.pass(character) > 0 || LG.traits.points() >= ROOM_COST;
    },
    status(character) {
      if (LG.infernalClub?.isCharacter?.(character)) {
        return LG.infernalClub.chatStatus(character);
      }
      const points = LG.traits.points();
      const remaining = this.pass(character);
      if (remaining) {
        return `AI对话本周期已支付50点属性点：剩余${remaining}/20轮；第20轮后自动清理记录。`;
      }
      return points >= ROOM_COST
        ? `AI对话费用：消耗50点属性点，解锁20轮对话；第20轮后自动清理记录。当前${points}点。`
        : `AI对话费用：需要50点属性点。当前仅${points}点，需补足后才能解锁20轮对话。`;
    },
  };
})(window.LifeGame);
