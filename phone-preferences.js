(function (LG) {
  const empty = () => ({ version: 1, items: {} });
  let state = empty();
  let loadPromise = null;
  let saveQueue = Promise.resolve();
  let remoteRequestId = 0;
  let summaryPromise = null;
  let summaryKey = "";
  let remote = {
    status: "idle", counts: {}, top: [], message: "",
  };

  function normalize(value) {
    const items = value?.items && typeof value.items === "object"
      ? value.items : {};
    return { version: 1, items };
  }

  async function init() {
    if (loadPromise) return loadPromise;
    loadPromise = Promise.resolve(LG.storage.loadPhonePreferences())
      .then((value) => { state = normalize(value); })
      .catch((err) => {
        console.warn("手机偏好读取失败:", err?.code, err?.message, err?.stack);
        state = empty();
      });
    return loadPromise;
  }

  function itemId(item) {
    return String(item?.id || "");
  }

  function liked(item) {
    return Boolean(state.items[itemId(item)]);
  }

  function record(item) {
    return {
      id: itemId(item),
      kind: item.kind || "image",
      title: String(item.title || "未命名内容"),
      characterId: item.characterId || "",
      updatedAt: Date.now(),
    };
  }

  async function toggle(item) {
    await init();
    const id = itemId(item);
    if (!id) return false;
    if (state.items[id]) delete state.items[id];
    else state.items[id] = record(item);
    saveQueue = saveQueue.catch(() => {})
      .then(() => LG.storage.savePhonePreferences(state));
    await saveQueue;
    return Boolean(state.items[id]);
  }

  function top(limit = 5) {
    return Object.values(state.items)
      .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
      .slice(0, limit);
  }

  function count(kind) {
    return Object.values(state.items)
      .filter((item) => !kind || item.kind === kind).length;
  }

  function remoteItem(item) {
    return {
      id: itemId(item),
      kind: ["image", "video", "character"].includes(item?.kind)
        ? item.kind : "image",
      title: String(item?.title || "未命名内容").slice(0, 80),
    };
  }

  function applyRemote(result) {
    remote = {
      status: "ready",
      counts: result?.counts && typeof result.counts === "object"
        ? result.counts : {},
      top: Array.isArray(result?.top) ? result.top.slice(0, 5) : [],
      message: "全体偏好为趋势统计，繁忙时可能略有延迟。",
    };
  }

  function remoteError(err) {
    if (err?.code === "function_not_published") {
      return "全体统计尚未发布，当前只记录你的偏好。";
    }
    if (["UNAUTHORIZED", "TOKEN_EXPIRED", "FORBIDDEN"].includes(err?.code)) {
      return "登录状态已失效，全体统计暂不可用。";
    }
    return "全体统计读取失败，当前只记录你的偏好。";
  }

  async function loadGlobal(items) {
    const invoke = window.dzmm?.fn?.invoke;
    if (!invoke) {
      remote = {
        status: "offline", counts: {}, top: [],
        message: "离线版本只显示你的本地偏好。",
      };
      return remote;
    }
    const requestItems = (items || []).map(remoteItem)
      .filter((item) => item.id);
    const requestKey = requestItems.map((item) => item.id).sort().join("|");
    if (summaryPromise && summaryKey === requestKey) return summaryPromise;
    const requestId = ++remoteRequestId;
    remote = { ...remote, status: "loading", message: "正在读取全体偏好…" };
    summaryKey = requestKey;
    const task = invoke("content-likes", {
      method: "summary",
      items: requestItems,
    }).then((result) => {
      if (requestId === remoteRequestId) applyRemote(result);
      return remote;
    }).catch((err) => {
      if (requestId === remoteRequestId) {
        remote = {
          status: "error", counts: {}, top: [], message: remoteError(err),
        };
      }
      console.warn("全体偏好读取失败:", err?.code, err?.message, err?.stack);
      return remote;
    }).finally(() => {
      if (summaryPromise === task) {
        summaryPromise = null;
        summaryKey = "";
      }
    });
    summaryPromise = task;
    return summaryPromise;
  }

  async function syncToggle(item, isLiked) {
    const invoke = window.dzmm?.fn?.invoke;
    if (!invoke) return;
    const requestId = ++remoteRequestId;
    summaryPromise = null;
    summaryKey = "";
    remote = { ...remote, status: "loading", message: "正在同步全体偏好…" };
    try {
      const result = await invoke("content-likes", {
        method: "toggle", item: remoteItem(item), liked: isLiked,
      });
      if (requestId === remoteRequestId) applyRemote(result);
    } catch (err) {
      if (requestId === remoteRequestId) {
        remote = {
          status: "error", counts: remote.counts, top: remote.top,
          message: remoteError(err),
        };
      }
      console.warn("全体偏好同步失败:", err?.code, err?.message, err?.stack);
    }
  }

  async function toggleWithGlobal(item) {
    const isLiked = await toggle(item);
    await syncToggle(item, isLiked);
    return isLiked;
  }

  LG.phonePreferences = {
    init, liked, toggle: toggleWithGlobal, top, count, loadGlobal,
    globalState: () => remote,
    globalCount: (item) => Math.max(0,
      Number(remote.counts[itemId(item)]) || 0),
    ready: () => Boolean(loadPromise),
  };
})(window.LifeGame);
