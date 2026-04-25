const STORAGE_KEY = "integration-health:open-history";

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
  if (open) set.add(connectionId);
  else set.delete(connectionId);
  writeSet(set);
}
