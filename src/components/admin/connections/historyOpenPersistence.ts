const STORAGE_KEY = "integration-health:open-history";
const LAST_KEY = "integration-health:last-opened";

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // noop
  }
}

export function isHistoryOpenPersisted(connectionId: string): boolean {
  return readSet().has(connectionId);
}

export function setHistoryOpenPersisted(connectionId: string, open: boolean): void {
  const set = readSet();
  if (open) {
    set.add(connectionId);
    try {
      localStorage.setItem(LAST_KEY, connectionId);
    } catch {
      // noop
    }
  } else {
    set.delete(connectionId);
    try {
      const last = localStorage.getItem(LAST_KEY);
      if (last === connectionId) localStorage.removeItem(LAST_KEY);
    } catch {
      // noop
    }
  }
  writeSet(set);
}

export function getLastOpenedConnectionId(): string | null {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

