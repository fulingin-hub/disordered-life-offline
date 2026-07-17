(function (LG) {
  const el = {};
  let activeCharacter = null;
  let saving = false;

  function updateRoomActions() {
    const progress = LG.collectibles.progress(activeCharacter);
    el.items.textContent = `道具图鉴·${progress.count}/${progress.total}`;
    el.gallery.textContent = LG.collectibles.galleryUnlocked(activeCharacter)
      ? "CG画廊" : "CG画廊·未解锁";
  }

  function render() {
    const special = LG.tribute.isCharacter(activeCharacter);
    el.panel.hidden = !special;
    if (!special) {
      el.chatForm.hidden = false;
      return;
    }
    const points = LG.tribute.points(activeCharacter);
    const available = LG.traits.points();
    const next = LG.tribute.nextReward(activeCharacter);
    el.points.textContent = String(points);
    el.available.textContent = String(available);
    el.progress.value = Math.min(600, points);
    el.next.textContent = next
      ? `下一里程碑 ${next.points} · ${next.label}`
      : "600点奖励已完成 · 后续无其他奖励";
    el.input.max = String(available);
    const currentInput = Math.floor(Number(el.input.value));
    if (!currentInput || currentInput > available) {
      el.input.value = String(available > 0 ? Math.min(10, available) : 0);
    }
    el.button.disabled = saving || available <= 0;
    el.chatForm.hidden = !LG.tribute.canChat(activeCharacter);
    el.status.textContent = LG.tribute.canChat(activeCharacter)
      ? `${LG.dialogueAI.roomStatus(activeCharacter)} 角色贡金仍可继续增加。`
      : `专属AI对话将在贡金达到400点后开放（当前${points}点）；开放后消耗50点属性点可解锁20轮。`;
    updateRoomActions();
  }

  async function contribute() {
    if (saving || !activeCharacter) return;
    saving = true;
    let feedback = "正在提交贡金…";
    el.status.textContent = feedback;
    try {
      const result = await LG.authority.mutate("contribute", {
        character: activeCharacter,
        amount: Number(el.input.value),
      });
      feedback = result.message;
      LG.traitsUI.refresh();
      LG.collectiblesUI.refresh();
      LG.equipmentUI.refresh();
      window.dzmm?.toast?.success?.(result.message);
    } catch (err) {
      console.error("贡金保存失败:", err.code, err.message, err.stack);
      feedback = "贡金保存失败，请稍后重试。";
    } finally {
      saving = false;
      render();
      LG.roomConsumablesUI.refresh();
      el.status.textContent = feedback;
    }
  }

  LG.tributeUI = {
    init() {
      el.panel = document.getElementById("roomTribute");
      el.form = document.getElementById("roomTributeForm");
      el.points = document.getElementById("roomTributePoints");
      el.available = document.getElementById("roomTributeAvailable");
      el.progress = document.getElementById("roomTributeProgress");
      el.next = document.getElementById("roomTributeNext");
      el.input = document.getElementById("roomTributeInput");
      el.button = document.getElementById("roomTributeButton");
      el.chatForm = document.getElementById("roomForm");
      el.status = document.getElementById("roomStatus");
      el.items = document.getElementById("roomItemsButton");
      el.gallery = document.getElementById("roomGalleryButton");
      el.form.addEventListener("submit", (event) => {
        event.preventDefault();
        contribute();
      });
    },
    enter(character) {
      activeCharacter = character;
      render();
      LG.roomConsumablesUI.enter(character);
    },
    leave() {
      activeCharacter = null;
      el.panel.hidden = true;
      el.chatForm.hidden = false;
      LG.roomConsumablesUI.leave();
    },
  };
})(window.LifeGame);
