(function () {
  const DB_NAME = "disordered-life-offline";
  const DB_VERSION = 1;
  const STORE = "records";
  let connection;

  function open() {
    if (connection) return connection;
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return connection;
  }

  async function transact(mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      try {
        result = action(store);
      } catch (error) {
        reject(error);
        return;
      }
      tx.oncomplete = () => resolve(result?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  const recordId = (scope, key) => `${scope}:${key}`;

  window.OfflineDB = {
    async get(scope, key) {
      const id = recordId(scope, key);
      const value = await transact("readonly", (store) => store.get(id));
      return value?.value ?? null;
    },
    put(scope, key, value) {
      return transact("readwrite", (store) =>
        store.put({ id: recordId(scope, key), scope, key, value }));
    },
    delete(scope, key) {
      return transact("readwrite", (store) => store.delete(recordId(scope, key)));
    },
    async dump() {
      const records = await transact("readonly", (store) => store.getAll());
      return { version: 1, records: records || [] };
    },
    async restore(payload) {
      const records = Array.isArray(payload?.records) ? payload.records : [];
      await transact("readwrite", (store) => store.clear());
      for (const record of records) {
        if (!record?.id || typeof record.scope !== "string") continue;
        await transact("readwrite", (store) => store.put(record));
      }
    },
    clear() {
      return transact("readwrite", (store) => store.clear());
    },
  };
})();
