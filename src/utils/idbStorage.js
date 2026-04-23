// ============================================================
// idbStorage — IndexedDB wrapper for LexRise save data
// ============================================================
// Used as a backup layer alongside localStorage.
// If iOS evicts localStorage, this copy survives.
//
// API:
//   idbSave(data)   → Promise<void>
//   idbLoad()       → Promise<object|null>
//   idbClear()      → Promise<void>
// ============================================================

const DB_NAME    = 'lexrise';
const DB_VERSION = 1;
const STORE_NAME = 'savedata';
const KEY        = 'save';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

export async function idbSave(data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.put(data, KEY);
      req.onsuccess = () => resolve();
      req.onerror   = (e) => reject(e.target.error);
    });
  } catch (err) {
    // IndexedDB unavailable (private browsing, etc.) — fail silently
    console.warn('[LexRise] IDB save failed:', err);
  }
}

export async function idbLoad() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(KEY);
      req.onsuccess = (e) => resolve(e.target.result ?? null);
      req.onerror   = (e) => reject(e.target.error);
    });
  } catch {
    return null;
  }
}

export async function idbClear() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(KEY);
      tx.oncomplete = () => resolve();
    });
  } catch {
    // ignore
  }
}

// ── Request persistent storage from the browser ─────────────
// On iOS: when the app is installed as a PWA and this is called,
// the browser may grant persistent storage — meaning data will
// NOT be evicted after 7 days of inactivity.
// Returns true if granted, false if denied or unsupported.
export async function requestPersistentStorage() {
  if (!navigator?.storage?.persist) return false;
  try {
    const granted = await navigator.storage.persist();
    if (import.meta.env.DEV) {
      if (granted) {
        console.log('[LexRise] Persistent storage granted ✓');
      } else {
        console.log('[LexRise] Persistent storage not granted — using fallback');
      }
    }
    return granted;
  } catch {
    return false;
  }
}

// Check if persistent storage is currently granted
export async function isStoragePersistent() {
  if (!navigator?.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}
