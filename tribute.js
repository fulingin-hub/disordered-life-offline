(function (LG) {
  const characterIds = ["streetThug", "beggar"];
  const rewards = [
    { points: 100, label: "贡金凭证与裸足CG画廊" },
    { points: 200, label: "臭袜子" },
    { points: 300, label: "臭内裤" },
    { points: 400, label: "专属AI对话" },
    { points: 500, label: "臭鞋" },
    { points: 600, label: "擦脚布与专属饮品购买资格" },
  ];
  let data;
  let saveQueue = Promise.resolve();

  function emptyData() {
    return {
      version: 1,
      points: Object.fromEntries(characterIds.map((id) => [id, 0])),
    };
  }

  function normalize(saved) {
    const next = emptyData();
    if (!saved || typeof saved !== "object") return next;
    characterIds.forEach((id) => {
      next.points[id] = Math.max(0, Math.floor(Number(saved.points?.[id]) || 0));
    });
    return next;
  }

  LG.tribute = {
    rewards,
    async init() {
      data = normalize(await LG.storage.loadTribute());
    },
    isCharacter(id) {
      return characterIds.includes(id);
    },
    points(id) {
      return this.isCharacter(id) ? data.points[id] : 0;
    },
    nextReward(id) {
      const current = this.points(id);
      return rewards.find((reward) => reward.points > current) || null;
    },
    galleryUnlocked(id) {
      return this.points(id) >= 100;
    },
    canChat(id) {
      return LG.TEST_MODE?.unlockAllRooms || !this.isCharacter(id) || this.points(id) >= 400;
    },
    contribute(id, amount) {
      const value = Math.floor(Number(amount));
      if (!this.isCharacter(id) || !LG.achievements.isUnlocked(id)) {
        return { ok: false, message: "当前贡金房间不可用。" };
      }
      if (!Number.isInteger(value) || value <= 0) {
        return { ok: false, message: "请输入有效的贡献点数。" };
      }
      if (!LG.traits.spendPoints(value)) {
        return { ok: false, message: `属性点不足，需要${value}点。` };
      }
      const before = data.points[id];
      data.points[id] += value;
      const unlocked = rewards.filter((reward) =>
        before < reward.points && data.points[id] >= reward.points);
      const rewardText = unlocked.length
        ? ` 解锁：${unlocked.map((reward) => reward.label).join("、")}。`
        : data.points[id] >= 600 ? " 600点后不再产生其他奖励。" : "";
      return {
        ok: true,
        points: data.points[id],
        unlocked,
        message: `已贡献${value}点，累计贡金${data.points[id]}点。${rewardText}`.trim(),
      };
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveTribute(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
