(function (LG) {
  const target = 10;
  let data;
  let saveQueue = Promise.resolve();

  function today() {
    const authorityDate = LG.authority?.snapshot?.()?.serverDate;
    if (authorityDate) return authorityDate;
    const date = new Date();
    const part = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`;
  }

  function seedValue(text) {
    return [...text].reduce((value, char) =>
      Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  }

  function shuffled(values, seed) {
    const next = [...values];
    let value = seed;
    for (let index = next.length - 1; index > 0; index -= 1) {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      const swap = value % (index + 1);
      [next[index], next[swap]] = [next[swap], next[index]];
    }
    return next;
  }

  function characterTask(character) {
    const name = LG.COLLECTIBLE_CHARACTERS[character].name;
    return {
      id: `dom-${character}`,
      type: "domination",
      character,
      title: `沉迷于${name}的支配`,
      content: `在人生中选择被${name}支配`,
      target,
      reward: 20,
      progress: 0,
      claimed: false,
    };
  }

  function travelTask(country) {
    return {
      id: `travel-${country === "日本" ? "japan" : "usa"}`,
      type: "travel",
      country,
      title: `爱上${country}生活`,
      content: `在人生选择中去${country}留学`,
      target,
      reward: 30,
      progress: 0,
      claimed: false,
    };
  }

  function createDaily(date) {
    const ids = shuffled(Object.keys(LG.COLLECTIBLE_CHARACTERS), seedValue(date)).slice(0, 18);
    return { version: 1, date, tasks: [...ids.map(characterTask), travelTask("日本"), travelTask("美国")] };
  }

  function normalize(saved) {
    const date = today();
    if (!saved || saved.date !== date || !Array.isArray(saved.tasks)) return createDaily(date);
    const fresh = createDaily(date);
    const previous = Object.fromEntries(saved.tasks.map((task) => [task.id, task]));
    fresh.tasks.forEach((task) => {
      const old = previous[task.id];
      task.progress = Math.min(target, Math.max(0, Number(old?.progress) || 0));
      task.claimed = Boolean(old?.claimed);
    });
    return fresh;
  }

  LG.dailyTasks = {
    async init() {
      data = normalize(await LG.storage.loadDailyTasks());
    },
    all() {
      if (data.date !== today()) data = createDaily(today());
      return data.tasks;
    },
    record(eventId, choice) {
      const updates = [];
      const scene = LG.dialogueScenes.get(eventId);
      const controlled = Number(choice.delta?.dependence) > 0
        && Number(choice.delta?.autonomy) < 0;
      this.all().forEach((task) => {
        const matchesCharacter = task.type === "domination" && controlled
          && scene?.character === task.character;
        const matchesTravel = task.type === "travel"
          && choice.studyDestination?.country === task.country;
        if ((!matchesCharacter && !matchesTravel) || task.progress >= task.target) return;
        task.progress += 1;
        updates.push(task);
      });
      return updates;
    },
    progressText(updates) {
      return updates.length
        ? updates.map((task) => `任务进度：${task.title} ${task.progress}/${task.target}`).join("\n")
        : "";
    },
    claim(taskId) {
      const task = this.all().find((entry) => entry.id === taskId);
      if (!task || task.claimed || task.progress < task.target) return null;
      task.claimed = true;
      LG.traits.addPoints(task.reward);
      return { task, total: LG.traits.points() };
    },
    save() {
      saveQueue = saveQueue.catch(() => {}).then(() => LG.storage.saveDailyTasks(data));
      return saveQueue;
    },
  };
})(window.LifeGame);
