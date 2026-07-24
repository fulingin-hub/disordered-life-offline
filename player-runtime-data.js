(function (LG) {
  const { endings, events } = LG.PLAYER_FALLBACK_STORY;
  const runId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const today = () => new Date().toISOString().slice(0, 10), clone =
    (value) => JSON.parse(JSON.stringify(value));

  function life() {
    return {
      version: 1, runId: runId(), gender: null, gameMode: null,
      step: 0, endingId: null, route: "compatibility", equipment: {},
      history: [], conversations: {},
      chatUsage: {}, stats: { ...LG.CONFIG.initialStats },
    };
  }

  function profile() {
    return {
      version: 1, contentMode: null, authorityVersion: 0, life: life(),
      endgameLife: null, simulationRun: null, simulationCompletions: 0,
      archive: { male: [], female: [] }, endgameArchive: { male: [], female: [] },
      simulationArchive: { male: [], female: [] },
      endgamePoints: 0, simulationPoints: 0, pendingPoints: 0, transferredPoints: 0,
    };
  }

  function current(item) { return item.life.endingId ? null : events[item.life.step] || null; }

  function visibleEvent(event, safe = false) { return event ? {
      id: event.id, chapter: event.chapter, age: event.age,
      title: safe ? "生活边界选择" : event.title, text: safe
        ? "请根据属性变化选择健康、清晰的生活边界。" : event.text,
      quote: "", speaker: "", choices: event.choices.map((choice, index) => ({
        label: safe ? `选择方案${index + 1}` : choice.label,
        hint: choice.hint, locked: false })),
    } : null; }

  function economy(points) {
    const values = Object.fromEntries(["feet", "humiliation", "control",
      "tribute", "foreign", "despair"].map((id) => [id, 0]));
    return {
      traits: { version: 5, points, lifetimePoints: points,
        values, equipped: null, rewardedRuns: [] },
      achievements: { version: 1, counts: {}, recordedRuns: [] },
      achievementPoints: { balance: 0, lifetime: 0, awardedIds: [] },
      collectibles: { version: 2, owned: [] },
      tribute: { version: 2, points: { streetThug: 0, beggar: 0 } },
      dailyTasks: { version: 1, date: today(), tasks: [] },
      dialoguePasses: {},
    };
  }

  function snapshot(item, message = "") {
    const event = current(item);
    const ending = item.life.endingId ? endings[item.life.endingId] : null;
    const gender = item.life.gender === "female" ? "female" : "male";
    const simulation = item.life.gameMode === "simulation";
    const adultSimulation = item.contentMode === "18" && simulation;
    const archive = adultSimulation ? clone(item.archive) : { male: [], female: [] };
    const view = (key) => archive[key].map((id) => ({
      ...endings[id], locked: false,
    }));
    return {
      ok: true, message, contentMode: item.contentMode,
      gameModes: {
        simulationCompletions: Number(item.simulationCompletions) || 0,
        endgameTarget: LG.playerRuntimeEndgame.target,
        endgameUnlocked: LG.playerRuntimeEndgame.unlocked(item),
      },
      authorityVersion: item.authorityVersion,
      serverDate: today(), serverTime: new Date().toISOString(),
      lifeCinema: {
        restartCount: 0,
        simulation: {
          active: simulation,
          resumable: Boolean(item.simulationRun
            && !item.simulationRun.endingId),
          completions: Number(item.simulationCompletions) || 0,
          points: Number(item.pendingPoints) || 0,
          lifetimePoints: Number(item.simulationPoints) || 0,
          transferredPoints: Number(item.transferredPoints) || 0,
          careerStats: {}, achievements: [],
        },
        simulationMaps: { target: 100, golden: 0, casino: 0,
          paradise: 0, penitentiary: 0, infernal: 0, allUnlocked: false },
        unlockAllEndings: { available: false, text: "玩家兼容模式不提供云端解锁" },
        unlockAllCollections: { available: false, text: "玩家兼容模式不提供云端解锁" },
      },
      life: {
        ...clone(item.life),
        timeline: { ageYears: event?.age || 33 },
        currentEvent: visibleEvent(event, item.contentMode === "15"),
        currentEnding: ending ? item.contentMode === "15" ? { ...clone(ending),
          title: "人生记录", text: "这段人生已经结束，你可以重新开始。" }
          : clone(ending) : null,
      },
      economy: economy(simulation ? Number(item.simulationPoints) || 0
        : Number(item.endgamePoints) || 0), archive,
      archiveView: { male: view("male"), female: view("female") },
      cinemaAchievements: [], endingCount: 2, endingTotal: 2,
      compatibilityMode: true, compatibilityGender: gender,
    };
  }

  async function load(store) {
    const saved = (await store.get("compat-profile"))?.value;
    return saved?.version === 1 && saved.life ? { ...profile(), ...saved }
      : profile();
  }

  async function save(store, item) {
    item.authorityVersion += 1; await store.put("compat-profile", item);
    return item;
  }
  async function invoke(body, store) {
    const item = await load(store);
    const method = String(body?.method || "sync");
    if (method === "sync") return snapshot(item);
    if (method === "operationStatus") return {
      ...snapshot(item), operationProcessed: false, operationPending: false,
    };
    if (method === "selectContentMode") {
      const mode = body.contentMode === "15" ? "15" : "18";
      if (item.contentMode === "15" && mode === "18") {
        throw new Error("15+模式不能切回18+模式");
      }
      item.contentMode = mode;
      return snapshot(await save(store, item), `已选择${mode}+内容模式。`);
    }
    if (method === "selectGender") {
      if (!["male", "female"].includes(body.gender)) throw new Error("性别选择无效");
      const gameMode = LG.playerRuntimeEndgame.selectMode(body, item);
      item.life.gender = body.gender;
      item.life.gameMode = gameMode;
      return snapshot(await save(store, item), "主角已创建。");
    }
    if (method === "startSimulation") {
      if (item.life.gameMode !== "simulation") {
        item.endgameLife = clone(item.life); item.endgameArchive = clone(item.archive);
        item.archive = clone(item.simulationArchive);
      }
      item.life = body.resume && item.simulationRun ? clone(item.simulationRun) : life();
      item.life.gender = body.gender === "female" ? "female"
        : item.endgameLife?.gender || "male";
      item.life.gameMode = "simulation";
      return snapshot(await save(store, item), "人生电影院开始放映。");
    }
    if (method === "leaveSimulation") { LG.playerRuntimeEndgame.requireUnlocked(item);
      const gender = item.life.gender;
      if (item.life.gameMode === "simulation" && !item.life.endingId)
        item.simulationRun = clone(item.life);
      item.simulationArchive = clone(item.archive);
      item.archive = clone(item.endgameArchive);
      item.endgamePoints += item.pendingPoints;
      item.transferredPoints += item.pendingPoints;
      item.pendingPoints = 0;
      item.life = item.endgameLife || life();
      item.life.gender = item.life.gender || gender; item.life.gameMode = "endgame";
      item.endgameLife = null;
      return snapshot(await save(store, item), "世界征途进度已恢复。");
    }
    if (method === "restart") {
      const simulation = item.life.gameMode === "simulation";
      const gender = item.life.gender;
      item.life = life();
      if (simulation) {
        item.life.gender = gender; item.life.gameMode = "simulation";
      }
      return snapshot(await save(store, item), "新的人生已经开始。");
    }
    if (method === "choose") {
      const event = current(item);
      const choice = event?.choices?.[Number(body.choiceIndex)];
      if (!event || body.eventId !== event.id || !choice) {
        throw new Error("当前人生事件已经变化，请刷新后重试");
      }
      Object.entries(choice.delta).forEach(([key, amount]) => {
        item.life.stats[key] = Math.max(0,
          Math.min(999, Number(item.life.stats[key] || 0) + Number(amount)));
      });
      item.life.history.push({ eventId: event.id, choice: Number(body.choiceIndex) });
      item.life.step += 1;
      if (item.life.step >= events.length) {
        item.life.endingId = LG.playerRuntimeEndgame.endingId(body.choiceIndex);
        if (item.life.gameMode === "simulation") {
          item.simulationCompletions = Math.max(0,
            Number(item.simulationCompletions) || 0) + 1;
          item.simulationPoints += 10; item.pendingPoints += 10;
        }
        const key = item.life.gender === "female" ? "female" : "male";
        if (!item.archive[key].includes(item.life.endingId)) {
          item.archive[key].push(item.life.endingId);
        }
      }
      return snapshot(await save(store, item), "选择已记录。");
    }
    throw new Error("玩家兼容模式仅开放基础人生主线，云端系统需要正式发布版本。");
  }
  LG.playerRuntimeData = { invoke };
})(window.LifeGame);
